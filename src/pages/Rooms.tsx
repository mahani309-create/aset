import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { DataActions } from "../components/shared/DataActions";
import { useData } from "../contexts/DataContext";
import { Plus, Users, LayoutGrid, Search, Edit, QrCode, Trash2 , ChevronDown, Filter, Inbox} from "lucide-react";
import { FormModal } from "../components/shared/FormModal";
import { useToast } from "../contexts/ToastContext";
import { BarcodeDisplay } from "../components/shared/BarcodeDisplay";
import { PrintBarcodesModal } from "../components/shared/PrintBarcodesModal";
import { PrintSchoolLabelsModal } from "../components/shared/PrintSchoolLabelsModal";
import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";
import { RoomAssetsModal } from "../components/shared/RoomAssetsModal";
import { RowActions } from "../components/shared/RowActions";

import { exportToPdf } from "../lib/exportUtils";

export default function Rooms() {
  const { rooms, setRooms, assets, schoolProfile } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [sortBy, setSortBy] = useState("Nama A-Z");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrintSchoolModalOpen, setIsPrintSchoolModalOpen] = useState(false);
  const [isRoomAssetsModalOpen, setIsRoomAssetsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, isBulk: boolean, idToDelete?: string, title?: string, message?: string}>({isOpen: false, isBulk: false});
