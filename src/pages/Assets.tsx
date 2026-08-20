import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { formatISO } from "date-fns";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { DataActions } from "../components/shared/DataActions";
import { useData } from "../contexts/DataContext";
import { ImportDataModal } from "../components/shared/ImportDataModal";
import { Asset, AssetCategory } from "../types";
import { Plus, Search, Filter, Eye, Edit, Trash2, QrCode, Package, LayoutGrid, List, Copy, ChevronDown , Inbox} from "lucide-react";
import { RowActions } from "../components/shared/RowActions";
import { FormModal } from "../components/shared/FormModal";
import { DetailModal } from "../components/shared/DetailModal";
import { useToast } from "../contexts/ToastContext";
import { exportToExcel, exportToPdf } from "../lib/exportUtils";
import { BarcodeDisplay } from "../components/shared/BarcodeDisplay";
import { PrintBarcodesModal } from "../components/shared/PrintBarcodesModal";
import { PrintSchoolLabelsModal } from "../components/shared/PrintSchoolLabelsModal";
import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";
import { motion, AnimatePresence } from 'motion/react';

export default function Assets() {
  const { assets, setAssets, rooms, schoolProfile, setMaintenances, setDisposals, maintenances, borrowings } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedKib, setSelectedKib] = useState<AssetCategory | "Semua">("Semua");
  const [selectedKondisi, setSelectedKondisi] = useState<string>("Semua");
  const [selectedTahun, setSelectedTahun] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<string>("Terbaru (Tahun)");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrintAllModalOpen, setIsPrintAllModalOpen] = useState(false);
  const [isPrintSchoolModalOpen, setIsPrintSchoolModalOpen] = useState(false);
  const [isPrintAllSchoolModalOpen, setIsPrintAllSchoolModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, isBulk: boolean, idToDelete?: string, title?: string, message?: string}>({isOpen: false, isBulk: false});

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL softly
    if (value) {
      searchParams.set("q", value);
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams, { replace: true });
  };
  
  const [formKib, setFormKib] = useState<AssetCategory>("Peralatan & Mesin (KIB B)");
  const [formImage, setFormImage] = useState<string | null>(null);
  const toast = useToast();

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.nomorRegister.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesKib = selectedKib === "Semua" || asset.kategori === selectedKib;
    const matchesKondisi = selectedKondisi === "Semua" || asset.kondisi === selectedKondisi;
    const matchesTahun = selectedTahun === "Semua" || String(asset.tahunPerolehan) === selectedTahun;

    return matchesSearch && matchesKib && matchesKondisi && matchesTahun;
  }).sort((a, b) => {
    switch (sortBy) {
      case "Terbaru (Tahun)":
        return b.tahunPerolehan - a.tahunPerolehan;
      case "Terlama (Tahun)":
        return a.tahunPerolehan - b.tahunPerolehan;
      case "Nama A-Z":
        return a.nama.localeCompare(b.nama);
      case "Nama Z-A":
        return b.nama.localeCompare(a.nama);
      case "Harga Tertinggi":
        return b.harga - a.harga;
      case "Harga Terendah":
        return a.harga - b.harga;
      default:
        return 0;
    }
  });

  const exportColumns = [
    { header: "Kode Barang", key: "kodeBarang" },
    { header: "No. Register", key: "nomorRegister" },
    { header: "Nama Aset", key: "nama" },
    { header: "Kategori", key: "kategori" },
    { header: "Tahun", key: "tahunPerolehan" },
    { header: "Harga", key: "harga", render: (item: any) => `Rp ${item.harga.toLocaleString('id-ID')}` },
    { header: "Kondisi", key: "kondisi" },
    { header: "Sumber Dana", key: "sumberDana" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredAssets, exportColumns, `Data_Aset_${selectedKib}`);
    toast("Berhasil mengekspor KIB ke Excel", "success");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredAssets, exportColumns, `Laporan Data Aset KIB - ${selectedKib}`, schoolProfile);
    toast("Berhasil mengekspor KIB ke PDF", "success");
  };

  const kibOptions: (AssetCategory | "Semua")[] = [
    "Semua",
    "Tanah (KIB A)",
    "Peralatan & Mesin (KIB B)",
    "Gedung & Bangunan (KIB C)",
    "Jalan, Irigasi & Jaringan (KIB D)",
    "Aset Tetap Lainnya (KIB E)",
    "Aset Tak Berwujud",
    "Ekstrakomptabel"
  ];
  
  const tahunOptions = ["Semua", ...Array.from(new Set(assets.map(a => String(a.tahunPerolehan)))).sort().reverse()];

  const handleAction = (action: string, assetName: string, type: 'info' | 'success' | 'error' = 'info') => {
    toast(`${action} untuk aset: ${assetName}`, type);
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModalState({
      isOpen: true,
      isBulk: false,
      idToDelete: id,
      title: "Hapus Data Aset",
      message: `Apakah Anda yakin ingin menghapus aset "${name}"? Aksi ini tidak dapat dibatalkan.`
    });
  };

  const openBulkDeleteModal = () => {
    setDeleteModalState({
      isOpen: true,
      isBulk: true,
      title: "Hapus Kelompok Aset",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data aset terpilih? Aksi ini tidak dapat dibatalkan.`
    });
  };

  const confirmDelete = () => {
    if (deleteModalState.isBulk) {
      setAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
      toast(`Berhasil menghapus ${selectedIds.length} aset terpilih.`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      setAssets(prev => prev.filter(a => a.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus aset.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length && filteredAssets.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const assetData: any = {
      nama: formData.get('nama'),
      kodeBarang: formData.get('kodeBarang'),
      nomorRegister: formData.get('nomorRegister'),
      kategori: formKib,
      gambarUrl: formImage || undefined,
      tahunPerolehan: parseInt(formData.get('tahunPerolehan') as string) || new Date().getFullYear(),
      harga: parseInt(formData.get('harga') as string) || 0,
      sumberDana: formData.get('sumberDana'),
      kondisi: formData.get('kondisi'),
      ruanganId: formKib === "Gedung & Bangunan (KIB C)" ? formData.getAll('ruanganId').join(',') : (formData.get('ruanganId') || ''),
      catatan: formData.get('catatan') || '',
      merk: formData.get('merk') || '',
      bahan: formData.get('bahan') || '',
      luasTanah: formData.get('luasTanah') ? parseInt(formData.get('luasTanah') as string) : undefined,
      statusHak: formData.get('statusHak') || undefined,
      letakAlamat: formData.get('letakAlamat') || undefined,
      tanggalSertifikat: formData.get('tanggalSertifikat') || undefined,
      nomorSertifikat: formData.get('nomorSertifikat') || undefined,
      penggunaan: formData.get('penggunaan') || undefined,
      ukuranCc: formData.get('ukuranCc') || undefined,
      nomorPabrik: formData.get('nomorPabrik') || undefined,
      nomorMesin: formData.get('nomorMesin') || undefined,
      nomorRangka: formData.get('nomorRangka') || undefined,
      nomorPolisi: formData.get('nomorPolisi') || undefined,
      nomorBpkb: formData.get('nomorBpkb') || undefined,
      kondisiBangunan: formData.get('kondisiBangunan') || undefined,
      bertingkat: formData.get('bertingkat') || undefined,
      beton: formData.get('beton') || undefined,
      luasLantai: formData.get('luasLantai') ? parseInt(formData.get('luasLantai') as string) : undefined,
      dokumenGedungTanggal: formData.get('dokumenGedungTanggal') || undefined,
      dokumenGedungNomor: formData.get('dokumenGedungNomor') || undefined,
      statusTanah: formData.get('statusTanah') || undefined,
      nomorKodeTanah: formData.get('nomorKodeTanah') || undefined,
      konstruksi: formData.get('konstruksi') || undefined,
      panjang: formData.get('panjang') ? parseInt(formData.get('panjang') as string) : undefined,
      lebar: formData.get('lebar') ? parseInt(formData.get('lebar') as string) : undefined,
      luasKibD: formData.get('luasKibD') ? parseInt(formData.get('luasKibD') as string) : undefined,
      dokumenTanggalKibD: formData.get('dokumenTanggalKibD') || undefined,
      dokumenNomorKibD: formData.get('dokumenNomorKibD') || undefined,
      statusTanahKibD: formData.get('statusTanahKibD') || undefined,
      nomorKodeTanahKibD: formData.get('nomorKodeTanahKibD') || undefined,
      bukuJudulPencipta: formData.get('bukuJudulPencipta') || undefined,
      bukuSpesifikasi: formData.get('bukuSpesifikasi') || undefined,
      seniAsalDaerah: formData.get('seniAsalDaerah') || undefined,
      seniPencipta: formData.get('seniPencipta') || undefined,
      seniBahan: formData.get('seniBahan') || undefined,
      hewanTumbuhanJenis: formData.get('hewanTumbuhanJenis') || undefined,
      hewanTumbuhanUkuran: formData.get('hewanTumbuhanUkuran') || undefined,
      jumlahKibE: formData.get('jumlahKibE') ? parseInt(formData.get('jumlahKibE') as string) : undefined,
      tahunCetakKibE: formData.get('tahunCetakKibE') || undefined,
    };

    if (selectedAssetId) {
      setAssets(prev => prev.map(a => a.id === selectedAssetId ? { ...a, ...assetData } : a));
      toast('Data aset berhasil diperbarui', 'success');
      
      const previousAsset = assets.find(a => a.id === selectedAssetId);
      if (previousAsset && previousAsset.kondisi !== assetData.kondisi) {
        if (assetData.kondisi === "Rusak") {
          setMaintenances(prev => [...prev, {
            id: `MNT-${Date.now()}`,
            assetId: selectedAssetId,
            tanggalLapor: formatISO(new Date()),
            pelapor: "Sistem (Otomatis)",
            deskripsiKerusakan: "Aset dilaporkan rusak melalui perubahan status kondisi.",
            status: "Menunggu"
          }]);
          toast("Aset otomatis masuk ke daftar Pemeliharaan.", "info");
        } else if (assetData.kondisi === "Rusak Berat") {
          setDisposals(prev => [...prev, {
            id: `DSP-${Date.now()}`,
            assetId: selectedAssetId,
            tanggalPengajuan: formatISO(new Date()),
            metode: "Pemusnahan",
            alasan: "Kondisi aset diubah menjadi rusak berat.",
            status: "Diajukan"
          }]);
          toast("Aset otomatis masuk ke daftar Penghapusan.", "info");
        }
      }
    } else {
      const newAssetId = `ASSET-${Date.now()}`;
      setAssets(prev => [...prev, { id: newAssetId, ...assetData }]);
      toast('Aset baru berhasil ditambahkan', 'success');

      if (assetData.kondisi === "Rusak") {
        setMaintenances(prev => [...prev, {
          id: `MNT-${Date.now()}`,
          assetId: newAssetId,
          tanggalLapor: formatISO(new Date()),
          pelapor: "Sistem (Otomatis)",
          deskripsiKerusakan: "Aset dilaporkan rusak saat ditambahkan.",
          status: "Menunggu"
        }]);
        toast("Aset otomatis masuk ke daftar Pemeliharaan.", "info");
      } else if (assetData.kondisi === "Rusak Berat") {
        setDisposals(prev => [...prev, {
          id: `DSP-${Date.now()}`,
          assetId: newAssetId,
          tanggalPengajuan: formatISO(new Date()),
          metode: "Pemusnahan",
          alasan: "Aset ditambahkan dengan kondisi rusak berat.",
          status: "Diajukan"
        }]);
        toast("Aset otomatis masuk ke daftar Penghapusan.", "info");
      }
    }
    
    setIsModalOpen(false);
  };

  const openDetail = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsDetailModalOpen(true);
  };

  const openEdit = (assetId: string, assetName: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setFormKib(asset.kategori);
      setFormImage(asset.gambarUrl || null);
    }
    setSelectedAssetId(assetId);
    setIsModalOpen(true);
    handleAction("Memuat edit mode", assetName);
  };

  const handleDuplicate = (assetId: string) => {
    const assetToDuplicate = assets.find(a => a.id === assetId);
    if (!assetToDuplicate) return;

    const newAssetId = `ASSET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const duplicatedAsset: Asset = {
      ...assetToDuplicate,
      id: newAssetId,
      kodeBarang: assetToDuplicate.kodeBarang,
      nomorRegister: String(parseInt(assetToDuplicate.nomorRegister) + 1 || 0).padStart(4, '0'),
      nama: assetToDuplicate.nama + ' (Copy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAssets(prev => [...prev, duplicatedAsset]);
    toast(`Aset "${assetToDuplicate.nama}" berhasil diduplikat`, "success");
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast("Ukuran gambar terlalu besar (Maksimal 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Data Aset (KIB)</h2>
          <p className="text-slate-700">Kartu Inventaris Barang sarana dan prasarana sekolah.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataActions 
            onExportExcel={handleExportExcel}
            onExportCsv={() => toast("Fitur CSV belum diimplementasikan...", "info")}
            onExportPdf={handleExportPdf}
            onImport={() => setIsImportModalOpen(true)}
          />
          <div className="relative group">
            <Button variant="outline" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>Cetak Label QR</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-300 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-1">
              <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full"
              >
                QR Code Aktif
              </button>
              <button 
                onClick={() => setIsPrintAllModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full border-b border-slate-300"
              >
                Semua QR Code
              </button>
              <button 
                onClick={() => setIsPrintSchoolModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full"
              >
                Label Sekolah Aktif
              </button>
              <button 
                onClick={() => setIsPrintAllSchoolModalOpen(true)}
                className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full"
              >
                Semua Label Sekolah
              </button>
            </div>
          </div>
          <Button onClick={() => { setFormKib("Peralatan & Mesin (KIB B)"); setSelectedAssetId(null); setFormImage(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 w-4 h-4" />
            Tambah Aset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-300 bg-slate-50/50 pb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                placeholder="Cari kode, register, atau nama..."
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
                value={selectedKib}
                onChange={(e) => setSelectedKib(e.target.value as any)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all hover:bg-slate-50 transition-colors shadow-sm"
              >
                {kibOptions.map(option => (
                  <option key={option} value={option}>
                    {option === "Semua" ? "Kategori KIB: Semua Kategori" : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={selectedKondisi}
                onChange={(e) => setSelectedKondisi(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all hover:bg-slate-50 transition-colors shadow-sm"
              >
                <option value="Semua">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all hover:bg-slate-50 transition-colors shadow-sm"
              >
                {tahunOptions.map(t => (
                  <option key={t} value={t}>{t === "Semua" ? "Semua Tahun" : t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
            </div>
              <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-primary-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <option value="Terbaru (Tahun)">Urutkan: Terbaru (Tahun)</option>
                <option value="Terlama (Tahun)">Urutkan: Terlama (Tahun)</option>
                <option value="Nama A-Z">Urutkan: Nama A-Z</option>
                <option value="Nama Z-A">Urutkan: Nama Z-A</option>
                <option value="Harga Tertinggi">Urutkan: Harga Tertinggi</option>
                <option value="Harga Terendah">Urutkan: Harga Terendah</option>
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
                  onClick={() => setViewMode("grid")} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary-600" : "text-slate-700 hover:text-slate-700"}`}
                  title="Grid/Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Bulk Actions Bar */}
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

        <CardContent className="p-0">
          {viewMode === "list" ? (
            <div className="overflow-x-auto min-h-[300px] pb-24">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50/50 border-b border-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-medium w-12">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedIds.length === filteredAssets.length && filteredAssets.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 font-medium">Kode & Register</th>
                    <th className="px-6 py-3 font-medium">Informasi Aset</th>
                    <th className="px-6 py-3 font-medium">Kategori KIB</th>
                    <th className="px-6 py-3 font-medium">Sumber Dana</th>
                    <th className="px-6 py-3 font-medium">Nilai / Harga</th>
                    <th className="px-6 py-3 font-medium">Kondisi</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => {
                      let roomDisplay = "-";
                      if (asset.ruanganId) {
                        const assetRooms = asset.ruanganId.split(',').map(id => rooms.find(r => r.id === id)?.nama).filter(Boolean);
                        if (assetRooms.length > 0) {
                          roomDisplay = assetRooms.join(', ');
                        }
                      }

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                              checked={selectedIds.includes(asset.id)}
                              onChange={() => toggleSelect(asset.id)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-slate-800">{asset.kodeBarang}</div>
                            <div className="font-mono text-slate-700 text-xs mt-1">Reg: {asset.nomorRegister}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {asset.gambarUrl ? (
                                <div className="w-10 h-10 rounded shadow-sm overflow-hidden border border-slate-300 shrink-0">
                                  <img src={asset.gambarUrl} alt={asset.nama} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded shrink-0 bg-slate-100 flex items-center justify-center border border-slate-300">
                                  <Package className="w-5 h-5 text-slate-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-900">{asset.nama}</p>
                                <p className="text-slate-700 text-xs mt-0.5">{asset.merk || '-'} • {asset.tahunPerolehan} • 🏢 {roomDisplay}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {asset.kategori}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-slate-300 bg-white text-slate-700 shadow-sm">
                              {asset.sumberDana}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-900">Rp {asset.harga.toLocaleString('id-ID')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={
                                asset.kondisi === "Baik" ? "success" : 
                                asset.kondisi === "Rusak Ringan" ? "warning" : "destructive"
                              }
                            >
                              {asset.kondisi}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right pr-4">
                            <RowActions actions={[
                              { label: "Lihat Detail", icon: Eye, onClick: () => openDetail(asset.id) },
                              { label: "Edit Aset", icon: Edit, onClick: () => openEdit(asset.id, asset.nama) },
                              { label: "Duplikat", icon: Copy, onClick: () => handleDuplicate(asset.id) },
                              { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(asset.id, asset.nama) }
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
          ) : (
            <div className="p-6">
              {filteredAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAssets.map((asset) => {
                    let roomDisplay = "-";
                    if (asset.ruanganId) {
                      const assetRooms = asset.ruanganId.split(',').map(id => rooms.find(r => r.id === id)?.nama).filter(Boolean);
                      if (assetRooms.length > 0) {
                        roomDisplay = assetRooms.join(', ');
                      }
                    }
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={asset.id} 
                        className="bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
                      >
                        <div className="absolute top-3 left-3 z-10 bg-white/50 backdrop-blur-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer shadow-sm"
                            checked={selectedIds.includes(asset.id)}
                            onChange={() => toggleSelect(asset.id)}
                          />
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                          <Badge 
                            variant={
                              asset.kondisi === "Baik" ? "success" : 
                              asset.kondisi === "Rusak Ringan" ? "warning" : "destructive"
                            }
                            className="shadow-sm border border-white/20 backdrop-blur-md bg-white/90"
                          >
                            {asset.kondisi}
                          </Badge>
                        </div>
                        <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                          {asset.gambarUrl ? (
                            <img src={asset.gambarUrl} alt={asset.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <Package className="w-16 h-16 text-slate-300" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end">
                            <div className="p-4 w-full">
                              <h3 className="text-white font-bold truncate">{asset.nama}</h3>
                              <p className="text-white/80 text-xs font-mono">{asset.kodeBarang}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-slate-700 text-xs">Register</p>
                              <p className="font-medium text-slate-800">{asset.nomorRegister}</p>
                            </div>
                            <div>
                              <p className="text-slate-700 text-xs">Tahun</p>
                              <p className="font-medium text-slate-800">{asset.tahunPerolehan}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-slate-700 text-xs">Ruangan</p>
                              <p className="font-medium text-slate-800 truncate">🏢 {roomDisplay}</p>
                            </div>
                          </div>
                          
                          <div className="mt-auto pt-3 border-t border-slate-300 flex items-center justify-between">
                            <p className="font-bold text-primary-600">Rp {asset.harga.toLocaleString('id-ID')}</p>
                            <div className="flex gap-1">
                              <button onClick={() => openDetail(asset.id)} className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors" title="Lihat Detail">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => openEdit(asset.id, asset.nama)} className="p-1.5 text-slate-600 hover:text-primary-600 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDuplicate(asset.id)} className="p-1.5 text-slate-600 hover:text-primary-600 transition-colors" title="Duplikat Aset">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium">Tidak ada data aset yang ditemukan untuk kategori atau pencarian tersebut.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedAssetId ? "Edit Formulir Aset KIB" : "Tambah Formulir Aset KIB"}
        onSubmit={handleSave}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Gambar Aset (Opsional)</label>
            <div className="flex items-center gap-4">
              {formImage ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300">
                  <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setFormImage(null)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <span className="text-slate-600 text-xs text-center px-2">Tidak ada gambar</span>
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors cursor-pointer"
                />
                <p className="mt-1 text-xs text-slate-600">Maks. 2MB. Format: JPG, PNG.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Kategori KIB</label>
            <select 
              value={formKib}
              onChange={(e) => setFormKib(e.target.value as AssetCategory)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white"
            >
              {kibOptions.filter(k => k !== "Semua").map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Nama / Jenis Barang</label>
            <input name="nama" required defaultValue={selectedAsset?.nama || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Contoh: Laptop Asus Zenbook" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kode Barang</label>
              <input name="kodeBarang" required defaultValue={selectedAsset?.kodeBarang || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="02.06.xxx.xxx" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Nomor Register</label>
              <input name="nomorRegister" required defaultValue={selectedAsset?.nomorRegister || ''} type="text" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="0001" />
            </div>
          </div>

          {/* Conditional Fields based on KIB Category */}
          {formKib === "Tanah (KIB A)" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Luas Tanah (m2)</label>
                  <input name="luasTanah" type="number" defaultValue={selectedAsset?.luasTanah || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Luas m2" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Status Hak</label>
                  <select name="statusHak" defaultValue={selectedAsset?.statusHak || 'Hak Milik'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none bg-white">
                    <option value="Hak Milik">Hak Milik</option>
                    <option value="Hak Pakai">Hak Pakai</option>
                    <option value="Hak Guna Bangunan">Hak Guna Bangunan</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-900">Letak / Alamat</label>
                <textarea name="letakAlamat" defaultValue={selectedAsset?.letakAlamat || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Alamat lengkap lokasi tanah"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Tanggal Sertifikat</label>
                  <input name="tanggalSertifikat" type="date" defaultValue={selectedAsset?.tanggalSertifikat || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">No. Sertifikat</label>
                  <input name="nomorSertifikat" type="text" defaultValue={selectedAsset?.nomorSertifikat || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Sertifikat" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-900">Penggunaan</label>
                <input name="penggunaan" type="text" defaultValue={selectedAsset?.penggunaan || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Contoh: Bangunan Sekolah" />
              </div>
            </>
          )}

          {formKib === "Peralatan & Mesin (KIB B)" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Merk / Type</label>
                  <input name="merk" type="text" defaultValue={selectedAsset?.merk || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Merk/Type" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Ukuran / CC</label>
                  <input name="ukuranCc" type="text" defaultValue={selectedAsset?.ukuranCc || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Ukuran/CC" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">No. Pabrik / No. Rangka</label>
                  <input name="nomorPabrik" type="text" defaultValue={`${selectedAsset?.nomorPabrik || ''}`} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Nomor Pabrik" />
                  <input name="nomorRangka" type="text" defaultValue={`${selectedAsset?.nomorRangka || ''}`} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Rangka" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">No. Mesin / Polisi / BPKB</label>
                  <input name="nomorMesin" type="text" defaultValue={`${selectedAsset?.nomorMesin || ''}`} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="No Mesin/Polisi" />
                  <input name="nomorBpkb" type="text" defaultValue={`${selectedAsset?.nomorBpkb || ''}`} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="No BPKB" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-900">Bahan</label>
                <input name="bahan" type="text" defaultValue={selectedAsset?.bahan || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Bahan (Plastik, Besi, Kayu...)" />
              </div>
            </>
          )}

          {formKib === "Gedung & Bangunan (KIB C)" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Kondisi Bangunan</label>
                  <select name="kondisiBangunan" defaultValue={selectedAsset?.kondisiBangunan || 'Baik'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none bg-white">
                    <option value="Baik">Baik</option>
                    <option value="Kurang Baik">Kurang Baik</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Konstruksi</label>
                  <div className="flex gap-2 items-center">
                    <select name="bertingkat" defaultValue={selectedAsset?.bertingkat || 'Tidak'} className="border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-primary-500 outline-none bg-white w-full">
                      <option value="Bertingkat">Bertingkat</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                    <select name="beton" defaultValue={selectedAsset?.beton || 'Beton'} className="border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-primary-500 outline-none bg-white w-full">
                      <option value="Beton">Beton</option>
                      <option value="Bukan">Bukan Beton</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-900">Letak / Alamat</label>
                <textarea name="letakAlamat" defaultValue={selectedAsset?.letakAlamat || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Alamat lengkap gedung"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Dokumen Gedung (Tgl & No)</label>
                  <input name="dokumenGedungTanggal" type="date" defaultValue={selectedAsset?.dokumenGedungTanggal || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" />
                  <input name="dokumenGedungNomor" type="text" defaultValue={selectedAsset?.dokumenGedungNomor || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Dokumen" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Status & No Kode Tanah</label>
                  <input name="statusTanah" type="text" defaultValue={selectedAsset?.statusTanah || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Status (Hak Milik, Hak Pakai)" />
                  <input name="nomorKodeTanah" type="text" defaultValue={selectedAsset?.nomorKodeTanah || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Kode Tanah" />
                </div>
              </div>
            </>
          )}

          {formKib === "Jalan, Irigasi & Jaringan (KIB D)" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Konstruksi</label>
                  <input name="konstruksi" type="text" defaultValue={selectedAsset?.konstruksi || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Konstruksi baja/beton" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Letak / Lokasi</label>
                  <input name="letakAlamat" type="text" defaultValue={selectedAsset?.letakAlamat || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Lokasi" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Panjang (m)</label>
                  <input name="panjang" type="number" defaultValue={selectedAsset?.panjang || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Lebar (m)</label>
                  <input name="lebar" type="number" defaultValue={selectedAsset?.lebar || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="0" />
                </div>
                <div className="grid gap-2">
                   <label className="text-sm font-medium text-slate-900">Luas (m2)</label>
                  <input name="luasKibD" type="number" defaultValue={selectedAsset?.luasKibD || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Dokumen (Tgl & No)</label>
                  <input name="dokumenTanggalKibD" type="date" defaultValue={selectedAsset?.dokumenTanggalKibD || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" />
                  <input name="dokumenNomorKibD" type="text" defaultValue={selectedAsset?.dokumenNomorKibD || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Dokumen" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Status & No Kode Tanah</label>
                  <input name="statusTanahKibD" type="text" defaultValue={selectedAsset?.statusTanahKibD || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Status Tanah" />
                  <input name="nomorKodeTanahKibD" type="text" defaultValue={selectedAsset?.nomorKodeTanahKibD || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Nomor Kode Tanah" />
                </div>
              </div>
            </>
          )}

          {formKib === "Aset Tetap Lainnya (KIB E)" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Buku Perpustakaan</label>
                  <input name="bukuJudulPencipta" type="text" defaultValue={selectedAsset?.bukuJudulPencipta || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Judul / Pencipta" />
                  <input name="bukuSpesifikasi" type="text" defaultValue={selectedAsset?.bukuSpesifikasi || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Spesifikasi" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Barang Kesenian / Kebudayaan</label>
                  <input name="seniAsalDaerah" type="text" defaultValue={selectedAsset?.seniAsalDaerah || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Asal Daerah" />
                  <div className="flex gap-1">
                    <input name="seniPencipta" type="text" defaultValue={selectedAsset?.seniPencipta || ''} className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:border-primary-500 outline-none w-1/2" placeholder="Pencipta" />
                    <input name="seniBahan" type="text" defaultValue={selectedAsset?.seniBahan || ''} className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:border-primary-500 outline-none w-1/2" placeholder="Bahan" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900">Hewan Ternak / Tumbuhan</label>
                  <input name="hewanTumbuhanJenis" type="text" defaultValue={selectedAsset?.hewanTumbuhanJenis || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Jenis Hewan/Tumbuhan" />
                  <input name="hewanTumbuhanUkuran" type="text" defaultValue={selectedAsset?.hewanTumbuhanUkuran || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Ukuran" />
                </div>
                <div className="grid gap-2">
                   <label className="text-sm font-medium text-slate-900">Jumlah & Tahun Cetak</label>
                   <input name="jumlahKibE" type="number" defaultValue={selectedAsset?.jumlahKibE || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none mb-1" placeholder="Jumlah" />
                   <input name="tahunCetakKibE" type="text" defaultValue={selectedAsset?.tahunCetakKibE || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none" placeholder="Tahun Cetak / Pengadaan" />
                </div>
              </div>
            </>
          )}

          <hr className="my-2 border-slate-300" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Tahun Pengadaan/Perolehan</label>
              <input name="tahunPerolehan" required defaultValue={selectedAsset?.tahunPerolehan || new Date().getFullYear()} type="number" min="1990" max="2099" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="2023" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Harga Perolehan</label>
              <input name="harga" required defaultValue={selectedAsset?.harga || ''} type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Rp" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Asal Usul Cara Perolehan</label>
              <select name="sumberDana" defaultValue={selectedAsset?.sumberDana || 'BOS Reguler'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="BOS Reguler">BOS Reguler</option>
                <option value="BOS Kinerja">BOS Kinerja</option>
                <option value="BOS Daerah (BOSDa)">BOS Daerah (BOSDa)</option>
                <option value="Hibah / Sumbangan">Hibah / Sumbangan</option>
                <option value="Yayasan">Yayasan</option>
                <option value="Pemerintah Pusat">Pemerintah Pusat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Kondisi Barang</label>
              <select name="kondisi" defaultValue={selectedAsset?.kondisi || 'Baik'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Ruangan</label>
            <select 
              name="ruanganId" 
              multiple={formKib === "Gedung & Bangunan (KIB C)"}
              defaultValue={formKib === "Gedung & Bangunan (KIB C)" ? (selectedAsset?.ruanganId ? selectedAsset.ruanganId.split(',') : []) : (selectedAsset?.ruanganId || "")} 
              className={`border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-white ${formKib === "Gedung & Bangunan (KIB C)" ? "h-24" : ""}`}
            >
              {formKib !== "Gedung & Bangunan (KIB C)" && <option value="">Pilih ruangan (opsional)...</option>}
              {rooms.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
            </select>
            {formKib === "Gedung & Bangunan (KIB C)" && <p className="text-xs text-slate-700 mt-1">Gunakan Ctrl/Cmd + Klik untuk memilih lebih dari satu ruangan.</p>}
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Keterangan / Tambahan</label>
            <textarea name="catatan" defaultValue={selectedAsset?.catatan || ''} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none" placeholder="Catatan tambahan..."></textarea>
          </div>
        </div>
      </FormModal>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Kartu Inventaris Barang"
      >
        {selectedAsset ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900">{selectedAsset.nama}</h4>
                <div className="flex gap-2 items-center mt-1">
                  <Badge variant="secondary">{selectedAsset.kategori}</Badge>
                  <span className="text-sm font-mono text-slate-700">Kode: {selectedAsset.kodeBarang}</span>
                  <span className="text-sm font-mono text-slate-700">Reg: {selectedAsset.nomorRegister}</span>
                </div>
              </div>
              <Badge 
                variant={
                  selectedAsset.kondisi === "Baik" ? "success" : 
                  selectedAsset.kondisi === "Rusak Ringan" ? "warning" : "destructive"
                }
              >
                {selectedAsset.kondisi}
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-300">
                  <div className="space-y-3">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Tahun Perolehan</span> <span className="font-semibold text-slate-900">{selectedAsset.tahunPerolehan}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Asal Usul / Sumber Dana</span> <span className="font-semibold text-slate-900">{selectedAsset.sumberDana}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Harga Perolehan</span> <span className="font-semibold text-slate-900 text-primary-700">Rp {selectedAsset.harga.toLocaleString('id-ID')}</span></p>
                  </div>
                  <div className="space-y-3">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Lokasi Ruangan</span> 
                      <span className="font-semibold text-slate-900">
                        {selectedAsset.ruanganId ? 
                          (selectedAsset.ruanganId.split(',').map(id => rooms.find(r => r.id === id)?.nama).filter(Boolean).join(', ') || "Tidak Ditetapkan") 
                          : "Tidak Ditetapkan"}
                      </span>
                    </p>
                    {selectedAsset.merk && (
                      <p><span className="text-slate-700 block text-xs uppercase font-medium">Merk / Type</span> <span className="font-semibold text-slate-900">{selectedAsset.merk}</span></p>
                    )}
                    {selectedAsset.bahan && (
                      <p><span className="text-slate-700 block text-xs uppercase font-medium">Bahan</span> <span className="font-semibold text-slate-900">{selectedAsset.bahan}</span></p>
                    )}
                  </div>
                </div>

                {/* Additional KIB Details if present */}
                {selectedAsset.kategori === "Tanah (KIB A)" && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border border-slate-300 rounded-xl">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Luas Tanah (M2)</span> <span className="font-semibold text-slate-900">{selectedAsset.luasTanah || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Status Hak</span> <span className="font-semibold text-slate-900">{selectedAsset.statusHak || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Letak/Alamat</span> <span className="font-semibold text-slate-900">{selectedAsset.letakAlamat || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Sertifikat</span> <span className="font-semibold text-slate-900">{selectedAsset.tanggalSertifikat || '-'} / {selectedAsset.nomorSertifikat || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Penggunaan</span> <span className="font-semibold text-slate-900">{selectedAsset.penggunaan || '-'}</span></p>
                  </div>
                )}

                {selectedAsset.kategori === "Peralatan & Mesin (KIB B)" && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border border-slate-300 rounded-xl">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Ukuran / CC</span> <span className="font-semibold text-slate-900">{selectedAsset.ukuranCc || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Nomor Pabrik/Mesin</span> <span className="font-semibold text-slate-900">{selectedAsset.nomorPabrik || '-'} / {selectedAsset.nomorMesin || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Nomor Rangka/Polisi</span> <span className="font-semibold text-slate-900">{selectedAsset.nomorRangka || '-'} / {selectedAsset.nomorPolisi || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Nomor BPKB</span> <span className="font-semibold text-slate-900">{selectedAsset.nomorBpkb || '-'}</span></p>
                  </div>
                )}
                
                {selectedAsset.kategori === "Gedung & Bangunan (KIB C)" && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border border-slate-300 rounded-xl">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Kondisi Bangunan</span> <span className="font-semibold text-slate-900">{selectedAsset.kondisiBangunan || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Konstruksi Bertingkat / Beton</span> <span className="font-semibold text-slate-900">{selectedAsset.bertingkat || '-'} / {selectedAsset.beton || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Luas Lantai (M2)</span> <span className="font-semibold text-slate-900">{selectedAsset.luasLantai || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Letak/Alamat</span> <span className="font-semibold text-slate-900">{selectedAsset.letakAlamat || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Dokumen Gedung</span> <span className="font-semibold text-slate-900">{selectedAsset.dokumenGedungTanggal || '-'} / {selectedAsset.dokumenGedungNomor || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Status / Kode Tanah</span> <span className="font-semibold text-slate-900">{selectedAsset.statusTanah || '-'} / {selectedAsset.nomorKodeTanah || '-'}</span></p>
                  </div>
                )}

                {selectedAsset.kategori === "Jalan, Irigasi & Jaringan (KIB D)" && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border border-slate-300 rounded-xl">
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Konstruksi</span> <span className="font-semibold text-slate-900">{selectedAsset.konstruksi || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Letak/Lokasi</span> <span className="font-semibold text-slate-900">{selectedAsset.letakAlamat || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Panjang / Lebar / Luas</span> <span className="font-semibold text-slate-900">{selectedAsset.panjang || 0}m / {selectedAsset.lebar || 0}m / {selectedAsset.luasKibD || 0}m2</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Dokumen Gedung</span> <span className="font-semibold text-slate-900">{selectedAsset.dokumenTanggalKibD || '-'} / {selectedAsset.dokumenNomorKibD || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Status / Kode Tanah</span> <span className="font-semibold text-slate-900">{selectedAsset.statusTanahKibD || '-'} / {selectedAsset.nomorKodeTanahKibD || '-'}</span></p>
                  </div>
                )}

                {selectedAsset.kategori === "Aset Tetap Lainnya (KIB E)" && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border border-slate-300 rounded-xl">
                    <div className="col-span-2 border-b border-slate-300 pb-2 mb-2"><span className="font-bold text-slate-800">Buku Perpustakaan</span></div>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Judul / Pencipta</span> <span className="font-semibold text-slate-900">{selectedAsset.bukuJudulPencipta || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Spesifikasi</span> <span className="font-semibold text-slate-900">{selectedAsset.bukuSpesifikasi || '-'}</span></p>
                    
                    <div className="col-span-2 border-b border-slate-300 pb-2 mb-2 mt-2"><span className="font-bold text-slate-800">Kesenian / Kebudayaan</span></div>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Asal Daerah</span> <span className="font-semibold text-slate-900">{selectedAsset.seniAsalDaerah || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Pencipta / Bahan</span> <span className="font-semibold text-slate-900">{selectedAsset.seniPencipta || '-'} / {selectedAsset.seniBahan || '-'}</span></p>

                    <div className="col-span-2 border-b border-slate-300 pb-2 mb-2 mt-2"><span className="font-bold text-slate-800">Hewan / Tumbuhan</span></div>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Jenis</span> <span className="font-semibold text-slate-900">{selectedAsset.hewanTumbuhanJenis || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Ukuran</span> <span className="font-semibold text-slate-900">{selectedAsset.hewanTumbuhanUkuran || '-'}</span></p>

                    <div className="col-span-2 border-b border-slate-300 pb-2 mb-2 mt-2"><span className="font-bold text-slate-800">Informasi Umum KIB E</span></div>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Jumlah</span> <span className="font-semibold text-slate-900">{selectedAsset.jumlahKibE || '-'}</span></p>
                    <p><span className="text-slate-700 block text-xs uppercase font-medium">Tahun Cetak / Pengadaan</span> <span className="font-semibold text-slate-900">{selectedAsset.tahunCetakKibE || '-'}</span></p>
                  </div>
                )}

                {selectedAsset.catatan && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
                    <span className="font-medium text-slate-900 block mb-1">Keterangan:</span>
                    {selectedAsset.catatan}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1 space-y-6">
                {selectedAsset.gambarUrl && (
                  <div className="w-full text-center">
                    <img src={selectedAsset.gambarUrl} alt={selectedAsset.nama} className="w-full max-w-[250px] mx-auto rounded-lg shadow-sm border border-slate-300" />
                  </div>
                )}
                <BarcodeDisplay 
                  value={selectedAsset.kodeBarang} 
                  title={selectedAsset.nama} 
                  subtitle={`Reg: ${selectedAsset.nomorRegister}`} 
                />

                {/* History Section */}
                <div className="mt-8 space-y-4">
                  <h5 className="font-bold text-slate-800 border-b border-slate-300 pb-2">Riwayat Peminjaman Terakhir</h5>
                  {(() => {
                    const assetBorrowings = borrowings?.filter((b: any) => b.assetId === selectedAsset.id) || [];
                    if (assetBorrowings.length === 0) {
                      return <p className="text-sm text-slate-700 italic">Belum ada riwayat peminjaman.</p>;
                    }
                    // Sort descending by date
                    const latestBorrowings = assetBorrowings.sort((a: any, b: any) => new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime()).slice(0, 3);
                    return (
                      <div className="space-y-3">
                        {latestBorrowings.map((b: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-300 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-slate-900">{b.peminjam}</span>
                              <Badge variant={b.status === "Dikembalikan" ? "success" : "warning"}>{b.status}</Badge>
                            </div>
                            <p className="text-slate-700 text-xs">
                              {new Date(b.tanggalPinjam).toLocaleDateString('id-ID')}
                              {b.tanggalKembali ? ` - ${new Date(b.tanggalKembali).toLocaleDateString('id-ID')}` : ' (Belum dikembalikan)'}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-4 space-y-4">
                  <h5 className="font-bold text-slate-800 border-b border-slate-300 pb-2">Riwayat Pemeliharaan/Servis</h5>
                  {(() => {
                    const assetMaint = maintenances?.filter((m: any) => m.assetId === selectedAsset.id) || [];
                    if (assetMaint.length === 0) {
                      return <p className="text-sm text-slate-700 italic">Belum ada riwayat pemeliharaan.</p>;
                    }
                    const latestMaint = assetMaint.sort((a: any, b: any) => new Date(b.tanggalLapor).getTime() - new Date(a.tanggalLapor).getTime()).slice(0, 3);
                    return (
                      <div className="space-y-3">
                        {latestMaint.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-300 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-slate-900 line-clamp-1 mr-2">{m.keluhan || m.deskripsiKerusakan}</span>
                              <Badge variant={m.status === "Selesai" ? "success" : "warning"}>{m.status}</Badge>
                            </div>
                            <p className="text-slate-700 text-xs mt-1">Lapor: {new Date(m.tanggalLapor).toLocaleDateString('id-ID')}</p>
                            {m.biayaEstimasi > 0 && <p className="text-slate-700 text-xs font-semibold mt-1">Biaya: Rp {m.biayaEstimasi.toLocaleString('id-ID')}</p>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-700">Mencari data aset...</div>
        )}
      </DetailModal>

      <PrintBarcodesModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        assets={filteredAssets}
      />
      <PrintBarcodesModal 
        isOpen={isPrintAllModalOpen}
        onClose={() => setIsPrintAllModalOpen(false)}
        assets={assets}
      />
      <PrintSchoolLabelsModal
        isOpen={isPrintSchoolModalOpen}
        onClose={() => setIsPrintSchoolModalOpen(false)}
        assets={filteredAssets}
      />
      <PrintSchoolLabelsModal
        isOpen={isPrintAllSchoolModalOpen}
        onClose={() => setIsPrintAllSchoolModalOpen(false)}
        assets={assets}
      />
      <ConfirmDeleteModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
        title={deleteModalState.title}
        message={deleteModalState.message}
      />
      <ImportDataModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(newAssets) => {
          setAssets([...assets, ...newAssets]);
        }}
      />
    </div>
  );
}
