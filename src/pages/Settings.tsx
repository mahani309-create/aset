import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Building2, Users, Database, Globe, Bell, Shield, Download, Upload, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useData } from "../contexts/DataContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("sistem");
  const toast = useToast();
  const { schoolProfile, setSchoolProfile } = useData();
  const { themeColor, setThemeColor, themeMode, setThemeMode, themeStyle, setThemeStyle, uiScale, setUiScale, fontColor, setFontColor } = useTheme();
  
  // Profil State mapped to Context
  const profil = schoolProfile;
  const setProfil = (newProfile: any) => {
    setSchoolProfile((prev: any) => ({...prev, ...newProfile}));
  };

  // Sistem State
  const [sistem, setSistem] = useState({
    bahasa: "id",
    zonaWaktu: "Asia/Jakarta",
    formatTanggal: "DD/MM/YYYY",
    itemPerHalaman: "10"
  });

  // Notif State
  const [notif, setNotif] = useState({
    emailAsetBaru: true,
    emailRusak: true,
    emailPinjam: false,
    waNotif: false,
    browserNotif: true
  });

  const tabs = [
    { id: "profil", name: "Profil Sekolah", icon: Building2 },
    { id: "users", name: "Pengguna & Akses", icon: Users },
    { id: "sistem", name: "Preferensi Sistem", icon: Globe },
    { id: "notif", name: "Notifikasi Cerdas", icon: Bell },
    { id: "backup", name: "Backup & Restore", icon: Database },
    { id: "keamanan", name: "Keamanan", icon: Shield },
  ];

  const handleAction = (msg: string, type: 'info'|'success'|'error' = 'info') => toast(msg, type);

  const saveProfil = () => {
    // In real app, save to context/backend
    handleAction("Profil sekolah berhasil disimpan", "success");
  };

  const saveSistem = () => {
    handleAction("Preferensi sistem berhasil disimpan", "success");
  };

  const saveNotif = () => {
    handleAction("Pengaturan notifikasi berhasil disimpan", "success");
  };

  const saveKeamanan = () => {
    handleAction("Pengaturan keamanan berhasil diperbarui", "success");
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ backup: true, date: new Date() }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "backup_sarpras_" + new Date().getTime() + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    handleAction("File backup berhasil diunduh.", "success");
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.sql';
    input.onchange = (e) => {
      // simulate restore
      setTimeout(() => {
        handleAction("Data berhasil dipulihkan dari file backup.", "success");
      }, 1000);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Pengaturan Sistem</h2>
        <p className="text-slate-700">Konfigurasi menyeluruh aplikasi sarana dan prasarana.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-64 shrink-0 overflow-hidden">
          <div className="p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-600'}`} />
                {tab.name}
              </button>
            ))}
          </div>
        </Card>
        <div className="flex-1 w-full">
          <Card>
            <CardHeader className="border-b border-slate-300 bg-slate-50/50">
              <CardTitle className="text-lg">{tabs.find(t => t.id === activeTab)?.name}</CardTitle>
              <CardDescription>
                {activeTab === "profil" && "Informasi instansi yang akan dipakai pada kop laporan PDF / cetakan KIR."}
                {activeTab === "users" && "Kelola pengguna, operator, dan hak akses aplikasi."}
                {activeTab === "sistem" && "Pengaturan bahasa, waktu, dan preferensi tampilan."}
                {activeTab === "notif" && "Atur notifikasi kapan dan kemana akan dikirimkan."}
                {activeTab === "backup" && "Impor/Ekspor seluruh database agar aman jika ada masalah."}
                {activeTab === "keamanan" && "Ubah kata sandi dan pengaturan keamanan akun."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {activeTab === "profil" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">Nama Kementerian / Dinas Pelindung</label>
                      <input 
                        type="text" 
                        value={profil.kementerian}
                        onChange={(e) => setProfil({ kementerian: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Nama Sekolah</label>
                      <input 
                        type="text" 
                        value={profil.nama}
                        onChange={(e) => setProfil({ nama: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">NPSN</label>
                      <input 
                        type="text" 
                        value={profil.npsn}
                        onChange={(e) => setProfil({ npsn: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Telepon</label>
                      <input 
                        type="text" 
                        value={profil.telepon}
                        onChange={(e) => setProfil({ telepon: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Email</label>
                      <input 
                        type="email" 
                        value={profil.email}
                        onChange={(e) => setProfil({ email: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Website</label>
                      <input 
                        type="text" 
                        value={profil.website}
                        onChange={(e) => setProfil({ website: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Kode Pos</label>
                      <input 
                        type="text" 
                        value={profil.kodePos}
                        onChange={(e) => setProfil({ kodePos: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">Alamat Lengkap</label>
                      <textarea 
                        value={profil.alamat}
                        onChange={(e) => setProfil({ alamat: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm h-24 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Nama Kepala Sekolah</label>
                      <input 
                        type="text" 
                        value={profil.kepalaSekolah}
                        onChange={(e) => setProfil({ kepalaSekolah: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">NIP Kepala Sekolah</label>
                      <input 
                        type="text" 
                        value={profil.nipKepsek}
                        onChange={(e) => setProfil({ nipKepsek: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Nama Operator / Sarpras</label>
                      <input 
                        type="text" 
                        value={profil.operator}
                        onChange={(e) => setProfil({ operator: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">NIP Operator</label>
                      <input 
                        type="text" 
                        value={profil.nipOperator}
                        onChange={(e) => setProfil({ nipOperator: e.target.value })}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">Logo Dinas (Opsional)</label>
                      <div className="flex items-center gap-4">
                        {profil.logoDinas && (
                          <div className="w-16 h-16 rounded border border-slate-300 overflow-hidden flex items-center justify-center bg-white shrink-0">
                            <img src={profil.logoDinas} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfil({ logoDinas: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={saveProfil}>Simpan Perubahan Profil</Button>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Daftar Pengguna</h3>
                    <Button onClick={() => handleAction("Form tambah pengguna dibuka", "info")}>
                      <Plus className="h-4 w-4 mr-2" /> Tambah Pengguna
                    </Button>
                  </div>
                  <div className="overflow-x-auto border border-slate-300 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                          <th className="px-4 py-3 font-semibold">Email</th>
                          <th className="px-4 py-3 font-semibold">Peran (Role)</th>
                          <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {[
                          {name: "Admin System", email: "admin@smpbelajar.id", role: "Super Admin"},
                          {name: "Ibu Mahani", email: "mahani.309@admin.smp.belajar.id", role: "Operator Sarpras"},
                          {name: "Bpk. H. Ahmad Sudirman", email: "kepsek@smpbelajar.id", role: "Kepala Sekolah (Read Only)"},
                        ].map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 bg-white">
                            <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                            <td className="px-4 py-3 text-slate-700">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center space-x-2">
                              <Button variant="outline" size="sm" className="h-8 px-2 text-slate-700 hover:bg-slate-50" onClick={() => handleAction("Edit pengguna", "info")}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-rose-600 hover:bg-rose-50 border-rose-200" onClick={() => handleAction("Hapus pengguna", "error")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "sistem" && (
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Bahasa Antarmuka</label>
                      <select 
                        value={sistem.bahasa}
                        onChange={(e) => setSistem({...sistem, bahasa: e.target.value})}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English (US)</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Zona Waktu</label>
                      <select 
                        value={sistem.zonaWaktu}
                        onChange={(e) => setSistem({...sistem, zonaWaktu: e.target.value})}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      >
                        <option value="Asia/Jakarta">WIB - Asia/Jakarta</option>
                        <option value="Asia/Makassar">WITA - Asia/Makassar</option>
                        <option value="Asia/Jayapura">WIT - Asia/Jayapura</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Format Tanggal Defaults</label>
                      <select 
                        value={sistem.formatTanggal}
                        onChange={(e) => setSistem({...sistem, formatTanggal: e.target.value})}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Item per Halaman (Tabel)</label>
                      <select 
                        value={sistem.itemPerHalaman}
                        onChange={(e) => setSistem({...sistem, itemPerHalaman: e.target.value})}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      >
                        <option value="10">10 Item</option>
                        <option value="25">25 Item</option>
                        <option value="50">50 Item</option>
                        <option value="100">100 Item</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-6"></div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Personalisasi Antarmuka</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900">Ukuran Tampilan (Zoom)</label>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {[
                              { id: "small", name: "Kecil" },
                              { id: "medium", name: "Normal" },
                              { id: "large", name: "Besar" },
                              { id: "extra-large", name: "Ekstra Besar" }
                            ].map((scale) => (
                              <button
                                key={scale.id}
                                onClick={() => setUiScale(scale.id as any)}
                                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center transition-all ${uiScale === scale.id ? "bg-slate-800 text-white border-slate-900 shadow-sm dark:bg-primary-600 dark:border-primary-700 dark:text-primary-foreground" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"}`}
                              >
                                {scale.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900">Mode Layar</label>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {[
                              { id: "light", name: "Terang" },
                              { id: "dark", name: "Gelap" },
                              { id: "sepia", name: "Sepia (Light)" },
                              { id: "latte", name: "Latte (Light)" },
                              { id: "kopi", name: "Kopi (Light)" },
                              { id: "solarized-light", name: "Solarized (Light)" },
                              { id: "autumn", name: "Autumn (Warm Light)" },
                              { id: "cotton", name: "Cotton (Soft Light)" },
                              { id: "sakura", name: "Sakura (Pink Light)" },
                              { id: "mint", name: "Mint (Green Light)" },
                              { id: "parchment", name: "Parchment (Aged Light)" },
                              { id: "frost", name: "Frost (Cool Light)" },
                              { id: "sunlight", name: "Sunlight (Bright Warm)" },
                              { id: "midnight", name: "Midnight (Dark)" },
                              { id: "oled", name: "OLED (Dark)" },
                              { id: "dim", name: "Dim (Dark)" },
                              { id: "hacker", name: "Terminal (Dark)" },
                              { id: "cyberblue", name: "Neon Blue (Dark)" },
                              { id: "nord", name: "Nord (Cool Dark)" },
                              { id: "gruvbox", name: "Gruvbox (Retro Dark)" },
                              { id: "monokai", name: "Monokai (Vibrant Dark)" },
                              { id: "dracula-mode", name: "Dracula (Purple Dark)" },
                              { id: "solarized-dark", name: "Solarized (Dark)" },
                              { id: "matrix", name: "Matrix (Hacker Green)" },
                              { id: "synthwave", name: "Synthwave (Neon Dark)" },
                              { id: "oceanic", name: "Oceanic (Blue Dark)" }
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() => setThemeMode(mode.id as any)}
                                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center transition-all ${themeMode === mode.id ? "bg-slate-800 text-white border-slate-900 shadow-sm dark:bg-primary-600 dark:border-primary-700 dark:text-primary-foreground" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"}`}
                              >
                                {mode.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900">Gaya Tampilan Keseluruhan</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "modern", name: "Modern" },
                              { id: "elegan", name: "Elegan" },
                              { id: "ceria", name: "Ceria" },
                              { id: "brutalist", name: "Brutalist" },
                              { id: "cyberpunk", name: "Cyberpunk" },
                              { id: "glassmorphism", name: "Glassmorphism" },
                              { id: "retro", name: "Retro UI" },
                              { id: "minimalist", name: "Minimalis" },
                              { id: "neo-brutalism", name: "Neo-Brutalism" },
                              { id: "skumorphism", name: "Skeuomorphism" },
                              { id: "futuristik", name: "Futuristik AI" }
                            ].map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setThemeStyle(style.id as any)}
                                className={`py-2 px-3 text-sm font-medium rounded-lg border flex items-center justify-center transition-all ${themeStyle === style.id ? "bg-primary-50 text-primary-700 border-primary-500" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
                              >
                                {style.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-900">Warna Teks (Font Base Color)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {[
                              { id: "slate", name: "Standar (Slate)" },
                              { id: "gray", name: "Abu-abu (Gray)" },
                              { id: "zinc", name: "Seng (Zinc)" },
                              { id: "neutral", name: "Netral" },
                              { id: "stone", name: "Batu (Stone)" },
                              { id: "blue", name: "Biru" },
                              { id: "rose", name: "Merah (Rose)" },
                              { id: "emerald", name: "Hijau (Emerald)" },
                              { id: "amber", name: "Kuning (Amber)" },
                              { id: "violet", name: "Ungu (Violet)" }
                            ].map((fc) => (
                              <button
                                key={fc.id}
                                onClick={() => setFontColor(fc.id as any)}
                                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center transition-all ${fontColor === fc.id ? "bg-slate-800 text-white border-slate-900 shadow-sm dark:bg-primary-600 dark:border-primary-700 dark:text-primary-foreground" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"}`}
                              >
                                {fc.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Warna Aksen Utama</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "indigo", color: "bg-indigo-600", name: "Klasik" },
                            { id: "blue", color: "bg-blue-600", name: "Laut" },
                            { id: "emerald", color: "bg-emerald-600", name: "Hutan" },
                            { id: "rose", color: "bg-rose-600", name: "Mawar" },
                            { id: "violet", color: "bg-violet-600", name: "Malam" },
                            { id: "amber", color: "bg-amber-500", name: "Senja" },
                            { id: "cyan", color: "bg-cyan-500", name: "Siber" },
                            { id: "slate", color: "bg-slate-700", name: "Monokrom" },
                            { id: "teal", color: "bg-teal-500", name: "Zamrud" },
                            { id: "fuchsia", color: "bg-fuchsia-500", name: "Fuchsia" },
                            { id: "pink", color: "bg-pink-500", name: "Merah Muda" },
                            { id: "orange", color: "bg-orange-500", name: "Jeruk" },
                            { id: "lime", color: "bg-lime-500", name: "Jeruk Nipis" },
                            { id: "zinc", color: "bg-zinc-500", name: "Logam" },
                            { id: "neon", color: "bg-[#ccff00]", name: "Neon" },
                            { id: "gold", color: "bg-yellow-500", name: "Emas" },
                            { id: "ocean", color: "bg-sky-600", name: "Samudra" },
                            { id: "forest", color: "bg-green-700", name: "Rimba" },
                            { id: "lavender", color: "bg-purple-400", name: "Lavender" },
                            { id: "cherry", color: "bg-red-600", name: "Ceri" },
                            { id: "coffee", color: "bg-stone-600", name: "Kopi" },
                            { id: "dracula", color: "bg-[#282a36]", name: "Drakula" },
                            { id: "sapphire", color: "bg-blue-800", name: "Safir" },
                            { id: "ruby", color: "bg-rose-800", name: "Delima" },
                            { id: "sunset", color: "bg-orange-600", name: "Matahari Terbenam" },
                            { id: "galaxy", color: "bg-indigo-900", name: "Galaksi" }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setThemeColor(theme.id as any)}
                              className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${themeColor === theme.id ? "ring-2 ring-primary-500 ring-offset-2 scale-110" : "hover:scale-110 border border-slate-300"}`}
                              title={theme.name}
                            >
                              <span className={`w-full h-full rounded-full ${theme.color} opacity-90 shadow-sm transition-opacity group-hover:opacity-100`}></span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-6"></div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Aplikasi Komputer (PWA)</h3>
                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-primary-900">Instal Aplikasi Secara Offline</p>
                        <p className="text-xs text-primary-700 mt-1">Gunakan sistem ini seperti aplikasi desktop (bisa diakses tanpa internet setelah data tersimpan).</p>
                      </div>
                      <Button onClick={() => {
                        handleAction("Mencoba install aplikasi.. Jika tidak muncul, pastikan browser Anda mendukung instalasi PWA atau klik ikon install di URL bar browser Anda.", "info");
                        const event = (window as any).deferredPrompt;
                        if (event) {
                          event.prompt();
                          event.userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') {
                                handleAction('Berhasil diinstal!', 'success');
                            }
                            (window as any).deferredPrompt = null;
                          });
                        }
                      }}>
                        <Download className="h-4 w-4 mr-2" /> Instal Sekarang
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 mt-6">
                    <Button onClick={saveSistem}>Simpan Preferensi</Button>
                  </div>
                </div>
              )}

              {activeTab === "notif" && (
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={notif.emailAsetBaru} onChange={(e) => setNotif({...notif, emailAsetBaru: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Pencatatan Aset Baru</p>
                          <p className="text-xs text-slate-700">Kirim email saat ada aset baru yang didaftarkan.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={notif.emailRusak} onChange={(e) => setNotif({...notif, emailRusak: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Laporan Kerusakan</p>
                          <p className="text-xs text-slate-700">Kirim email saat ada keluhan kerusakan aset dilaporkan.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={notif.emailPinjam} onChange={(e) => setNotif({...notif, emailPinjam: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Peminjaman Aset</p>
                          <p className="text-xs text-slate-700">Kirim email saat ada aset yang dipinjam atau dikembalikan.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200 my-6"></div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Notifikasi Lainnya</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={notif.browserNotif} onChange={(e) => setNotif({...notif, browserNotif: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Web Push Notification</p>
                          <p className="text-xs text-slate-700">Tampilkan notifikasi di browser Anda.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={notif.waNotif} onChange={(e) => setNotif({...notif, waNotif: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-slate-700 focus:ring-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">WhatsApp Notification</p>
                          <p className="text-xs text-slate-700">Integrasi WhatsApp (Memerlukan API Terpisah).</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={saveNotif}>Simpan Pengaturan Notifikasi</Button>
                  </div>
                </div>
              )}

              {activeTab === "backup" && (
                <div className="space-y-6 max-w-2xl">
                   <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-3 items-start">
                     <AlertCircleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                       <p className="text-sm text-amber-800 font-semibold">Pencadangan Data Sangat Penting!</p>
                       <p className="text-xs text-amber-700">Lakukan pencadangan (backup) secara rutin untuk mencegah kehilangan KIB. Data yang direstore akan menimpa seluruh data yang ada saat ini.</p>
                     </div>
                   </div>
                   
                   <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border border-slate-300 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-300">
                          <CardTitle className="text-base text-primary-900 flex items-center gap-2">
                            <Download className="h-5 w-5 text-primary-600" /> Ekspor Database
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <p className="text-sm text-slate-700">Unduh seluruh data aset, ruangan, pemeliharaan ke dalam file format JSON/SQL.</p>
                          <Button className="w-full" onClick={handleBackup}>
                            <Download className="h-4 w-4 mr-2" /> Download Backup
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-slate-300 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-300">
                          <CardTitle className="text-base text-rose-900 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-rose-500" /> Restore Database
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <p className="text-sm text-slate-700">Pulihkan data dari file backup sebelumnya. <strong className="text-rose-600">Peringatan:</strong> Data saat ini akan diganti.</p>
                          <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50" onClick={handleRestore}>
                            <Upload className="h-4 w-4 mr-2" /> Pilih File Backup
                          </Button>
                        </CardContent>
                      </Card>
                   </div>
                </div>
              )}

              {activeTab === "keamanan" && (
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Ubah Kata Sandi</h3>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Kata Sandi Saat Ini</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Kata Sandi Baru</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                      <p className="text-xs text-slate-700">Minimal 8 karakter, kombinasi huruf dan angka.</p>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Konfirmasi Kata Sandi Baru</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                      />
                    </div>
                    <div className="pt-2">
                      <Button onClick={saveKeamanan}>Perbarui Kata Sandi</Button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-6"></div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Keamanan Sesi</h3>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-900">Batas Waktu Sesi (Timeout)</label>
                      <select 
                        defaultValue="120"
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      >
                        <option value="15">15 Menit</option>
                        <option value="30">30 Menit</option>
                        <option value="60">1 Jam</option>
                        <option value="120">2 Jam</option>
                        <option value="240">4 Jam</option>
                        <option value="never">Jangan Pernah Logout</option>
                      </select>
                      <p className="text-xs text-slate-700">Otomatis logout saat tidak ada aktivitas.</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 my-6"></div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 text-rose-600">Zona Bahaya</h3>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-200/50">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-rose-900">Hapus Akun & Seluruh Data</p>
                          <p className="text-xs text-rose-700 mt-1">Tindakan ini tidak dapat dibatalkan. Seluruh data aset dan pengaturan akan hilang selamanya.</p>
                        </div>
                        <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-100 whitespace-nowrap" onClick={() => handleAction("Fungsi ini dinonaktifkan di mode demo", "error")}>
                          Hapus Permanen
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
