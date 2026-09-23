// Google Drive REST API v3 Client for SIM Sarpras SMP Master Database

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink: string;
  description?: string;
}

export interface DriveSnapshotInfo {
  id: string;
  name: string;
  timestamp: string;
  sizeBytes: number;
  webViewLink: string;
  note?: string;
}

export interface MasterDatabasePayload {
  version: string;
  appName: string;
  npsn: string;
  lastUpdated: string;
  exportedBy?: string;
  schoolProfile: any;
  assets: any[];
  rooms: any[];
  consumables: any[];
  procurements: any[];
  borrowings: any[];
  mutations: any[];
  maintenances: any[];
  stocktakes: any[];
  disposals: any[];
}

const ROOT_FOLDER_NAME = "SIM Sarpras SMP - Database & Arsip";
const DB_FILE_NAME = "sim_sarpras_db.json";
const MULTIPART_BOUNDARY = "SIM_SARPRAS_DRIVE_BOUNDARY_v1";

/**
 * Helper to execute authorized requests with error handling
 */
async function driveFetch(url: string, token: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED_TOKEN_EXPIRED");
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Google Drive API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response;
}

/**
 * Get or create the dedicated root folder in Google Drive
 */
export async function getOrCreateDatabaseFolder(token: string): Promise<DriveFolderInfo> {
  // 1. Search for existing folder
  const query = `name = '${ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&spaces=drive`;

  const searchRes = await driveFetch(searchUrl, token);
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    const folder = searchData.files[0];
    return {
      id: folder.id,
      name: folder.name,
      webViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    };
  }

  // 2. Folder doesn't exist, create it
  const createUrl = "https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink";
  const createRes = await driveFetch(createUrl, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: ROOT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      description: "Folder database master, cadangan otomatis, dan arsip sistem SIM Sarpras SMP",
    }),
  });

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    name: newFolder.name,
    webViewLink: newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`,
  };
}

/**
 * Find the primary database file (sim_sarpras_db.json) inside the database folder
 */
export async function findDatabaseFile(token: string, folderId: string): Promise<DriveFileInfo | null> {
  const query = `'${folderId}' in parents and name = '${DB_FILE_NAME}' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,modifiedTime,createdTime,webViewLink,description)&spaces=drive`;

  const res = await driveFetch(searchUrl, token);
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    const file = data.files[0];
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      description: file.description,
    };
  }

  return null;
}

/**
 * Read and parse the database JSON file from Google Drive
 */
export async function readDatabaseFromGoogleDrive(token: string, fileId: string): Promise<MasterDatabasePayload> {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await driveFetch(downloadUrl, token);
  const json = await res.json();
  return json as MasterDatabasePayload;
}

/**
 * Save / update the live database JSON file in Google Drive
 */
export async function saveDatabaseToGoogleDrive(
  token: string,
  fullData: any,
  folderId: string,
  existingFileId?: string
): Promise<DriveFileInfo> {
  const payload: MasterDatabasePayload = {
    version: "2.0.0",
    appName: "SIM Sarpras SMP",
    npsn: fullData.schoolProfile?.npsn || "20202020",
    lastUpdated: new Date().toISOString(),
    exportedBy: fullData.schoolProfile?.operator || "Operator Sarpras",
    schoolProfile: fullData.schoolProfile || {},
    assets: fullData.assets || [],
    rooms: fullData.rooms || [],
    consumables: fullData.consumables || [],
    procurements: fullData.procurements || [],
    borrowings: fullData.borrowings || [],
    mutations: fullData.mutations || [],
    maintenances: fullData.maintenances || [],
    stocktakes: fullData.stocktakes || [],
    disposals: fullData.disposals || [],
  };

  const jsonString = JSON.stringify(payload, null, 2);

  // If existing file ID is provided or exists, update it via PATCH
  let targetFileId = existingFileId;
  if (!targetFileId) {
    const existing = await findDatabaseFile(token, folderId);
    if (existing) {
      targetFileId = existing.id;
    }
  }

  if (targetFileId) {
    // Update existing file content
    const patchUrl = `https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media&fields=id,name,size,modifiedTime,webViewLink`;
    const patchRes = await driveFetch(patchUrl, token, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonString,
    });

    const updated = await patchRes.json();
    return {
      id: updated.id,
      name: updated.name,
      size: updated.size,
      modifiedTime: updated.modifiedTime,
      webViewLink: updated.webViewLink || `https://drive.google.com/file/d/${updated.id}/view`,
    };
  } else {
    // Create new file via multipart upload
    const metadata = {
      name: DB_FILE_NAME,
      parents: [folderId],
      description: "Master Database JSON SIM Sarpras SMP",
      mimeType: "application/json",
    };

    const multipartBody =
      `--${MULTIPART_BOUNDARY}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${MULTIPART_BOUNDARY}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${jsonString}\r\n` +
      `--${MULTIPART_BOUNDARY}--`;

    const createUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,modifiedTime,webViewLink`;
    const createRes = await driveFetch(createUrl, token, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${MULTIPART_BOUNDARY}`,
      },
      body: multipartBody,
    });

    const created = await createRes.json();
    return {
      id: created.id,
      name: created.name,
      size: created.size,
      modifiedTime: created.modifiedTime,
      webViewLink: created.webViewLink || `https://drive.google.com/file/d/${created.id}/view`,
    };
  }
}

