import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { useToast } from "./ToastContext";
import {
  DriveFolderInfo,
  DriveFileInfo,
  DriveSnapshotInfo,
  getOrCreateDatabaseFolder,
  findDatabaseFile,
  readDatabaseFromGoogleDrive,
  saveDatabaseToGoogleDrive,
  createDriveSnapshot,
  listDriveSnapshots,
} from "../lib/googleDriveDatabase";
import { createGoogleSheetsBackup } from "../lib/googleSheets";

interface GoogleDriveContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  folderInfo: DriveFolderInfo | null;
  dbFileInfo: DriveFileInfo | null;
  snapshots: DriveSnapshotInfo[];
  autoSync: boolean;
  setAutoSync: (enabled: boolean) => void;
  connectDrive: (forcePrompt?: boolean) => Promise<boolean>;
  syncNow: () => Promise<boolean>;
  pullFromDrive: () => Promise<boolean>;
  createSnapshotBackup: (note?: string) => Promise<boolean>;
  restoreSnapshotById: (fileId: string) => Promise<boolean>;
  exportToSheets: () => Promise<string | null>;
  loadSnapshots: () => Promise<void>;
  disconnectDrive: () => void;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

const AUTO_SYNC_KEY = "sarpras_gdrive_auto_sync";
const LAST_SYNC_KEY = "sarpras_gdrive_last_synced";
const FOLDER_ID_KEY = "sarpras_gdrive_folder_info";
const DB_FILE_ID_KEY = "sarpras_gdrive_db_file_info";

