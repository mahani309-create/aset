import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { DataActions } from "../components/shared/DataActions";
import { useData } from "../contexts/DataContext";
import { Plus, Eye, Edit, Trash2, CheckCircle, Calendar, User, Search , ChevronDown, Filter, Inbox} from "lucide-react";
import { RowActions } from "../components/shared/RowActions";
import { FormModal } from "../components/shared/FormModal";
import { DetailModal } from "../components/shared/DetailModal";
import { useToast } from "../contexts/ToastContext";
import { printRawHtml } from "../lib/printUtils";
import { exportToExcel, exportToPdf } from "../lib/exportUtils";
import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";

export default function Borrowing() {
  const { borrowings, setBorrowings, assets, schoolProfile } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, isBulk: boolean, idToDelete?: string, title?: string, message?: string}>({isOpen: false, isBulk: false});
const toast = useToast();

  
  const openDeleteModal = (id: string, name?: string) => {
    setDeleteModalState({
      isOpen: true,
      isBulk: false,
      idToDelete: id,
      title: "Hapus Data",
      message: `Apakah Anda yakin ingin menghapus data ${name ? '"'+name+'"' : 'ini'}? Aksi ini tidak dapat dibatalkan.`
    });
  };

  const openBulkDeleteModal = () => {
    setDeleteModalState({
      isOpen: true,
      isBulk: true,
      title: "Hapus Kelompok Data",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data terpilih? Aksi ini tidak dapat dibatalkan.`
    });
  };

  const confirmDelete = () => {
    if (deleteModalState.isBulk) {
      setBorrowings(prev => prev.filter(item => !selectedIds.includes(item.id)));
      toast(`Berhasil menghapus ${selectedIds.length} data terpilih.`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      setBorrowings(prev => prev.filter(item => item.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus data.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBorrowings.length && filteredBorrowings.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBorrowings.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };
const handleAction = (msg: string, type: 'info'|'success'|'error' = 'info') => toast(msg, type);

  const openDetail = (id: string) => {
    setSelectedBorrowId(id);
    setIsDetailModalOpen(true);
  };

  const openEdit = (id: string) => {
    setSelectedBorrowId(id);
    setIsModalOpen(true);
    handleAction("Memuat form edit transaksi");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      peminjam: formData.get('peminjam'),
      nipPeminjam: formData.get('nipPeminjam'),
      kontakPeminjam: formData.get('kontakPeminjam'),
      unitKerja: formData.get('unitKerja'),
      keperluan: formData.get('keperluan'),
      keterangan: formData.get('keterangan'),
      kondisiPinjam: formData.get('kondisiPinjam'),
      kondisiKembali: formData.get('kondisiKembali'),
      assetId: formData.get('assetId'),
      tanggalPinjam: formData.get('tanggalPinjam'),
      rencanaTanggalKembali: formData.get('rencanaTanggalKembali'),
      status: formData.get('status') || 'Dipinjam',
    };
    
    // Check if status changed from "Dipinjam" to "Dikembalikan" explicitly from the form
    if (data.status === 'Dikembalikan' && (!selectedBorrowing || selectedBorrowing.status !== 'Dikembalikan')) {
      data.tanggalKembali = new Date().toISOString();
    }
    
    if (selectedBorrowId) {
      setBorrowings(prev => prev.map(b => b.id === selectedBorrowId ? { ...b, ...data } : b));
      handleAction("Transaksi peminjaman diperbarui", 'success');
    } else {
      setBorrowings(prev => [...prev, { id: `BRW-${Date.now()}`, ...data }]);
      handleAction("Transaksi peminjaman disimpan", 'success');
    }
    setIsModalOpen(false);
  };

  const selectedBorrowing = borrowings.find(b => b.id === selectedBorrowId);
  const selectedBorrowAsset = selectedBorrowing ? assets.find(a => a.id === selectedBorrowing.assetId) : null;

  const filteredBorrowings = borrowings.filter(borrow => {
    const asset = assets.find(a => a.id === borrow.assetId);
    const assetName = asset?.nama || "";
    
    const matchesSearch = 
      borrow.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
      assetName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === "Semua" || borrow.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch(sortBy) {
      case "Terbaru":
        return new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime();
      case "Terlama":
        return new Date(a.tanggalPinjam).getTime() - new Date(b.tanggalPinjam).getTime();
      case "Peminjam A-Z":
        return a.peminjam.localeCompare(b.peminjam);
      case "Peminjam Z-A":
        return b.peminjam.localeCompare(a.peminjam);
      default:
        return 0;
    }
  });

  const exportColumns = [
    { header: "Peminjam", key: "peminjam" },
    { header: "Unit Kerja/Kelas", key: "unitKerja" },
    { header: "Kontak", key: "kontakPeminjam" },
    { header: "Aset Dipinjam", key: "assetMenu", render: (item: any) => { const a = assets.find(ast => ast.id === item.assetId); return a ? a.nama : "Tidak Ditemukan"; } },
    { header: "Tanggal Pinjam", key: "tanggalPinjam", render: (item: any) => new Date(item.tanggalPinjam).toLocaleDateString("id-ID") },
    { header: "Kembali Diharapkan", key: "rencanaTanggalKembali", render: (item: any) => item.rencanaTanggalKembali ? new Date(item.rencanaTanggalKembali).toLocaleDateString("id-ID") : "-" },
    { header: "Tgl Dikembalikan", key: "tanggalKembali", render: (item: any) => item.tanggalKembali ? new Date(item.tanggalKembali).toLocaleDateString("id-ID") : "-" },
    { header: "Status", key: "status" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredBorrowings, exportColumns, `Data_Peminjaman`);
    toast("Berhasil mengekspor data peminjaman ke Excel", "success");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredBorrowings, exportColumns, `Laporan Data Peminjaman Aset`, schoolProfile);
    toast("Berhasil mengekspor data peminjaman ke PDF", "success");
  };

  return (
    <>
    <div className="space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Peminjaman Aset</h2>
          <p className="text-slate-700">Lacak peminjaman barang oleh siswa, guru, maupun pihak luar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataActions 
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
          <Button onClick={() => { setSelectedBorrowId(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 w-4 h-4" />
            Catat Peminjaman
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-300 bg-slate-50/50 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                placeholder="Cari peminjam atau aset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full appearance-none bg-white pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:justify-end">
              <div className="hidden xl:flex items-center mr-1">
                <Filter className="h-4 w-4 text-slate-600" />
              </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all hover:bg-slate-50 transition-colors shadow-sm"
              >
                <option value="Semua">Semua Status</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Dikembalikan">Dikembalikan</option>
                <option value="Terlambat">Terlambat</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-primary-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <option value="Terbaru">Urutkan: Pinjam Terbaru</option>
                <option value="Terlama">Urutkan: Pinjam Terlama</option>
                <option value="Peminjam A-Z">Urutkan: Peminjam A-Z</option>
                <option value="Peminjam Z-A">Urutkan: Peminjam Z-A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
            </div>
          </div>
                  {selectedIds.length > 0 && (
          <div className="bg-primary-50 px-6 py-3 border-b border-primary-100 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.length} baris terpilih
            </span>
            <Button variant="destructive" size="sm" onClick={openBulkDeleteModal} className="h-8">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Terpilih
            </Button>
          </div>
        )}
        <div className="overflow-x-auto min-h-[300px] pb-24">
            <table className="w-full text-sm text-left">
  <thead className="text-xs text-slate-700 uppercase bg-slate-50/50 border-b border-slate-300">
    <tr>
      <th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredBorrowings.length && filteredBorrowings.length > 0} onChange={toggleSelectAll} /></th>
      <th className="px-6 py-3 font-medium">Peminjam</th>
      <th className="px-6 py-3 font-medium">Barang yang Dipinjam</th>
      <th className="px-6 py-3 font-medium">Tanggal Pinjam</th>
      <th className="px-6 py-3 font-medium">Kembali Diharapkan</th>
      <th className="px-6 py-3 font-medium">Status</th>
      <th className="px-6 py-3 font-medium text-right">Aksi</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-100">
    {filteredBorrowings.length > 0 ? (
      filteredBorrowings.map((borrow) => {
        const asset = assets.find(a => a.id === borrow.assetId);
        return (
        <tr key={borrow.id} className="hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(borrow.id)} onChange={() => toggleSelect(borrow.id)} /></td>
<td className="px-6 py-4 font-medium text-slate-900">{borrow.peminjam}</td>
<td className="px-6 py-4">{asset ? asset.nama : "Aset Tidak Ditemukan"}</td>
<td className="px-6 py-4 text-slate-700">{new Date(borrow.tanggalPinjam).toLocaleDateString("id-ID")}</td>
<td className="px-6 py-4 text-slate-700">{borrow.rencanaTanggalKembali ? new Date(borrow.rencanaTanggalKembali).toLocaleDateString("id-ID") : "-"}</td>
<td className="px-6 py-4"><Badge variant={borrow.status === "Dipinjam" ? "warning" : borrow.status === "Terlambat" ? "destructive" : "success"}>{borrow.status}</Badge></td>
          <td className="px-6 py-4 text-right pr-4">
            <RowActions actions={[
              ...(borrow.status === 'Dipinjam' ? [
                { label: "Kembalikan", icon: CheckCircle, onClick: () => { setBorrowings(prev => prev.map(b => b.id === borrow.id ? { ...b, status: "Dikembalikan", tanggalKembali: new Date().toISOString() } : b)); handleAction("Aset dikembalikan", "success"); } }
              ] : []),
              { label: "Lihat Detail", icon: Eye, onClick: () => openDetail(borrow.id) },
              { label: "Edit Peminjaman", icon: Edit, onClick: () => openEdit(borrow.id) },
              { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(borrow.id, typeof borrow.peminjam === "string" ? borrow.peminjam : (borrow as any).namaPeminjam) }
            ]} />
          </td>
        </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={7} className="px-6 py-16 text-center text-slate-700">
                        <div className="flex flex-col items-center justify-center">
                          <Inbox className="h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-700 font-medium text-base">Tidak Ada Data</p>
                          <p className="text-slate-600 text-sm mt-1">Belum ada catatan yang ditemukan atau kriteria pencarian tidak cocok.</p>
                        </div>
                      </td>
      </tr>
    )}
  </tbody>
</table>
          </div>
        </CardContent>
      </Card>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBorrowId ? "Edit Transaksi Peminjaman" : "Form Peminjaman Aset"}
        onSubmit={handleSave}
      >
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Nama Peminjam</label>
              <input name="peminjam" required type="text" defaultValue={selectedBorrowing?.peminjam || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Masukkan nama (Misal: Siswa A)" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">NIP / NIS (Opsional)</label>
              <input name="nipPeminjam" type="text" defaultValue={selectedBorrowing?.nipPeminjam || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="NIP/NIS Peminjam" />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kontak Peminjam (No. HP/Telp)</label>
              <input name="kontakPeminjam" type="text" defaultValue={selectedBorrowing?.kontakPeminjam || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="08123456789" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Unit Kerja / Kelas</label>
              <input name="unitKerja" type="text" defaultValue={selectedBorrowing?.unitKerja || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Kelas VII-A / Guru Olahraga" />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Pilih Aset</label>
            <select name="assetId" required defaultValue={selectedBorrowing?.assetId || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
              <option value="">Pilih aset yang dipinjam...</option>
              {assets.filter(a => a.kondisi !== "Rusak Berat").map(a => <option key={a.id} value={a.id}>{a.nama} ({a.kodeBarang})</option>)}
            </select>
            <p className="text-xs text-slate-700">Hanya menampilkan aset dengan kondisi baik atau rusak ringan.</p>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Kondisi Aset Saat Dipinjam</label>
            <input name="kondisiPinjam" type="text" defaultValue={selectedBorrowing?.kondisiPinjam || 'Baik'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Misal: Baik, layar agak buram, dsb." />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tanggal Pinjam</label>
              <input name="tanggalPinjam" required type="date" defaultValue={selectedBorrowing ? new Date(selectedBorrowing.tanggalPinjam).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Rencana Kembali</label>
              <input name="rencanaTanggalKembali" type="date" defaultValue={selectedBorrowing?.rencanaTanggalKembali ? new Date(selectedBorrowing.rencanaTanggalKembali).toISOString().split('T')[0] : ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Status</label>
              <select name="status" defaultValue={selectedBorrowing?.status || 'Dipinjam'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Dipinjam">Sedang Dipinjam</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Dikembalikan">Sudah Dikembalikan</option>
              </select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Keperluan</label>
            <textarea name="keperluan" rows={2} defaultValue={selectedBorrowing?.keperluan || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Digunakan untuk pelajaran praktek..."></textarea>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Keterangan / Catatan Fisik (Opsional)</label>
            <textarea name="keterangan" rows={2} defaultValue={selectedBorrowing?.keterangan || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Catatan tambahan..."></textarea>
          </div>
          
          {(selectedBorrowing?.status === 'Dikembalikan' || selectedBorrowing?.status === 'Terlambat') && (
            <div className="grid gap-2 p-4 bg-slate-50 border border-slate-300 rounded-lg mt-2">
              <label className="text-sm font-bold text-slate-900 border-b border-slate-300 block pb-2 mb-2">Informasi Pengembalian (Opsional)</label>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-900">Kondisi Aset Saat Dikembalikan</label>
                <input name="kondisiKembali" type="text" defaultValue={selectedBorrowing?.kondisiKembali || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Misal: Baik sesuai peminjaman" />
              </div>
            </div>
          )}
        </div>
      </FormModal>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Bukti Peminjaman"
      >
        {selectedBorrowing && selectedBorrowAsset ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedBorrowing.peminjam}</h4>
                  <p className="text-sm text-slate-700">Peminjam Aset</p>
                </div>
              </div>
              <Badge 
                variant={
                  selectedBorrowing.status === "Dipinjam" ? "warning" : 
                  selectedBorrowing.status === "Dikembalikan" ? "success" : "destructive"
                }
                className="text-sm px-3 py-1"
              >
                {selectedBorrowing.status}
              </Badge>
            </div>

            <div className="grid gap-4">
              <h5 className="font-semibold text-slate-900">Informasi Peminjam</h5>
              <div className="grid sm:grid-cols-2 text-sm gap-y-2 gap-x-4 mb-4">
                <p><span className="text-slate-700">NIP/NIS:</span> <span className="font-medium text-slate-900">{selectedBorrowing.nipPeminjam || "-"}</span></p>
                <p><span className="text-slate-700">Unit Kerja/Kelas:</span> <span className="font-medium text-slate-900">{selectedBorrowing.unitKerja || "-"}</span></p>
                <p><span className="text-slate-700">Kontak (HP):</span> <span className="font-medium text-slate-900">{selectedBorrowing.kontakPeminjam || "-"}</span></p>
                <p><span className="text-slate-700">Keperluan:</span> <span className="font-medium text-slate-900">{selectedBorrowing.keperluan || "-"}</span></p>
              </div>
            </div>

            <div className="grid gap-4">
              <h5 className="font-semibold text-slate-900">Informasi Aset yang Dipinjam</h5>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-300 flex flex-col gap-2">
                <p className="font-medium text-slate-800 text-lg">{selectedBorrowAsset.nama}</p>
                <div className="grid sm:grid-cols-2 text-sm gap-2 mt-2">
                  <p><span className="text-slate-700">Kode Barang:</span> <span className="font-medium font-mono text-slate-700">{selectedBorrowAsset.kodeBarang}</span></p>
                  <p><span className="text-slate-700">Kategori:</span> <span className="font-medium text-slate-700">{selectedBorrowAsset.kategori}</span></p>
                  <p className="col-span-2"><span className="text-slate-700">Kondisi saat dipinjam:</span> <span className="font-medium text-slate-700">{selectedBorrowing.kondisiPinjam || selectedBorrowAsset.kondisi}</span></p>
                  {selectedBorrowing.kondisiKembali && (
                    <p className="col-span-2"><span className="text-slate-700">Kondisi saat kembali:</span> <span className="font-medium text-slate-700">{selectedBorrowing.kondisiKembali}</span></p>
                  )}
                  {selectedBorrowing.keterangan && (
                    <p className="col-span-2"><span className="text-slate-700">Keterangan:</span> <span className="font-medium text-slate-700">{selectedBorrowing.keterangan}</span></p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 bg-white border border-slate-300 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-700 text-xs block mb-1 uppercase font-semibold tracking-wider">Tanggal Peminjaman</span>
                  <span className="text-slate-900 font-medium">{new Date(selectedBorrowing.tanggalPinjam).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white border border-slate-300 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-700 text-xs block mb-1 uppercase font-semibold tracking-wider">Rencana Kembali</span>
                  <span className="text-slate-900 font-medium">{selectedBorrowing.rencanaTanggalKembali ? new Date(selectedBorrowing.rencanaTanggalKembali).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white border border-slate-300 rounded-lg p-4">
                <CheckCircle className={`h-5 w-5 shrink-0 mt-0.5 ${selectedBorrowing.tanggalKembali ? 'text-emerald-500' : 'text-slate-300'}`} />
                <div>
                  <span className="text-slate-700 text-xs block mb-1 uppercase font-semibold tracking-wider">Tanggal Pengembalian</span>
                  <span className={`font-medium ${selectedBorrowing.tanggalKembali ? 'text-slate-900' : 'text-slate-600 italic'}`}>
                    {selectedBorrowing.tanggalKembali ? new Date(selectedBorrowing.tanggalKembali).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' }) : "Belum dikembalikan"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-300 pt-6">
              <h5 className="font-semibold text-slate-800 mb-2">Pengaturan Cetak Surat Peminjaman</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 bg-white text-slate-900 border border-slate-300 rounded text-sm"
                    defaultValue={`${String(selectedBorrowing.id).replace(/\D/g, '').padStart(3, '0') || '001'} / SPB / SMP / ${new Date(selectedBorrowing.tanggalPinjam).getFullYear()}`}
                    id="nomor-surat-peminjaman"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pengelola Barang / Aset</label>
                  <input type="text" id="b-pengelola" defaultValue={schoolProfile.operator || ''} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm mb-1" placeholder="Nama" />
                  <input type="text" id="b-nip1" defaultValue={schoolProfile.nipOperator || ''} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm" placeholder="NIP (Opsional)" />
                </div>
              </div>
              <div className="flex gap-3 print:hidden">
                <Button variant="outline" className="flex-1" onClick={() => {
                  const borrowDate = new Date(selectedBorrowing.tanggalPinjam).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });
                  const rencanaTanggalKembali = selectedBorrowing.rencanaTanggalKembali ? new Date(selectedBorrowing.rencanaTanggalKembali).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' }) : "-";
                  const customNomor = (document.getElementById('nomor-surat-peminjaman') as HTMLInputElement)?.value || `${String(selectedBorrowing.id).replace(/\D/g, '').padStart(3, '0') || '001'} / SPB / SMP / ${new Date(selectedBorrowing.tanggalPinjam).getFullYear()}`;

                  const pengelolaName = (document.getElementById('b-pengelola') as HTMLInputElement)?.value || "(........................................)";
                  const nip1 = (document.getElementById('b-nip1') as HTMLInputElement)?.value;
                  const pengelolaNip = nip1 ? (nip1.startsWith('NIP') ? nip1 : `NIP. ${nip1}`) : "";

                  const logoHtml = schoolProfile.logoDinas 
                    ? `<img src="${schoolProfile.logoDinas}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; margin-right: 15px; position: absolute; left: 0; top: 0;" />` 
                    : '';

                  const docHtml = `
                    <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.5; padding: 20px;">
                      <div style="text-align: center; border-bottom: 3px double; padding-bottom: 10px; margin-bottom: 20px; position: relative; min-height: 70px;">
                        ${logoHtml}
                        <h3 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">${schoolProfile.kementerian || 'KEMENTERIAN PENDIDIKAN'}</h3>
                        <h2 style="margin: 2px 0 5px; font-size: 16pt; font-weight: bold; text-transform: uppercase;">${schoolProfile.nama || 'NAMA SEKOLAH'}</h2>
                        <p style="margin: 0; font-size: 11pt;">${schoolProfile.alamat || ''} ${schoolProfile.kodePos || ''}</p>
                        <p style="margin: 0; font-size: 11pt; margin-bottom: 5px;">Telp: ${schoolProfile.telepon || '-'} | Email: ${schoolProfile.email || '-'} | Website: ${schoolProfile.website || '-'}</p>
                      </div>

                      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px; font-size: 12pt;">SURAT PEMINJAMAN SARANA DAN PRASARANA</h3>
                      <p style="text-align: center; margin-top: 0; margin-bottom: 30px; font-size: 11pt;">Nomor: ${customNomor}</p>
                    
                    <p style="font-size: 11pt;">Yang bertanda tangan di bawah ini:</p>
                    <table style="width: 100%; border: none; margin-bottom: 20px; font-size: 11pt;">
                      <tr><td style="width: 180px; border: none; padding: 2px;">Nama Lengkap</td><td style="border: none; padding: 2px;">: <strong>${selectedBorrowing.peminjam}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">NIP / NIS</td><td style="border: none; padding: 2px;">: <strong>${selectedBorrowing.nipPeminjam || "-"}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">Unit Kerja / Kelas</td><td style="border: none; padding: 2px;">: <strong>${selectedBorrowing.unitKerja || "-"}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">Kontak (No. HP)</td><td style="border: none; padding: 2px;">: <strong>${selectedBorrowing.kontakPeminjam || "-"}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">Keperluan</td><td style="border: none; padding: 2px;">: <strong>${selectedBorrowing.keperluan || "-"}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">Tanggal Peminjaman</td><td style="border: none; padding: 2px;">: <strong>${borrowDate}</strong></td></tr>
                      <tr><td style="border: none; padding: 2px;">Rencana Pengembalian</td><td style="border: none; padding: 2px;">: <strong>${rencanaTanggalKembali}</strong></td></tr>
                    </table>
                    
                    <p style="font-size: 11pt;">Dengan ini mengajukan permohonan peminjaman sarana dan prasarana/aset inventaris sekolah berupa:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt;">
                      <thead>
                        <tr>
                          <th style="border: 1px solid black; padding: 8px;">No</th>
                          <th style="border: 1px solid black; padding: 8px;">Kode Barang / Register</th>
                          <th style="border: 1px solid black; padding: 8px;">Nama Barang / Aset</th>
                          <th style="border: 1px solid black; padding: 8px;">Kategori</th>
                          <th style="border: 1px solid black; padding: 8px;">Kondisi Awal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="border: 1px solid black; padding: 8px; text-align: center;">1</td>
                          <td style="border: 1px solid black; padding: 8px; text-align: center;">${selectedBorrowAsset.kodeBarang}</td>
                          <td style="border: 1px solid black; padding: 8px;">${selectedBorrowAsset.nama}</td>
                          <td style="border: 1px solid black; padding: 8px; text-align: center;">${selectedBorrowAsset.kategori}</td>
                          <td style="border: 1px solid black; padding: 8px; text-align: center;">${selectedBorrowing.kondisiPinjam || selectedBorrowAsset.kondisi}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p style="text-align: justify; font-size: 11pt; margin-bottom: 40px; line-height: 1.5;">Peminjam bertanggung jawab sepenuhnya atas keutuhan, kebersihan, dan keamanan barang/aset tersebut selama masa peminjaman. Apabila terjadi kerusakan atau kehilangan, peminjam bersedia mengganti atau memperbaiki kondisi barang seperti semula sesuai dengan ketentuan tata tertib sekolah yang berlaku.</p>
                    
                    <table style="width: 100%; border: none; text-align: center; font-size: 11pt;">
                      <tr>
                        <td style="width: 50%; border: none;">
                          <p style="margin: 0;">Menyetujui / Mengetahui,<br/>Pengelola Barang / Aset</p>
                          <p style="margin-top: 80px; margin-bottom: 0;"><strong><u>${pengelolaName}</u></strong></p>
                          <p style="margin-top: 5px;">${pengelolaNip}</p>
                        </td>
                        <td style="width: 50%; border: none;">
                          <p style="margin: 0;">${schoolProfile.alamat ? schoolProfile.alamat.split(',')[0] : 'Kota Pelajar'}, ${borrowDate}<br/>Yang Meminjam,</p>
                          <p style="margin-top: 80px; margin-bottom: 0;"><strong><u>${selectedBorrowing.peminjam}</u></strong></p>
                          <p style="margin-top: 5px;">NIP / NIS. ${selectedBorrowing.nipPeminjam || "-"}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                `;
                printRawHtml(docHtml, "Surat Peminjaman Barang / Aset");
              }}>
                Cetak Surat Peminjaman
              </Button>
              {selectedBorrowing.status !== "Dikembalikan" && (
                <Button variant="default" className="flex-1" onClick={() => {
                  setBorrowings(prev => prev.map(b => b.id === selectedBorrowing.id ? { ...b, status: "Dikembalikan", tanggalKembali: new Date().toISOString() } : b));
                  setIsDetailModalOpen(false);
                  handleAction(`Aset ${selectedBorrowAsset.nama} dikembalikan`, 'success');
                }}>
                  Proses Pengembalian
                </Button>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-700">Mencari data transaksi...</div>
        )}
      </DetailModal>

      <ConfirmDeleteModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
        title={deleteModalState.title}
        message={deleteModalState.message}
      />
    </div>

    </>
  );
}
