import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  DoorClosed,
  Wrench,
  Settings,
  LogOut,
  Search,
  Bell,
  FileBarChart,
  Box,
  ShoppingCart,
  ArrowRightLeft,
  RefreshCw,
  ClipboardCheck,
  TrendingDown,
  Trash2,
  ScanLine,
  Sun,
  Moon,
  WifiOff,
  Mic,
  HardDrive,
  Cloud,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useToast } from "../../contexts/ToastContext";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useGoogleDrive } from "../../contexts/GoogleDriveContext";
import { ScannerModal } from "../shared/ScannerModal";
import { GoogleDriveManagerModal } from "../shared/GoogleDriveManagerModal";

const navGroups = [
  {
    title: "Utama",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Master Data",
    items: [
      { name: "Aset Tetap (KIB)", href: "/assets", icon: Package },
      { name: "Ruangan (KIR)", href: "/rooms", icon: DoorClosed },
      { name: "Habis Pakai", href: "/consumables", icon: Box },
    ],
  },
  {
    title: "Sirkulasi & Logistik",
    items: [
      { name: "Pengadaan", href: "/procurement", icon: ShoppingCart },
      { name: "Peminjaman", href: "/borrowing", icon: ArrowRightLeft },
      { name: "Mutasi Aset", href: "/mutation", icon: RefreshCw },
    ],
  },
  {
    title: "Kondisi & Nilai",
    items: [
      { name: "Pemeliharaan", href: "/maintenance", icon: Wrench },
      { name: "Stok Opname", href: "/stocktake", icon: ClipboardCheck },
      { name: "Penyusutan", href: "/depreciation", icon: TrendingDown },
      { name: "Penghapusan", href: "/disposal", icon: Trash2 },
    ],
  },
  {
    title: "Sistem",
    items: [
      { name: "Laporan", href: "/reports", icon: FileBarChart },
      { name: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const toast = useToast();
  const { logout, adminUser } = useAuth();
  const { schoolProfile } = useData();
  const appIcon = schoolProfile.logoAplikasi || schoolProfile.logoSekolah || "/icon.svg";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 print:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6">
          <div className="flex items-center gap-3 font-bold text-lg tracking-tight text-primary-950 dark:text-white">
            <div className="h-9 w-9 flex items-center justify-center shrink-0">
              <img src={appIcon} alt="Logo Aplikasi" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-base font-extrabold">Sarpras SMP</span>
              <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wider uppercase">Master Cloud</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6 px-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-700">
              {group.title}
            </h3>
            <nav className="grid items-start gap-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm font-medium",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary-600" : "text-slate-600",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="mb-3">
          <button
            type="button"
            onClick={() => {
              onClose?.();
              window.dispatchEvent(new CustomEvent("open-gdrive-manager"));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 transition-all text-xs text-left group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                <HardDrive className="h-3.5 w-3.5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 dark:text-slate-200">Google Drive DB</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Master Database Cloud</p>
              </div>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>

        {/* Current Logged-in Admin User Info */}
        <div className="mb-3 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {adminUser?.username?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {adminUser?.username || "admin"}
              </p>
              <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 text-[9px] font-bold rounded">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Akun Administrator</p>
          </div>
        </div>

        <div className="mb-3 px-3 flex flex-col pt-1 border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">
            Dikembangkan Oleh
          </span>
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
            Khabibu Rohman
          </span>
        </div>
        <button
          onClick={() => {
            toast("Berhasil keluar dari akun admin.", "success");
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
    </>
  );
}

import { useTheme } from "../../contexts/ThemeContext";

export function Header() {
  const toast = useToast();
  const { assets, rooms } = useData();
  const { themeMode, setThemeMode } = useTheme();
  const { adminUser } = useAuth();
  const { isConnected, isConnecting, isSyncing, lastSyncedAt } = useGoogleDrive();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenDrive = () => setIsDriveModalOpen(true);
    window.addEventListener("open-gdrive-manager", handleOpenDrive);
    return () => window.removeEventListener("open-gdrive-manager", handleOpenDrive);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast("Browser Anda tidak mendukung pencarian suara.", "error");
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast("Mendengarkan... Silakan bicara.", "info");
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsDropdownOpen(true);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const searchResults = {
    assets: assets
      .filter(
        (a) =>
          a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5),
    rooms: rooms
      .filter((r) => r.nama.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3),
  };
  const hasResults =
    searchResults.assets.length > 0 || searchResults.rooms.length > 0;

  return (
    <header className="sticky print:hidden top-0 z-30 flex h-14 md:h-16 items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-3 sm:px-6">
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-md lg:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/assets?q=${encodeURIComponent(searchQuery)}`);
              setIsDropdownOpen(false);
            }
          }}
        >
          <div className="relative flex items-center w-full" ref={dropdownRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600 pointer-events-none" />
            <input
              type="search"
              placeholder="Cari aset atau ruangan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full appearance-none bg-slate-100/50 dark:bg-slate-800/50 pl-9 pr-16 sm:pr-20 py-1.5 md:py-2 rounded-lg text-xs md:text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
            <div className="absolute right-1 flex items-center">
              <button
                type="button"
                onClick={startVoiceSearch}
                className={cn("p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  isListening ? "text-primary-600 bg-primary-50 animate-pulse" : "text-slate-600 hover:text-primary-600"
                )}
                title="Pencarian Suara"
              >
                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="text-slate-600 hover:text-primary-600 bg-transparent p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Scan Barcode/QR Code"
              >
                <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {isDropdownOpen && searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-80 lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                {hasResults ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.assets.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-xs font-semibold text-slate-700 uppercase">
                          Aset
                        </div>
                        {searchResults.assets.map((asset) => (
                          <div
                            key={asset.id}
                            onClick={() => {
                              navigate(
                                `/assets?q=${encodeURIComponent(asset.kodeBarang)}`,
                              );
                              setSearchQuery("");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                          >
                            <Package className="h-4 w-4 text-primary-600" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {asset.nama}
                              </div>
                              <div className="text-xs text-slate-700">
                                {asset.kodeBarang}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.assets.length > 0 &&
                      searchResults.rooms.length > 0 && (
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                      )}

                    {searchResults.rooms.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-xs font-semibold text-slate-700 uppercase">
                          Ruangan
                        </div>
                        {searchResults.rooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => {
                              navigate(
                                `/rooms?q=${encodeURIComponent(room.nama)}`,
                              );
                              setSearchQuery("");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                          >
                            <DoorClosed className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {room.nama}
                              </div>
                              <div className="text-xs text-slate-700">
                                Penanggung Jawab: {room.penanggungJawab}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-700">
                    Tidak ditemukan hasil untuk "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
        {/* Google Drive Master DB Quick Button */}
        <button
          type="button"
          onClick={() => setIsDriveModalOpen(true)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap",
            isConnected
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
              : isConnecting
              ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse"
              : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200"
          )}
          title={
            isConnected
              ? `Google Drive Master DB: Tersinkron (${lastSyncedAt ? lastSyncedAt.toLocaleTimeString("id-ID") : "Aktif"})`
              : isConnecting
              ? "Sedang menghubungkan ke Google Drive..."
              : "Klik untuk menghubungkan Google Drive Master Database"
          }
        >
          <HardDrive
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              isConnected ? "text-emerald-600" : isConnecting ? "text-amber-600" : "text-slate-500",
              (isSyncing || isConnecting) && "animate-spin text-emerald-600"
            )}
          />
          <span className="whitespace-nowrap font-medium">
            {isConnecting ? (
              "Menghubungkan..."
            ) : isSyncing ? (
              "Menyinkronkan..."
            ) : isConnected ? (
              "Drive DB"
            ) : (
              <>
                <span className="hidden sm:inline">Hubungkan Drive</span>
                <span className="sm:hidden">Drive</span>
              </>
            )}
          </span>
          <span className="relative flex h-2 w-2 shrink-0">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isConnected ? (isSyncing ? "bg-amber-400" : "bg-emerald-500") : isConnecting ? "bg-amber-500" : "bg-slate-400"
              )}
            ></span>
          </span>
        </button>

        <button
          onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
          className="p-1.5 sm:p-2 text-slate-600 hover:text-primary-600 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
          title="Ganti Tema (Gelap/Terang)"
        >
          {themeMode === "dark" ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>
        <button
          onClick={() => toast("Belum ada notifikasi baru", "info")}
          className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-700 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-[2px] right-[2px] sm:top-[3px] sm:right-[5px] h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div
          className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-primary-100 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 flex items-center justify-center cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900 transition-all shadow-sm shrink-0"
          title={`Masuk sebagai ${adminUser?.username || "admin"}. Klik untuk Pengaturan.`}
          onClick={() => navigate("/settings")}
        >
          <span className="text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300">
            {adminUser?.username?.[0]?.toUpperCase() || "A"}
          </span>
        </div>
      </div>
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      <GoogleDriveManagerModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} />
    </header>
  );
}

function BottomNav({ onMenuClick, onScanClick }: { onMenuClick: () => void, onScanClick: () => void }) {
  const location = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-40 px-1 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around w-full h-[56px]">
        <Link to="/" className={cn("flex flex-col items-center gap-0.5 p-1 text-[9px] font-semibold transition-colors flex-1", location.pathname === '/' ? "text-primary-600" : "text-slate-500 hover:text-slate-900")}>
          <LayoutDashboard className="h-[18px] w-[18px]" />
          <span>Beranda</span>
        </Link>
        <Link to="/assets" className={cn("flex flex-col items-center gap-0.5 p-1 text-[9px] font-semibold transition-colors flex-1", location.pathname === '/assets' || location.pathname === '/rooms' ? "text-primary-600" : "text-slate-500 hover:text-slate-900")}>
          <Package className="h-[18px] w-[18px]" />
          <span>Aset</span>
        </Link>
        
        {/* Floating Center Button */}
        <div className="relative -top-4 flex-1 flex justify-center">
          <button 
            onClick={onScanClick}
            className="h-12 w-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 border-[3px] border-slate-50 dark:border-slate-950 active:scale-95 transition-transform"
          >
            <ScanLine className="h-5 w-5" />
          </button>
        </div>

        <Link to="/borrowing" className={cn("flex flex-col items-center gap-0.5 p-1 text-[9px] font-semibold transition-colors flex-1", location.pathname === '/borrowing' || location.pathname === '/procurement' ? "text-primary-600" : "text-slate-500 hover:text-slate-900")}>
          <ArrowRightLeft className="h-[18px] w-[18px]" />
          <span>Sirkulasi</span>
        </Link>
        <button onClick={onMenuClick} className={cn("flex flex-col items-center gap-0.5 p-1 text-[9px] font-semibold transition-colors flex-1", ['/settings', '/reports', '/maintenance'].includes(location.pathname) ? "text-primary-600" : "text-slate-500 hover:text-slate-900")}>
          <Menu className="h-[18px] w-[18px]" />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileScannerOpen, setIsMobileScannerOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 print:bg-white w-full flex text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-col md:pl-72 print:pl-0 w-full min-w-0 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <Header />
        
        {isOffline && (
          <div className="bg-amber-500 text-white w-full px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50 shadow-md">
            <WifiOff className="h-4 w-4" />
            Mode Offline: Aplikasi berjalan di luar jaringan. Beberapa fitur mungkin tidak tersinkronisasi.
          </div>
        )}

        <main className="flex-1 space-y-4 p-3 sm:p-6 md:p-8 pt-4 md:pt-6 print:p-0 print:pt-0 w-full max-w-[100vw] sm:max-w-7xl mx-auto print:max-w-none">
          {children}
        </main>
      </div>
      
      <BottomNav 
        onMenuClick={() => setIsMobileMenuOpen(true)} 
        onScanClick={() => setIsMobileScannerOpen(true)} 
      />
      
      <ScannerModal isOpen={isMobileScannerOpen} onClose={() => setIsMobileScannerOpen(false)} />
    </div>
  );
}
