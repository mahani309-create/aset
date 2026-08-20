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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useToast } from "../../contexts/ToastContext";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { ScannerModal } from "../shared/ScannerModal";

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

export function Sidebar() {
  const location = useLocation();
  const toast = useToast();
  const { logout } = useAuth();

  return (
    <div className="hidden print:hidden border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl md:flex flex-col w-72 h-screen fixed top-0 left-0 z-40">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 px-6">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary-950 dark:text-white">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>Sarpras SMP</span>
        </div>
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
        <div className="mb-4 px-3 flex flex-col pt-2 border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
            Dikembangkan Oleh
          </span>
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
            Khabibu Rohman
          </span>
        </div>
        <button
          onClick={() => {
            toast("Berhasil keluar.", "success");
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  );
}

import { useTheme } from "../../contexts/ThemeContext";

export function Header() {
  const toast = useToast();
  const { assets, rooms } = useData();
  const { themeMode, setThemeMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    <header className="sticky print:hidden top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-6">
      <div className="w-full flex-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/assets?q=${encodeURIComponent(searchQuery)}`);
              setIsDropdownOpen(false);
            }
          }}
        >
          <div className="relative flex items-center max-w-full sm:w-80 lg:w-96" ref={dropdownRef}>
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
              className="w-full appearance-none bg-slate-100/50 dark:bg-slate-800/50 pl-9 pr-20 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
            <div className="absolute right-1 flex items-center">
              <button
                type="button"
                onClick={startVoiceSearch}
                className={cn("p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  isListening ? "text-primary-600 bg-primary-50 animate-pulse" : "text-slate-600 hover:text-primary-600"
                )}
                title="Pencarian Suara"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="text-slate-600 hover:text-primary-600 bg-transparent p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Scan Barcode/QR Code"
              >
                <ScanLine className="h-4 w-4" />
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
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
          className="p-2 text-slate-600 hover:text-primary-600 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
          title="Ganti Tema (Gelap/Terang)"
        >
          {themeMode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={() => toast("Belum ada notifikasi baru", "info")}
          className="relative p-2 text-slate-600 hover:text-slate-700 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-[3px] right-[5px] h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div
          className="h-9 w-9 ml-1 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center cursor-pointer hover:bg-primary-200 shadow-sm"
          onClick={() => toast("Mode edit profil admin", "info")}
        >
          <span className="text-sm font-bold text-primary-700">A</span>
        </div>
      </div>
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </header>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
      <Sidebar />
      <div className="flex flex-col md:pl-72 print:pl-0 w-full">
        <Header />
        
        {isOffline && (
          <div className="bg-amber-500 text-white w-full px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50 shadow-md">
            <WifiOff className="h-4 w-4" />
            Mode Offline: Aplikasi berjalan di luar jaringan. Beberapa fitur mungkin tidak tersinkronisasi.
          </div>
        )}

        <main className="flex-1 space-y-4 p-4 sm:p-8 pt-6 print:p-0 print:pt-0 w-full max-w-[100vw] sm:max-w-7xl mx-auto print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