export function GoogleDriveProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, ensureAccessToken, setAccessToken, loginWithGoogle } = useAuth();
  const dataContext = useData();
  const toast = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  });

  const [autoSync, setAutoSyncState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTO_SYNC_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [folderInfo, setFolderInfo] = useState<DriveFolderInfo | null>(() => {
    try {
      const stored = localStorage.getItem(FOLDER_ID_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [dbFileInfo, setDbFileInfo] = useState<DriveFileInfo | null>(() => {
    try {
      const stored = localStorage.getItem(DB_FILE_ID_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [snapshots, setSnapshots] = useState<DriveSnapshotInfo[]>([]);

  const isConnected = !!accessToken && !!folderInfo;

  const setAutoSync = (enabled: boolean) => {
    setAutoSyncState(enabled);
    localStorage.setItem(AUTO_SYNC_KEY, String(enabled));
  };

  // Helper to persist folder & file info
  const updateFolderInfo = (info: DriveFolderInfo | null) => {
    setFolderInfo(info);
    if (info) {
      localStorage.setItem(FOLDER_ID_KEY, JSON.stringify(info));
    } else {
      localStorage.removeItem(FOLDER_ID_KEY);
    }
  };

  const updateDbFileInfo = (info: DriveFileInfo | null) => {
    setDbFileInfo(info);
    if (info) {
      localStorage.setItem(DB_FILE_ID_KEY, JSON.stringify(info));
    } else {
      localStorage.removeItem(DB_FILE_ID_KEY);
    }
  };

  const recordSyncSuccess = () => {
    const now = new Date();
    setLastSyncedAt(now);
    setSyncError(null);
    localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
  };

  // Connect or Initialize Google Drive
  const connectDrive = useCallback(
    async (forcePrompt: boolean = false): Promise<boolean> => {
      try {
        setIsConnecting(true);
        setSyncError(null);

        let token = accessToken;
        if (!token || forcePrompt) {
          const loginRes = await loginWithGoogle(forcePrompt);
          if (!loginRes.success) {
            if (loginRes.code === "auth/popup-closed-by-user") {
              toast("Koneksi Google Drive dibatalkan.", "info");
              return false;
            }
            throw new Error(loginRes.message || loginRes.code || "Gagal masuk ke akun Google");
          }
          token = loginRes.token || null;
        }

        if (!token) {
          throw new Error("Token autentikasi Google tidak ditemukan.");
        }

        // 1. Get or create folder
        const folder = await getOrCreateDatabaseFolder(token);
        updateFolderInfo(folder);

        // 2. Look for existing database file
        const dbFile = await findDatabaseFile(token, folder.id);
        if (dbFile) {
          updateDbFileInfo(dbFile);
        }

        toast("Google Drive terhubung sebagai Master Database!", "success");
        return true;
      } catch (err: any) {
        console.error("Google Drive connection error:", err);
        const errMsg = err.message === "UNAUTHORIZED_TOKEN_EXPIRED"
          ? "Sesi Google telah kedaluwarsa. Silakan hubungkan ulang."
          : err.message || "Gagal menghubungkan Google Drive";
        setSyncError(errMsg);
        toast(errMsg, "error");
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [accessToken, loginWithGoogle, toast]
  );

  // Sync current application state to Google Drive
  const syncNow = useCallback(async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const token = await ensureAccessToken();
      if (!token) {
        throw new Error("Silakan hubungkan Google Drive terlebih dahulu.");
      }

      // Ensure folder exists
      let currentFolder = folderInfo;
      if (!currentFolder) {
        currentFolder = await getOrCreateDatabaseFolder(token);
        updateFolderInfo(currentFolder);
      }

      // Save database payload
      const fullData = dataContext.getFullDatabase();
      const updatedFile = await saveDatabaseToGoogleDrive(
        token,
        fullData,
        currentFolder.id,
        dbFileInfo?.id
      );

      updateDbFileInfo(updatedFile);
      recordSyncSuccess();
      toast("Database berhasil disinkronkan ke Google Drive!", "success");
      return true;
    } catch (err: any) {
      console.error("Sync to Google Drive error:", err);
      if (err.message === "UNAUTHORIZED_TOKEN_EXPIRED") {
        setAccessToken(null);
        setSyncError("Sesi Google kedaluwarsa. Klik untuk menghubungkan ulang.");
        toast("Sesi Google Drive kedaluwarsa. Silakan hubungkan ulang.", "error");
      } else {
        const msg = err.message || "Gagal menyinkronkan data ke Google Drive";
        setSyncError(msg);
        toast(msg, "error");
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [ensureAccessToken, folderInfo, dbFileInfo, dataContext, toast, setAccessToken]);

  // Pull latest database from Google Drive
  const pullFromDrive = useCallback(async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const token = await ensureAccessToken();
      if (!token) {
        throw new Error("Silakan hubungkan Google Drive terlebih dahulu.");
      }

      let currentFolder = folderInfo;
      if (!currentFolder) {
        currentFolder = await getOrCreateDatabaseFolder(token);
        updateFolderInfo(currentFolder);
      }

      const file = await findDatabaseFile(token, currentFolder.id);
      if (!file) {
        toast("Belum ada file database master di folder Google Drive.", "info");
        return false;
      }

      const payload = await readDatabaseFromGoogleDrive(token, file.id);
      dataContext.importFullDatabase(payload);
      updateDbFileInfo(file);
      recordSyncSuccess();
      toast("Data berhasil diperbarui dari Google Drive!", "success");
      return true;
    } catch (err: any) {
      console.error("Pull from Google Drive error:", err);
      const msg = err.message === "UNAUTHORIZED_TOKEN_EXPIRED"
        ? "Sesi Google kedaluwarsa. Silakan masuk kembali."
        : err.message || "Gagal menarik data dari Google Drive";
      setSyncError(msg);
      toast(msg, "error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [ensureAccessToken, folderInfo, dataContext, toast]);

  // Create timestamped snapshot backup in Google Drive
  const createSnapshotBackup = useCallback(
    async (note?: string): Promise<boolean> => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        const token = await ensureAccessToken();
        if (!token) {
          throw new Error("Silakan hubungkan Google Drive terlebih dahulu.");
        }

        let currentFolder = folderInfo;
        if (!currentFolder) {
          currentFolder = await getOrCreateDatabaseFolder(token);
          updateFolderInfo(currentFolder);
        }

        const fullData = dataContext.getFullDatabase();
        await createDriveSnapshot(token, fullData, currentFolder.id, note);

        toast("Snapshot cadangan berhasil dibuat di Google Drive!", "success");
        // Reload list
        const updatedList = await listDriveSnapshots(token, currentFolder.id);
        setSnapshots(updatedList);
        return true;
      } catch (err: any) {
        console.error("Snapshot error:", err);
        const msg = err.message || "Gagal membuat snapshot cadangan";
        setSyncError(msg);
        toast(msg, "error");
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [ensureAccessToken, folderInfo, dataContext, toast]
  );

  // Restore from a specific snapshot in Google Drive
  const restoreSnapshotById = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        const token = await ensureAccessToken();
        if (!token) {
          throw new Error("Silakan hubungkan Google Drive terlebih dahulu.");
        }

        const payload = await readDatabaseFromGoogleDrive(token, fileId);
        dataContext.importFullDatabase(payload);

        // Also update master db file with this restored payload
        if (folderInfo) {
          await saveDatabaseToGoogleDrive(token, payload, folderInfo.id, dbFileInfo?.id);
        }

        recordSyncSuccess();
        toast("Data berhasil dipulihkan dari snapshot Google Drive!", "success");
        return true;
      } catch (err: any) {
        console.error("Restore snapshot error:", err);
        const msg = err.message || "Gagal memulihkan snapshot";
        setSyncError(msg);
        toast(msg, "error");
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [ensureAccessToken, folderInfo, dbFileInfo, dataContext, toast]
  );

  // Export to Google Sheets
  const exportToSheets = useCallback(async (): Promise<string | null> => {
    try {
      setIsSyncing(true);
      const token = await ensureAccessToken();
      if (!token) {
        throw new Error("Silakan hubungkan akun Google terlebih dahulu.");
      }

      const fullData = dataContext.getFullDatabase();
      const sheetUrl = await createGoogleSheetsBackup(token, fullData);
      toast("Laporan Google Sheets berhasil diekspor ke Google Drive!", "success");
      return sheetUrl;
    } catch (err: any) {
      console.error("Export sheets error:", err);
      toast("Gagal mengekspor ke Google Sheets.", "error");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [ensureAccessToken, dataContext, toast]);

  // Load snapshots list
  const loadSnapshots = useCallback(async () => {
    if (!accessToken || !folderInfo) return;
    try {
      const list = await listDriveSnapshots(accessToken, folderInfo.id);
      setSnapshots(list);
    } catch (err) {
      console.error("Failed to load snapshots:", err);
    }
  }, [accessToken, folderInfo]);

  const disconnectDrive = () => {
    setFolderInfo(null);
    setDbFileInfo(null);
    setAccessToken(null);
    localStorage.removeItem(FOLDER_ID_KEY);
    localStorage.removeItem(DB_FILE_ID_KEY);
    toast("Koneksi Google Drive Master Database berhasil dilepas.", "info");
  };

  // Initial check: if we have an accessToken and folderInfo, verify or find master db file
  useEffect(() => {
    if (accessToken && folderInfo && !dbFileInfo) {
      findDatabaseFile(accessToken, folderInfo.id)
        .then((file) => {
          if (file) updateDbFileInfo(file);
        })
        .catch(() => {});
    }
  }, [accessToken, folderInfo, dbFileInfo]);

  // Debounced auto-sync when data changes
  const isInitialMount = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip the very first render mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!autoSync || !accessToken || !folderInfo) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const fullData = dataContext.getFullDatabase();
        const updatedFile = await saveDatabaseToGoogleDrive(
          accessToken,
          fullData,
          folderInfo.id,
          dbFileInfo?.id
        );
        updateDbFileInfo(updatedFile);
        recordSyncSuccess();
      } catch (err) {
        console.warn("Background auto-sync failed:", err);
      }
    }, 4000); // 4-second debounce to batch rapid edits

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    dataContext.assets,
    dataContext.rooms,
    dataContext.consumables,
    dataContext.procurements,
    dataContext.borrowings,
    dataContext.mutations,
    dataContext.maintenances,
    dataContext.stocktakes,
    dataContext.disposals,
    dataContext.schoolProfile,
    autoSync,
    accessToken,
    folderInfo,
    dbFileInfo?.id,
  ]);

  return (
    <GoogleDriveContext.Provider
      value={{
        isConnected,
        isConnecting,
        isSyncing,
        lastSyncedAt,
        syncError,
        folderInfo,
        dbFileInfo,
        snapshots,
        autoSync,
        setAutoSync,
        connectDrive,
        syncNow,
        pullFromDrive,
        createSnapshotBackup,
        restoreSnapshotById,
        exportToSheets,
        loadSnapshots,
        disconnectDrive,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
}

export function useGoogleDrive() {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error("useGoogleDrive must be used within GoogleDriveProvider");
  }
  return context;
}
