import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";
import { Package, Search, Send, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";

export default function PortalPeminjaman() {
  const { assets, borrowings, setBorrowings } = useData();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<"ajukan" | "status">("ajukan");
  
  // State for check status
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof borrowings>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAjukan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      peminjam: formData.get('peminjam'),
      nipPeminjam: formData.get('nipPeminjam'),
      kontakPeminjam: formData.get('kontakPeminjam'),
      unitKerja: formData.get('unitKerja'),
      keperluan: formData.get('keperluan'),
      keterangan: formData.get('keterangan'),
      kondisiPinjam: 'Sesuai kondisi aset',
      assetId: formData.get('assetId'),
      tanggalPinjam: formData.get('tanggalPinjam'),
      rencanaTanggalKembali: formData.get('rencanaTanggalKembali'),
      status: 'Menunggu Persetujuan', // default
    };

    setBorrowings(prev => [...prev, { id: `BRW-${Date.now()}`, ...data }]);
    toast("Pengajuan peminjaman berhasil dikirim. Silakan cek status secara berkala.", 'success');
    (e.target as HTMLFormElement).reset();
    setActiveTab("status");
    setSearchQuery(data.peminjam);
    handleSearchStatus(data.peminjam);
  };

  const handleSearchStatus = (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    const results = borrowings.filter(b => 
      b.peminjam.toLowerCase().includes(query.toLowerCase()) || 
      (b.kontakPeminjam && b.kontakPeminjam.includes(query)) ||
      b.id.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime());
    
    setSearchResults(results);
    setHasSearched(true);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Menunggu Persetujuan": return <Clock className="w-5 h-5 text-blue-500" />;
      case "Dipinjam": return <CheckCircle className="w-5 h-5 text-amber-500" />;
      case "Dikembalikan": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "Terlambat": return <XCircle className="w-5 h-5 text-rose-500" />;
      case "Ditolak": return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return null;
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case "Menunggu Persetujuan": return "info";
      case "Dipinjam": return "warning";
      case "Dikembalikan": return "success";
      case "Terlambat": return "destructive";
      case "Ditolak": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Portal Peminjaman Aset</h1>
            <p className="text-sm text-slate-500">Sistem Informasi Inventaris Sekolah</p>
          </div>
        </div>
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("ajukan")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'ajukan' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Ajukan Peminjaman
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'status' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Cek Status Pengajuan
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "ajukan" ? (
              <form onSubmit={handleAjukan} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Form Pengajuan Peminjaman</h2>
                  <p className="text-sm text-slate-600 mb-6">Lengkapi data berikut untuk mengajukan peminjaman aset sekolah.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input name="peminjam" required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Misal: Budi Santoso" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">NIP / NIS <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input name="nipPeminjam" type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Masukkan NIP / NIS jika ada" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Kontak (No. HP/WA) <span className="text-rose-500">*</span></label>
                    <input name="kontakPeminjam" required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="08123456789" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Unit Kerja / Kelas <span className="text-rose-500">*</span></label>
                    <input name="unitKerja" required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Misal: Kelas VII-A / Guru Olahraga" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Pilih Aset yang Dipinjam <span className="text-rose-500">*</span></label>
                  <select name="assetId" required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white">
                    <option value="">Pilih aset yang tersedia...</option>
                    {assets.filter(a => a.kondisi !== "Rusak Berat").map(a => <option key={a.id} value={a.id}>{a.nama} ({a.kodeBarang})</option>)}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Rencana Tanggal Pinjam <span className="text-rose-500">*</span></label>
                    <input name="tanggalPinjam" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Rencana Tanggal Kembali <span className="text-rose-500">*</span></label>
                    <input name="rencanaTanggalKembali" required type="date" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Keperluan <span className="text-rose-500">*</span></label>
                  <textarea name="keperluan" required rows={3} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" placeholder="Jelaskan secara singkat keperluan peminjaman aset ini..."></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Send className="w-4 h-4" />
                    Kirim Pengajuan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Cek Status Pengajuan</h2>
                  <p className="text-sm text-slate-600 mb-6">Pantau status persetujuan peminjaman aset Anda di sini.</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchStatus()}
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      placeholder="Masukkan Nama, No. HP, atau ID Pengajuan..."
                    />
                  </div>
                  <button 
                    onClick={() => handleSearchStatus()}
                    className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    Cari
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  {hasSearched && searchResults.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <Search className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-900 font-medium">Data Tidak Ditemukan</p>
                      <p className="text-slate-500 text-sm mt-1">Pastikan nama atau kontak yang Anda masukkan benar.</p>
                    </div>
                  )}

                  {searchResults.map((borrow) => {
                    const asset = assets.find(a => a.id === borrow.assetId);
                    return (
                      <div key={borrow.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              {getStatusIcon(borrow.status)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-0.5">ID: {borrow.id}</p>
                              <h3 className="font-bold text-slate-900">{borrow.peminjam}</h3>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(borrow.status)} className="px-3 py-1 text-sm font-medium self-start sm:self-auto">
                            {borrow.status}
                          </Badge>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-500 block mb-1">Barang yang Dipinjam</span>
                            <span className="font-semibold text-slate-900">{asset ? asset.nama : "Tidak diketahui"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1">Tgl Pinjam &bull; Rencana Kembali</span>
                            <span className="font-medium text-slate-900">
                              {new Date(borrow.tanggalPinjam).toLocaleDateString("id-ID")} - {borrow.rencanaTanggalKembali ? new Date(borrow.rencanaTanggalKembali).toLocaleDateString("id-ID") : "?"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-500 block mb-1">Keperluan</span>
                            <span className="text-slate-900">{borrow.keperluan}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
