import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DataActions } from "../components/shared/DataActions";
import { useData } from "../contexts/DataContext";
import { Plus, Search, Wrench, Calendar, User, CheckCircle, Edit, Trash2, Printer, LayoutGrid, List , ChevronDown, Filter, Inbox} from "lucide-react";
import { FormModal } from "../components/shared/FormModal";
import { DetailModal } from "../components/shared/DetailModal";
import { PrintMaintenanceReportModal } from "../components/shared/PrintMaintenanceReportModal";
import { useToast } from "../contexts/ToastContext";
import { exportToExcel, exportToPdf } from "../lib/exportUtils";
import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";
import { motion, AnimatePresence } from "motion/react";

export default function Maintenance() {
  const { maintenances, setMaintenances, assets } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
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
      setMaintenances(prev => prev.filter(item => !selectedIds.includes(item.id)));
      toast(`Berhasil menghapus ${selectedIds.length} data terpilih.`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      setMaintenances(prev => prev.filter(item => item.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus data.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMaintenances.length && filteredMaintenances.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMaintenances.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };
const handleAction = (msg: string, type: 'info'|'success'|'error' = 'info') => toast(msg, type);

  const openDetail = (id: string) => {
    setSelectedRecordId(id);
    setIsDetailModalOpen(true);
  };

  const openEdit = (id: string) => {
    setSelectedRecordId(id);
    setIsModalOpen(true);
    handleAction("Memuat form edit laporan");
  };

  const openUpdate = (id: string) => {
    setSelectedRecordId(id);
    setIsUpdateModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      assetId: formData.get('assetId'),
      tanggalLapor: formData.get('tanggalLapor'),
      pelapor: formData.get('pelapor'),
      deskripsiKerusakan: formData.get('deskripsiKerusakan'),
      prioritas: formData.get('prioritas'),
    };
    
    if (selectedRecordId) {
      setMaintenances(prev => prev.map(m => m.id === selectedRecordId ? { ...m, ...data } : m));
      handleAction("Laporan berhasil diperbarui", "success");
    } else {
      setMaintenances(prev => [...prev, { id: `MNT-${Date.now()}`, status: "Menunggu", ...data }]);
      handleAction("Laporan berhasil dibuat", "success");
    }
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      status: formData.get('status'),
      teknisi: formData.get('teknisi'),
      biayaEstimasi: parseInt(formData.get('biayaEstimasi') as string) || 0,
      catatanTeknisi: formData.get('catatanTeknisi'),
    };

    setMaintenances(prev => prev.map(m => m.id === selectedRecordId ? { ...m, ...data } : m));
    handleAction("Status laporan diupdate", "success");
    setIsUpdateModalOpen(false);
  };

  const selectedRecord = maintenances.find(m => m.id === selectedRecordId);
  const selectedAsset = selectedRecord ? assets.find(a => a.id === selectedRecord.assetId) : null;

  const filteredMaintenances = maintenances.filter(record => {
    const asset = assets.find(a => a.id === record.assetId);
    const assetName = asset?.nama || "";
    
    const matchesSearch = 
      record.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      assetName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === "Semua" || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "Terbaru":
        return new Date(b.tanggalLapor).getTime() - new Date(a.tanggalLapor).getTime();
      case "Terlama":
        return new Date(a.tanggalLapor).getTime() - new Date(b.tanggalLapor).getTime();
      case "Biaya Tertinggi":
        return (b.biayaEstimasi || 0) - (a.biayaEstimasi || 0);
      case "Biaya Terendah":
        return (a.biayaEstimasi || 0) - (b.biayaEstimasi || 0);
      default:
        return 0;
    }
  });

  const exportColumns = [
    { header: "Tanggal", key: "tanggalLapor", render: (item: any) => new Date(item.tanggalLapor).toLocaleDateString("id-ID") },
    { header: "Pelapor", key: "pelapor" },
    { header: "Aset", key: "assetMenu", render: (item: any) => { const a = assets.find(ast => ast.id === item.assetId); return a ? a.nama : "-"; } },
    { header: "Kerusakan", key: "deskripsiKerusakan" },
    { header: "Prioritas", key: "prioritas" },
    { header: "Teknisi", key: "teknisi" },
    { header: "Biaya", key: "biayaEstimasi", render: (item: any) => `Rp ${item.biayaEstimasi?.toLocaleString('id-ID') || 0}` },
    { header: "Status", key: "status" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredMaintenances, exportColumns, `Data_Pemeliharaan`);
    toast("Berhasil mengekspor data pemeliharaan ke Excel", "success");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredMaintenances, exportColumns, `Laporan Data Pemeliharaan Aset`, schoolProfile);
    toast("Berhasil mengekspor data pemeliharaan ke PDF", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Pemeliharaan & Perbaikan</h2>
          <p className="text-slate-700">Kelola tiket laporan kerusakan dan status perbaikan aset.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataActions 
            onExportExcel={handleExportExcel}
            onExportCsv={() => handleAction("Mengekspor tiket pemeliharaan ke CSV...")}
            onExportPdf={handleExportPdf}
            onImport={() => handleAction("Memuat bulk impor laporan pemeliharaan...")}
          />
          <Button onClick={() => { setSelectedRecordId(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 w-4 h-4" />
            Buat Laporan Baru
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-50 border-b border-slate-300/60 rounded-t-xl">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Cari aset atau pelapor..."
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
              <option value="Menunggu">Menunggu</option>
              <option value="Proses Perbaikan">Proses Perbaikan</option>
              <option value="Tidak Bisa Diperbaiki">Tidak Bisa Diperbaiki</option>
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
              <option value="Terbaru">Urutkan: Lapor Terbaru</option>
              <option value="Terlama">Urutkan: Lapor Terlama</option>
              <option value="Biaya Tertinggi">Urutkan: Biaya Tertinggi</option>
              <option value="Biaya Terendah">Urutkan: Biaya Terendah</option>
            </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode("list")} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary-600" : "text-slate-700 hover:text-slate-700"}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("kanban")} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === "kanban" ? "bg-white shadow-sm text-primary-600" : "text-slate-700 hover:text-slate-700"}`}
                  title="Kanban View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "list" ? (
        <div className="grid gap-4">
          {filteredMaintenances.length > 0 ? (
            filteredMaintenances.map((record) => {
            const asset = assets.find(a => a.id === record.assetId);
            return (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={record.id}>
                <Card className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="p-6 bg-slate-50/50 sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-300 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            record.status === "Selesai" ? "success" : 
                            record.status === "Proses Perbaikan" ? "warning" : 
                            record.status === "Menunggu" ? "secondary" : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900">{asset?.nama}</h4>
                      <p className="font-mono text-xs text-slate-700 mt-1">{asset?.kodeBarang}</p>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-slate-900 mb-2">Deskripsi Kerusakan</h5>
                        <p className="text-sm text-slate-700 bg-white border border-slate-300 p-3 rounded-lg">
                          "{record.deskripsiKerusakan}"
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>Masuk: {new Date(record.tanggalLapor).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>Pelapor: {record.pelapor}</span>
                        </div>
                        {record.teknisi && (
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Teknisi: {record.teknisi}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border-t sm:border-t-0 sm:border-l border-slate-300 flex sm:flex-col justify-end sm:justify-center gap-2 bg-slate-50/50">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openDetail(record.id)}>
                        Detail Lengkap
                      </Button>
                      <Button variant="default" size="sm" className="w-full" onClick={() => openUpdate(record.id)}>
                        Update Status
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => openEdit(record.id)}>
                        Edit Laporan
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => openDeleteModal(record.id, record.id)}>
                        Hapus
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })) : (
            <div className="p-10 text-center text-slate-700 bg-white border border-slate-300 rounded-xl">
                Tidak ada laporan kerusakan yang ditemukan.
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
          {["Menunggu", "Proses Perbaikan", "Selesai", "Tidak Bisa Diperbaiki"].map((statusCol) => {
             const items = filteredMaintenances.filter(m => m.status === statusCol);
             return (
               <div key={statusCol} className="min-w-[320px] w-full max-w-[350px] shrink-0 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col snap-start">
                 <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                       <Badge variant={statusCol === "Selesai" ? "success" : statusCol === "Proses Perbaikan" ? "warning" : statusCol === "Menunggu" ? "secondary" : "destructive"}>
                          {statusCol}
                       </Badge>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{items.length}</span>
                 </div>
                 <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[400px]">
                    <AnimatePresence>
                      {items.map((record) => {
                        const asset = assets.find(a => a.id === record.assetId);
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={record.id} 
                            onClick={() => openDetail(record.id)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group relative"
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); openUpdate(record.id); }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-primary-600 transition-colors"
                               >
                                 <Edit className="w-4 h-4" />
                               </button>
                            </div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 line-clamp-1 pr-6">{asset?.nama}</h5>
                            <p className="text-xs font-mono text-slate-700 mb-3">{asset?.kodeBarang}</p>
                            <p className="text-xs text-slate-700 dark:text-slate-600 line-clamp-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg mb-3">"{record.deskripsiKerusakan}"</p>
                            <div className="flex items-center justify-between text-xs text-slate-700">
                               <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(record.tanggalLapor).toLocaleDateString("id-ID", { month: 'short', day: 'numeric' })}</div>
                               {record.teknisi && <div className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {record.teknisi.split(' ')[0]}</div>}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    {items.length === 0 && (
                      <div className="text-center py-10 text-slate-600 text-sm border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                        Kosong
                      </div>
                    )}
                 </div>
               </div>
             )
          })}
        </div>
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecordId ? "Edit Laporan Kerusakan" : "Formulir Laporan Kerusakan"}
        onSubmit={handleSave}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Pilih Aset yang Dilaporkan</label>
            <select name="assetId" required defaultValue={selectedRecord?.assetId || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
              <option value="">Pilih aset...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.nama} ({a.kodeBarang})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tanggal Lapor</label>
              <input name="tanggalLapor" required defaultValue={selectedRecord ? new Date(selectedRecord.tanggalLapor).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Nama Pelapor</label>
              <input name="pelapor" required defaultValue={selectedRecord?.pelapor || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Masukkan nama" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Deskripsi Kerusakan</label>
            <textarea name="deskripsiKerusakan" required defaultValue={selectedRecord?.deskripsiKerusakan || ''} rows={4} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Jelaskan secara rinci bagian apa yang rusak atau kendalanya..."></textarea>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Tingkat Prioritas</label>
            <select name="prioritas" defaultValue={selectedRecord?.prioritas || 'sedang'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
              <option value="rendah">Rendah (Dapat ditunda)</option>
              <option value="sedang">Sedang (Perlu segera)</option>
              <option value="tinggi">Tinggi (Kritis / Menghambat Operasional)</option>
            </select>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Status Perbaikan/Pemeliharaan"
        onSubmit={handleUpdateStatus}
      >
        <div className="grid gap-4">
          <div className="bg-slate-50 p-4 border border-slate-300 rounded-lg">
             <p className="text-sm font-medium text-slate-900">{selectedAsset?.nama}</p>
             <p className="text-sm text-slate-700 mt-1">{selectedRecord?.deskripsiKerusakan}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Progres / Status</label>
            <select name="status" defaultValue={selectedRecord?.status || 'Menunggu'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
              <option value="Menunggu">Masih Menunggu / Dalam Antrian</option>
              <option value="Proses Perbaikan">Sedang Proses Perbaikan</option>
              <option value="Tidak Bisa Diperbaiki">Tidak Bisa Diperbaiki / Rusak Total</option>
              <option value="Selesai">Sudah Selesai / Berfungsi Normal</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Nama Teknisi (Yang Mengerjakan)</label>
            <input name="teknisi" type="text" defaultValue={selectedRecord?.teknisi || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Nama teknisi / bengkel" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Biaya Perbaikan / Sparepart (Opsional)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-700 text-sm">Rp</span>
              <input name="biayaEstimasi" type="number" defaultValue={selectedRecord?.biayaEstimasi || ''} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Catatan Teknisi (Opsional)</label>
            <textarea name="catatanTeknisi" defaultValue={selectedRecord?.catatanTeknisi || ''} rows={3} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Part apa yang diganti, tips pencegahan..."></textarea>
          </div>
        </div>
      </FormModal>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Dokumen Laporan Kerusakan/Pemeliharaan"
      >
         {selectedRecord && selectedAsset ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-300">
              <div>
                <h4 className="text-xl font-bold text-slate-900">Tiket Laporan: #{selectedRecord.id.substring(0, 8)}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-sm">
                   <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedRecord.tanggalLapor).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                   </div>
                </div>
              </div>
              <Badge 
                variant={
                  selectedRecord.status === "Selesai" ? "success" : 
                  selectedRecord.status === "Proses Perbaikan" ? "warning" : 
                  selectedRecord.status === "Menunggu" ? "secondary" : "destructive"
                }
              >
                Status: {selectedRecord.status}
              </Badge>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-300 grid sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-700 block text-xs uppercase font-medium tracking-wider mb-1">Aset Rusak</span> 
                  <span className="font-semibold text-slate-900 block text-lg">{selectedAsset.nama}</span>
                  <span className="font-mono text-slate-700 block text-sm mt-0.5">{selectedAsset.kodeBarang} - Rp {selectedAsset.harga.toLocaleString("id-ID")}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-700 block text-xs uppercase font-medium tracking-wider mb-1">Pelapor</span> 
                    <span className="font-medium text-slate-900">{selectedRecord.pelapor}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block text-xs uppercase font-medium tracking-wider mb-1">Teknisi / PIC</span> 
                    <span className="font-medium text-slate-900">{selectedRecord.teknisi || "Belum ditugaskan"}</span>
                  </div>
                </div>
            </div>

            <div className="space-y-2">
               <h5 className="font-semibold text-slate-900">Keluhan / Deskripsi Kerusakan Awal</h5>
               <div className="bg-white border border-slate-300 p-4 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedRecord.deskripsiKerusakan}
               </div>
            </div>

            {selectedRecord.catatanTeknisi && (
              <div className="space-y-2">
                <h5 className="font-semibold text-slate-900">Tindak Lanjut / Catatan Teknisi</h5>
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg text-sm text-primary-900 leading-relaxed">
                    {selectedRecord.catatanTeknisi}
                </div>
              </div>
            )}
            
            {(selectedRecord?.biayaEstimasi ?? 0) > 0 && (
                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-lg">
                   <h5 className="font-medium">Total Biaya Perbaikan</h5>
                   <span className="font-bold text-lg">Rp {selectedRecord?.biayaEstimasi?.toLocaleString("id-ID")}</span>
                </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-300 flex gap-3">
              <Button variant="outline" className="flex-1 shrink-0 bg-white" onClick={() => { setIsPrintModalOpen(true); }}>
                <Printer className="mr-2 h-4 w-4" /> Cetak SPK Perbaikan
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-700">Mencari data tiket...</div>
        )}
      </DetailModal>

      <PrintMaintenanceReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={selectedRecord}
        asset={selectedAsset}
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