/**
 * Create a timestamped backup snapshot in Google Drive (e.g. backup_sarpras_2026-09-21_120000.json)
 */
export async function createDriveSnapshot(
  token: string,
  fullData: any,
  folderId: string,
  customNote?: string
): Promise<DriveFileInfo> {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const snapshotFileName = `backup_sarpras_${dateStr}.json`;

  const payload: MasterDatabasePayload = {
    version: "2.0.0",
    appName: "SIM Sarpras SMP",
    npsn: fullData.schoolProfile?.npsn || "20202020",
    lastUpdated: now.toISOString(),
    exportedBy: fullData.schoolProfile?.operator || "Operator Sarpras",
    schoolProfile: fullData.schoolProfile || {},
    assets: fullData.assets || [],
    rooms: fullData.rooms || [],
    consumables: fullData.consumables || [],
    procurements: fullData.procurements || [],
    borrowings: fullData.borrowings || [],
    mutations: fullData.mutations || [],
    maintenances: fullData.maintenances || [],
    stocktakes: fullData.stocktakes || [],
    disposals: fullData.disposals || [],
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const metadata = {
    name: snapshotFileName,
    parents: [folderId],
    description: customNote ? `Snapshot Cadangan: ${customNote}` : "Snapshot Cadangan Database Sarpras",
    mimeType: "application/json",
  };

  const multipartBody =
    `--${MULTIPART_BOUNDARY}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${MULTIPART_BOUNDARY}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonString}\r\n` +
    `--${MULTIPART_BOUNDARY}--`;

  const createUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,modifiedTime,createdTime,webViewLink,description`;
  const createRes = await driveFetch(createUrl, token, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${MULTIPART_BOUNDARY}`,
    },
    body: multipartBody,
  });

  const created = await createRes.json();
  return {
    id: created.id,
    name: created.name,
    size: created.size,
    createdTime: created.createdTime,
    modifiedTime: created.modifiedTime,
    webViewLink: created.webViewLink || `https://drive.google.com/file/d/${created.id}/view`,
    description: created.description,
  };
}

/**
 * List all backup snapshots stored in the Google Drive folder
 */
export async function listDriveSnapshots(token: string, folderId: string): Promise<DriveSnapshotInfo[]> {
  const query = `'${folderId}' in parents and name contains 'backup_sarpras_' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&pageSize=30&fields=files(id,name,size,createdTime,modifiedTime,webViewLink,description)&spaces=drive`;

  const res = await driveFetch(listUrl, token);
  const data = await res.json();

  if (!data.files) return [];

  return data.files.map((f: any) => ({
    id: f.id,
    name: f.name,
    timestamp: f.createdTime || f.modifiedTime || new Date().toISOString(),
    sizeBytes: parseInt(f.size || "0", 10),
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    note: f.description || "",
  }));
}
