import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";
import { Package, Search, Send, Clock, CheckCircle, XCircle, ArrowRight, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";

export default function PortalPeminjaman() {
  const { assets, borrowings, setBorrowings, schoolProfile } = useData();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<"ajukan" | "status">("ajukan");
  
  // State for check status
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof borrowings>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDurasiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const durasi = parseInt(e.target.value) || 0;
    const tglPinjam = (document.getElementById('tanggalPinjam') as HTMLInputElement)?.value;
    if (durasi > 0 && tglPinjam) {
      const date = new Date(tglPinjam);
      date.setDate(date.getDate() + durasi);
      const kembaliEl = document.getElementById('rencanaTanggalKembali') as HTMLInputElement;
      if (kembaliEl) {
        kembaliEl.value = date.toISOString().split('T')[0];
      }
    }
  };

  const handleTglPinjamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const durasiEl = document.getElementById('durasi') as HTMLInputElement;
    if (durasiEl && durasiEl.value) {
      handleDurasiChange(durasiEl as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleAjukan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      peminjam: formData.get('peminjam'),
      nipPeminjam: formData.get('nipPeminjam'),
      kontakPeminjam: formData.get('kontakPeminjam'),
      alamat: formData.get('alamat'),
      jabatan: formData.get('jabatan'),
      unitKerja: formData.get('unitKerja'),
      penanggungJawab: formData.get('penanggungJawab'),
      lokasiPenggunaan: formData.get('lokasiPenggunaan'),
      keperluan: formData.get('keperluan'),
      keterangan: formData.get('keterangan'),
      kondisiPinjam: 'Sesuai kondisi aset',
      assetId: formData.get('assetId'),
      jumlah: parseInt(formData.get('jumlah') as string) || 1,
      durasi: formData.get('durasi'),
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
    <div className="min-h-screen bg-slate-50/50 flex flex-col relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />

      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${schoolProfile.logoAplikasi || schoolProfile.logoSekolah ? 'bg-transparent' : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20'}`}>
            {schoolProfile.logoAplikasi || schoolProfile.logoSekolah ? (
              <img src={schoolProfile.logoAplikasi || schoolProfile.logoSekolah} alt="App Icon" className="h-full w-full object-contain" />
            ) : (
              <Package className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Portal Peminjaman</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inventaris Sekolah</p>
          </div>
        </div>
        <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-all bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow active:scale-95">
          Login Admin <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            Layanan Peminjaman Aset <br className="hidden sm:block" /> {schoolProfile.nama}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Ajukan peminjaman fasilitas dan inventaris sekolah dengan mudah. Pantau status pengajuan Anda secara real-time.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("ajukan")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'ajukan' 
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Send className="w-4 h-4" />
              Ajukan Peminjaman
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'status' 
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Cek Status Pengajuan
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 border border-white p-6 sm:p-10">
          {activeTab === "ajukan" ? (
              <form onSubmit={handleAjukan} className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Form Pengajuan Peminjaman</h2>
                  <p className="text-sm text-slate-500">Lengkapi data berikut untuk mengajukan peminjaman aset sekolah.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input name="peminjam" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Misal: Budi Santoso" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">NIP / NIS / NISN <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input name="nipPeminjam" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Masukkan NIP / NIS jika ada" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Jabatan / Status <span className="text-rose-500">*</span></label>
                    <select name="jabatan" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Pilih status...</option>
                      <option value="Guru">Guru</option>
                      <option value="Staf / Karyawan">Staf / Karyawan</option>
                      <option value="Siswa">Siswa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Unit Kerja / Kelas <span className="text-rose-500">*</span></label>
                    <input name="unitKerja" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Misal: Kelas VII-A / Guru Olahraga" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Kontak (No. HP/WA) <span className="text-rose-500">*</span></label>
                    <input name="kontakPeminjam" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="08123456789" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Penanggung Jawab <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input name="penanggungJawab" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Nama Guru/Wali Kelas (jika siswa)" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Alamat Lengkap <span className="text-rose-500">*</span></label>
                    <textarea name="alamat" required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" placeholder="Masukkan alamat lengkap peminjam"></textarea>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Pilih Aset yang Dipinjam <span className="text-rose-500">*</span></label>
                    <select name="assetId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Pilih aset yang tersedia...</option>
                      {assets.filter(a => a.kondisi !== "Rusak Berat").map(a => <option key={a.id} value={a.id}>{a.nama} ({a.kodeBarang})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Jumlah <span className="text-rose-500">*</span></label>
                    <input name="jumlah" required type="number" min="1" defaultValue="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Rencana Tanggal Pinjam <span className="text-rose-500">*</span></label>
                    <input name="tanggalPinjam" id="tanggalPinjam" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" onChange={handleTglPinjamChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Lama Peminjaman (Hari) <span className="text-rose-500">*</span></label>
                    <input name="durasi" id="durasi" required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Contoh: 3" onChange={handleDurasiChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Rencana Tanggal Kembali <span className="text-rose-500">*</span></label>
                    <input name="rencanaTanggalKembali" id="rencanaTanggalKembali" required type="date" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none text-slate-500" readOnly />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Lokasi Penggunaan Barang <span className="text-rose-500">*</span></label>
                    <input name="lokasiPenggunaan" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Contoh: Ruang Kelas 7A, Aula Utama, dll." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Keperluan <span className="text-rose-500">*</span></label>
                    <textarea name="keperluan" required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" placeholder="Jelaskan secara singkat keperluan peminjaman aset ini..."></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20">
                    Kirim Pengajuan
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Cek Status Pengajuan</h2>
                  <p className="text-sm text-slate-500">Pantau status persetujuan peminjaman aset Anda di sini.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchStatus()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      placeholder="Masukkan Nama, No. HP, atau ID Pengajuan..."
                    />
                  </div>
                  <button 
                    onClick={() => handleSearchStatus()}
                    className="px-8 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-md"
                  >
                    Cari Data
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  {hasSearched && searchResults.length === 0 && (
                    <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-900 font-bold text-lg">Data Tidak Ditemukan</p>
                      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Pastikan nama lengkap, nomor HP, atau ID Pengajuan yang Anda masukkan sudah benar.</p>
                    </div>
                  )}

                  {searchResults.map((borrow) => {
                    const asset = assets.find(a => a.id === borrow.assetId);
                    return (
                      <div key={borrow.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                              {getStatusIcon(borrow.status)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">ID: {borrow.id}</p>
                              <h3 className="font-extrabold text-slate-900 text-lg">{borrow.peminjam}</h3>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(borrow.status)} className="px-4 py-1.5 text-sm font-bold self-start sm:self-auto rounded-lg shadow-sm">
                            {borrow.status}
                          </Badge>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                          <div className="sm:col-span-2 lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Barang</span>
                            <span className="font-bold text-slate-900 text-base">{asset ? asset.nama : "Tidak diketahui"}</span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Jumlah</span>
                            <span className="font-bold text-slate-900 text-base">{borrow.jumlah || 1} <span className="text-sm font-medium text-slate-500">unit</span></span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Durasi</span>
                            <span className="font-bold text-slate-900 text-base">{borrow.durasi ? borrow.durasi : '-'} <span className="text-sm font-medium text-slate-500">Hari</span></span>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Periode Pinjam</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {new Date(borrow.tanggalPinjam).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} 
                              <span className="text-slate-400 mx-2">s.d.</span> 
                              {borrow.rencanaTanggalKembali ? new Date(borrow.rencanaTanggalKembali).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "?"}
                            </span>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-4 mt-2 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Lokasi Penggunaan</span>
                                <span className="font-semibold text-slate-900">{borrow.lokasiPenggunaan || '-'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Penanggung Jawab</span>
                                <span className="font-semibold text-slate-900">{borrow.penanggungJawab || borrow.peminjam}</span>
                              </div>
                              <div className="sm:col-span-2 mt-2">
                                <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Alamat Peminjam</span>
                                <p className="text-slate-700 leading-relaxed">{borrow.alamat || '-'}</p>
                              </div>
                              <div className="sm:col-span-2 mt-2">
                                <span className="text-slate-500 block mb-1 text-xs font-bold uppercase tracking-wider">Keperluan</span>
                                <p className="text-slate-700 leading-relaxed">{borrow.keperluan}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                          <Link 
                            to={`/cetak-bukti/${borrow.id}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                          >
                            <Printer className="w-4 h-4" /> Cetak Bukti Pengajuan
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
