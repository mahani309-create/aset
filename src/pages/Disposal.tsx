import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { DataActions } from "../components/shared/DataActions";
import { useData } from "../contexts/DataContext";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, FileX, Calendar, Printer , ChevronDown, Filter, Inbox} from "lucide-react";
import { RowActions } from "../components/shared/RowActions";
import { FormModal } from "../components/shared/FormModal";
import { DetailModal } from "../components/shared/DetailModal";
import { useToast } from "../contexts/ToastContext";
import { PrintDisposalReportModal } from "../components/shared/PrintDisposalReportModal";
import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";
import { exportToExcel, exportToPdf } from "../lib/exportUtils";

export default function Disposal() {
  const { disposals, setDisposals, assets, schoolProfile } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedDisposalId, setSelectedDisposalId] = useState<string | null>(null);
  
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
      setDisposals(prev => prev.filter(item => !selectedIds.includes(item.id)));
      toast(`Berhasil menghapus ${selectedIds.length} data terpilih.`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      setDisposals(prev => prev.filter(item => item.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus data.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisposals.length && filteredDisposals.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisposals.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };
const handleAction = (msg: string, type: 'info'|'success'|'error' = 'info') => toast(msg, type);

  const openDetail = (id: string) => {
    setSelectedDisposalId(id);
    setIsDetailModalOpen(true);
  };

  const openEdit = (id: string) => {
    setSelectedDisposalId(id);
    setIsModalOpen(true);
    handleAction("Membuka form edit penghapusan");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      assetId: formData.get('assetId'),
      tanggalPengajuan: formData.get('tanggalPengajuan'),
      metode: formData.get('metode') as any,
      alasan: formData.get('alasan'),
      status: formData.get('status') || 'Pengajuan',
    };
    
    if (selectedDisposalId) {
      setDisposals(prev => prev.map(d => d.id === selectedDisposalId ? { ...d, ...data } : d));
      handleAction("Pengajuan penghapusan diperbarui", "success");
    } else {
      setDisposals(prev => [...prev, { id: `DSP-${Date.now()}`, ...data }]);
      handleAction("Pengajuan penghapusan berhasil disimpan", "success");
    }
    setIsModalOpen(false);
  };

  const selectedDisposal = disposals.find(d => d.id === selectedDisposalId);
  const selectedDisposalAsset = selectedDisposal ? assets.find(a => a.id === selectedDisposal.assetId) : null;

  const filteredDisposals = disposals.filter(item => {
    const asset = assets.find(a => a.id === item.assetId);
    const assetName = asset?.nama || "";
    
    const matchesSearch = assetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Semua" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "Terbaru":
        return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
      case "Terlama":
        return new Date(a.tanggalPengajuan).getTime() - new Date(b.tanggalPengajuan).getTime();
      case "Aset A-Z": {
        const assetA = assets.find(as => as.id === a.assetId)?.nama || "";
        const assetB = assets.find(as => as.id === b.assetId)?.nama || "";
        return assetA.localeCompare(assetB);
      }
      default:
        return 0;
    }
  });

  const exportColumns = [
    { header: "Tanggal", key: "tanggalPengajuan", render: (item: any) => new Date(item.tanggalPengajuan).toLocaleDateString("id-ID") },
    { header: "Aset", key: "assetId", render: (item: any) => { const a = assets.find(ast => ast.id === item.assetId); return a ? a.nama : "-"; } },
    { header: "Metode", key: "metode" },
    { header: "Nilai Jual", key: "nilaiJual", render: (item: any) => `Rp ${item.nilaiJual?.toLocaleString('id-ID') || 0}` },
    { header: "Alasan", key: "alasan" },
    { header: "Status", key: "status" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredDisposals, exportColumns, `Data_Penghapusan`);
    toast("Berhasil mengekspor data penghapusan ke Excel", "success");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredDisposals, exportColumns, `Laporan Data Penghapusan Aset`, schoolProfile);
    toast("Berhasil mengekspor data penghapusan ke PDF", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Penghapusan Aset</h2>
          <p className="text-slate-700">Manajemen pengajuan pemusnahan atau lelang aset yang sudah tidak layak pakai.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataActions 
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
          <Button onClick={() => { setSelectedDisposalId(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 w-4 h-4" />
            Ajukan Penghapusan
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
                placeholder="Cari aset yang ingin dihapus..."
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
                <option value="Diajukan">Pengajuan</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Selesai">Selesai</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-primary-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <option value="Terbaru">Urutkan: Pengajuan Terbaru</option>
                <option value="Terlama">Urutkan: Pengajuan Terlama</option>
                <option value="Aset A-Z">Urutkan: Nama Aset A-Z</option>
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
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50/50 border-b border-slate-300">
<tr>
<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredDisposals.length && filteredDisposals.length > 0} onChange={toggleSelectAll} /></th>
                  <th className="px-6 py-3 font-medium">Tanggal Pengajuan</th>
                  <th className="px-6 py-3 font-medium">Aset Dihapus</th>
                  <th className="px-6 py-3 font-medium">Metode</th>
                  <th className="px-6 py-3 font-medium">Alasan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
                                          <tbody className="divide-y divide-slate-100">
                {filteredDisposals.length > 0 ? (
                  filteredDisposals.map((item) => {
                    const asset = assets.find(a => a.id === item.assetId);
                    return (
                                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                      <td className="px-6 py-4 font-medium text-slate-900">{new Date(item.tanggalPengajuan).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4">{asset ? asset.nama : "Unknown Asset"}</td>
                      <td className="px-6 py-4 text-slate-700">{item.metode}</td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700 line-clamp-1" title={item.alasan}>{item.alasan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === "Selesai" ? "success" : item.status === "Disetujui" ? "success" : (item.status as string) === "Ditolak" ? "destructive" : "warning"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right pr-4">
                        <RowActions actions={[
                          { label: "Update Status", icon: Edit, onClick: () => { setSelectedDisposalId(item.id); setIsModalOpen(true); } },
                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id, asset ? asset.nama : "Data") }
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
        title={selectedDisposalId ? "Edit Pengajuan Penghapusan" : "Formulir Pengajuan Penghapusan Aset"}
        onSubmit={handleSave}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Pilih Aset yang Akan Dihapus</label>
            <select name="assetId" required defaultValue={selectedDisposal?.assetId || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
              <option value="">Pilih aset...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.nama} ({a.kodeBarang})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tanggal Pengajuan</label>
              <input name="tanggalPengajuan" required defaultValue={selectedDisposal ? new Date(selectedDisposal.tanggalPengajuan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Metode Penghapusan</label>
              <select name="metode" required defaultValue={selectedDisposal?.metode || 'Pemusnahan'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Pemusnahan">Pemusnahan</option>
                <option value="Lelang">Lelang / Penjualan</option>
                <option value="Hibah">Hibah</option>
              </select>
            </div>
          </div>
           {selectedDisposal && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Status</label>
              <select name="status" defaultValue={selectedDisposal.status} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Diajukan">Dalam Pengajuan</option>
                <option value="Disetujui">Disetujui Kepala Sekolah</option>
                <option value="Selesai">Proses Selesai/Aset Dihapus</option>
              </select>
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Alasan Penghapusan</label>
            <textarea name="alasan" required defaultValue={selectedDisposal?.alasan || ''} rows={3} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Jelaskan alasan secara mendetail (rusak berat, biaya perbaikan mahal, dll)..."></textarea>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Upload Berkas Pendukung / Foto Kerusakan</label>
            <input type="file" className="text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            <p className="text-xs text-slate-700">Maks. 5MB format JPG/PNG/PDF.</p>
          </div>
        </div>
      </FormModal>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Dokumen Penghapusan Aset"
      >
        {selectedDisposal && selectedDisposalAsset ? (
           <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                  <FileX className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Berita Acara Penghapusan</h4>
                  <div className="flex items-center gap-1.5 text-slate-700 text-sm mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedDisposal.tanggalPengajuan).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <Badge 
                variant={
                  selectedDisposal.status === "Selesai" ? "success" : 
                  selectedDisposal.status === "Disetujui" ? "default" : "warning"
                }
                className="text-sm px-3 py-1"
              >
                Status: {selectedDisposal.status}
              </Badge>
            </div>

            <div className="grid gap-4">
              <h5 className="font-semibold text-slate-900">Aset yang Diajukan Untuk Dihapus</h5>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-300 grid sm:grid-cols-2 gap-4">
                 <div>
                    <span className="text-slate-700 block text-xs uppercase font-medium tracking-wider mb-1">Identitas Barang</span> 
                    <span className="font-medium text-slate-900 block text-lg">{selectedDisposalAsset.nama}</span>
                    <span className="font-mono text-slate-700 mt-1 block">{selectedDisposalAsset.kodeBarang} - Rp {selectedDisposalAsset.harga.toLocaleString("id-ID")}</span>
                 </div>
                 <div className="space-y-3 shrink-0">
                    <div>
                      <span className="text-slate-700 block text-xs uppercase font-medium tracking-wider mb-1">Rencana Metode</span> 
                      <span className="font-medium text-slate-900 bg-white border border-slate-300 px-2 py-1 rounded inline-block">{selectedDisposal.metode}</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
               <h5 className="font-semibold text-slate-900">Alasan Kuat Penghapusan</h5>
               <div className="bg-white border border-slate-300 p-4 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedDisposal.alasan}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-300">
               <h5 className="font-semibold text-slate-900">Validasi & Persetujuan Berjenjang</h5>
               
               <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                       <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="w-0.5 h-12 bg-primary-100 my-1"></div>
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-900 text-sm">Tim Pemeriksa / Teknisi</h6>
                    <p className="text-slate-700 text-xs mt-0.5">Sudah memverifikasi kondisi rusak berat dan tidak ekonomis untuk direparasi.</p>
                  </div>
               </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDisposal.status === "Diajukan" ? 'bg-slate-100 text-slate-600' : 'bg-primary-100 text-primary-700'}`}>
                       {selectedDisposal.status !== "Diajukan" && <CheckCircle className="w-4 h-4" />}
                    </div>
                     <div className={`w-0.5 h-12 my-1 ${selectedDisposal.status === "Selesai" ? 'bg-primary-100' : 'bg-slate-100'}`}></div>
                  </div>
                  <div>
                    <h6 className={`font-bold text-sm ${selectedDisposal.status === "Diajukan" ? 'text-slate-700' : 'text-slate-900'}`}>Kepala Sekolah / Kuasa Pengguna Barang</h6>
                    <p className="text-slate-700 text-xs mt-0.5">Persetujuan untuk dilanjutkan ke proses {selectedDisposal.metode.toLowerCase()}.</p>
                  </div>
               </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDisposal.status === "Selesai" ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                       {selectedDisposal.status === "Selesai" && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </div>
                  <div>
                    <h6 className={`font-bold text-sm ${selectedDisposal.status === "Selesai" ? 'text-emerald-700' : 'text-slate-700'}`}>Eksekusi Penghapusan</h6>
                     <p className="text-slate-700 text-xs mt-0.5">Aset resmi dihapus dari daftar KIB.</p>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-300 flex gap-3">
              <Button variant="outline" className="flex-1 shrink-0 bg-white" onClick={() => setIsPrintModalOpen(true)}>
                <Printer className="mr-2 h-4 w-4" /> Cetak BA Pemeriksaan / Penghapusan
              </Button>
               {selectedDisposal.status !== "Selesai" && (
                <Button variant="default" className="flex-1" onClick={() => {
                  const newStatus = selectedDisposal.status === "Diajukan" ? "Disetujui" : "Selesai";
                  setDisposals(prev => prev.map(d => d.id === selectedDisposal.id ? { ...d, status: newStatus } : d));
                  setIsDetailModalOpen(false);
                  handleAction(`Status penghapusan diupdate menjadi ${newStatus}`, 'success');
                }}>
                  {selectedDisposal.status === "Diajukan" ? "Setujui Permohonan" : "Tandai Selesai Dieksekusi"}
                </Button>
               )}
            </div>
          </div>
        ) : (
           <div className="p-8 text-center text-slate-700">Mencari data pengajuan...</div>
        )}
      </DetailModal>

      <PrintDisposalReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        disposal={selectedDisposal}
        asset={selectedDisposalAsset}
      />
          <ConfirmDeleteModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
        title={deleteModalState.title}
        message={deleteModalState.message}
      />
    </div>
  );
}