const toast = useToast();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value) {
      searchParams.set("q", value);
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams, { replace: true });
  };

  
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
      setRooms(prev => prev.filter(item => !selectedIds.includes(item.id)));
      toast(`Berhasil menghapus ${selectedIds.length} data terpilih.`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      setRooms(prev => prev.filter(item => item.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus data.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRooms.length && filteredRooms.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRooms.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };
const handleAction = (msg: string, type: 'info'|'success'|'error' = 'info') => toast(msg, type);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const roomData: any = {
      nama: formData.get('nama'),
      kodeRuangan: formData.get('kodeRuangan'),
      kapasitas: parseInt(formData.get('kapasitas') as string) || 0,
      penanggungJawab: formData.get('penanggungJawab'),
      jenis: formData.get('jenis'),
      panjang: parseFloat(formData.get('panjang') as string) || undefined,
      lebar: parseFloat(formData.get('lebar') as string) || undefined,
      tinggi: parseFloat(formData.get('tinggi') as string) || undefined,
      luas: parseFloat(formData.get('luas') as string) || undefined,
      bangunan: formData.get('bangunan') || undefined,
      kondisi: formData.get('kondisi') || undefined,
      nipPenanggungJawab: formData.get('nipPenanggungJawab') || undefined,
      tahunBangunan: parseInt(formData.get('tahunBangunan') as string) || undefined,
    };

    if (selectedRoomId) {
      setRooms(prev => prev.map(r => r.id === selectedRoomId ? { ...r, ...roomData } : r));
      toast('Data ruangan berhasil diperbarui', 'success');
    } else {
      setRooms(prev => [...prev, { id: `ROOM-${Date.now()}`, ...roomData }]);
      toast('Ruangan baru berhasil ditambahkan', 'success');
    }
    
    setIsModalOpen(false);
  };

  const exportColumns = [
    { header: "Kode Ruangan", key: "kodeRuangan" },
    { header: "Nama Ruangan", key: "nama" },
    { header: "Jenis", key: "jenis" },
    { header: "Kapasitas", key: "kapasitas" },
    { header: "Luas (m²)", key: "luas" },
    { header: "Penanggung Jawab", key: "penanggungJawab" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredRooms, exportColumns, `Data_Ruangan`);
    toast("Berhasil mengekspor ruangan ke Excel", "success");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredRooms, exportColumns, `Laporan Data Ruangan`, schoolProfile);
    toast("Berhasil mengekspor ruangan ke PDF", "success");
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenis = filterJenis === "Semua" || room.jenis === filterJenis;
    return matchesSearch && matchesJenis;
  }).sort((a, b) => {
    switch (sortBy) {
      case "Nama A-Z":
        return a.nama.localeCompare(b.nama);
      case "Nama Z-A":
        return b.nama.localeCompare(a.nama);
      case "Kapasitas Terbesar":
        return b.kapasitas - a.kapasitas;
      case "Kapasitas Terkecil":
        return a.kapasitas - b.kapasitas;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Ruangan (KIR)</h2>
          <p className="text-slate-700">Kartu Inventaris Ruangan dan rekapitulasi fasilitas sekolah.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataActions 
            onExportExcel={handleExportExcel}
            onExportCsv={() => handleAction("Mengekspor daftar Ruangan ke CSV...")}
            onExportPdf={handleExportPdf}
            onImport={() => { setIsModalOpen(true); handleAction("Memuat form import ruangan..."); }}
          />
          <div className="relative group">
            <Button variant="outline" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>Cetak Label</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-300 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-1">
              <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full border-b border-slate-300"
              >
                Cetak QR Code
              </button>
              <button 
                onClick={() => setIsPrintSchoolModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full"
              >
                Cetak Label Sekolah
              </button>
            </div>
          </div>
          <Button onClick={() => { setSelectedRoomId(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 w-4 h-4" />
            Tambah Ruangan
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-50 border-b border-slate-300/60 rounded-t-xl">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Cari ruangan..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full appearance-none bg-white pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:justify-end">
            <div className="hidden xl:flex items-center mr-1">
                <Filter className="h-4 w-4 text-slate-600" />
              </div>
              <div className="relative w-full sm:w-auto">
              <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all hover:bg-slate-50 transition-colors shadow-sm"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Kelas">Kelas</option>
              <option value="Laboratorium">Laboratorium</option>
              <option value="Kantor">Kantor</option>
              <option value="Perpustakaan">Perpustakaan</option>
              <option value="Fasilitas Umum">Fasilitas Umum</option>
            </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-primary-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <option value="Nama A-Z">Urutkan: Nama A-Z</option>
              <option value="Nama Z-A">Urutkan: Nama Z-A</option>
              <option value="Kapasitas Terbesar">Urutkan: Kapasitas Terbesar</option>
              <option value="Kapasitas Terkecil">Urutkan: Kapasitas Terkecil</option>
            </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
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
      <th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredRooms.length && filteredRooms.length > 0} onChange={toggleSelectAll} /></th>
      <th className="px-6 py-3 font-medium">Kode/Jenis</th>
      <th className="px-6 py-3 font-medium">Nama Ruangan</th>
      <th className="px-6 py-3 font-medium">Penanggung Jawab</th>
      <th className="px-6 py-3 font-medium text-right">Kapasitas</th>
      <th className="px-6 py-3 font-medium text-right">Jumlah Aset</th>
      <th className="px-6 py-3 font-medium text-right">Estimasi Nilai</th>
      <th className="px-6 py-3 font-medium text-right">Aksi</th>
    </tr>
  </thead>
                              <tbody className="divide-y divide-slate-100">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const roomAssets = assets.filter((a) => a.ruanganId && a.ruanganId.includes(room.id));
const totalAssets = roomAssets.length;
const totalValue = roomAssets.reduce((sum, a) => sum + a.harga, 0);
                    return (
                                          <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(room.id)} onChange={() => toggleSelect(room.id)} /></td>
                      <td className="px-6 py-4 text-slate-700"><div className="font-medium">{room.kodeRuangan}</div><div className="text-xs text-slate-700">{room.jenis}</div></td>
                      <td className="px-6 py-4 font-medium text-slate-900">{room.nama}</td>
                      <td className="px-6 py-4">{room.penanggungJawab}</td>
                      <td className="px-6 py-4 text-right">{room.kapasitas} orang</td>
                      <td className="px-6 py-4 text-right font-medium">{totalAssets}</td>
                      <td className="px-6 py-4 text-right text-slate-900">Rp {totalValue.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-right pr-4">
                        <RowActions actions={[
                          { label: "Lihat Daftar Aset", icon: LayoutGrid, onClick: () => { setSelectedRoomId(room.id); setIsRoomAssetsModalOpen(true); } },
                          { label: "Edit Item", icon: Edit, onClick: () => { setSelectedRoomId(room.id); setIsModalOpen(true); } },
                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(room.id, room.nama) }
                        ]} />
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-700">
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
        title={selectedRoomId ? "Edit Formulir Data Ruangan" : "Tambah Formulir Data Ruangan"}
        onSubmit={handleSave}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Nama Ruangan</label>
            <input name="nama" required defaultValue={selectedRoom?.nama || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Contoh: Ruang Kelas 7A" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kode Ruangan</label>
              <input name="kodeRuangan" required defaultValue={selectedRoom?.kodeRuangan || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="R.01" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Jenis Ruangan</label>
              <select name="jenis" defaultValue={selectedRoom?.jenis || 'Kelas'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Kelas">Kelas</option>
                <option value="Laboratorium">Laboratorium</option>
                <option value="Kantor">Kantor</option>
                <option value="Perpustakaan">Perpustakaan</option>
                <option value="Gudang">Gudang</option>
                <option value="Fasilitas Umum">Fasilitas Umum</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tergabung di Bangunan</label>
              <input name="bangunan" defaultValue={selectedRoom?.bangunan || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Nama Bangunan / Gedung" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kondisi</label>
              <select name="kondisi" defaultValue={selectedRoom?.kondisi || 'Baik'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Panjang (m)</label>
              <input name="panjang" defaultValue={selectedRoom?.panjang || ''} type="number" step="0.01" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Lebar (m)</label>
              <input name="lebar" defaultValue={selectedRoom?.lebar || ''} type="number" step="0.01" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tinggi (m)</label>
              <input name="tinggi" defaultValue={selectedRoom?.tinggi || ''} type="number" step="0.01" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Luas (m²)</label>
              <input name="luas" defaultValue={selectedRoom?.luas || ''} type="number" step="0.01" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Penanggung Jawab</label>
              <input name="penanggungJawab" required defaultValue={selectedRoom?.penanggungJawab || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Nama Guru/Staf" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">NIP Penanggung Jawab</label>
              <input name="nipPenanggungJawab" defaultValue={selectedRoom?.nipPenanggungJawab || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="NIP" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kapasitas</label>
              <input name="kapasitas" required defaultValue={selectedRoom?.kapasitas || ''} type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Orang" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tahun Bangunan</label>
              <input name="tahunBangunan" defaultValue={selectedRoom?.tahunBangunan || ''} type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="YYYY" />
            </div>
          </div>
        </div>
      </FormModal>

      <PrintBarcodesModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        assets={filteredRooms.map(r => ({
          ...r,
          kodeBarang: r.kodeRuangan,
          nomorRegister: r.jenis
        }) as any)}
      />

      <PrintSchoolLabelsModal 
        isOpen={isPrintSchoolModalOpen}
        onClose={() => setIsPrintSchoolModalOpen(false)}
        assets={filteredRooms.map(r => ({
          ...r,
          kodeBarang: r.kodeRuangan,
          nomorRegister: r.jenis
        }) as any)}
      />

      <RoomAssetsModal
        isOpen={isRoomAssetsModalOpen}
        onClose={() => setIsRoomAssetsModalOpen(false)}
        room={selectedRoom || null}
        assets={assets.filter(a => selectedRoomId && a.ruanganId && a.ruanganId.includes(selectedRoomId))}
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
