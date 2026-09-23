import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';
import { Asset, AssetCategory } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useData } from '../../contexts/DataContext';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (assets: Asset[]) => void;
}

export function ImportDataModal({ isOpen, onClose, onSuccess }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { rooms } = useData();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
        toast("Harap unggah file Excel (.xlsx/.xls) atau CSV", "error");
        return;
      }
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setParsedData(jsonData);
      } catch (error) {
        console.error("Gagal membaca file Excel", error);
        setErrors(["Gagal membaca file. Pastikan format file benar."]);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrors(["Gagal membaca file saat diunggah."]);
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  };

  const validateAndImport = () => {
    if (parsedData.length === 0) {
      setErrors(["Data kosong. Pastikan file tidak kosong dan sesuai template."]);
      return;
    }

    const newAssets: Asset[] = [];
    const currentErrors: string[] = [];

    parsedData.forEach((row, index) => {
      // Basic validation
      if (!row['Nama Barang'] || !row['Kategori KIB']) {
        currentErrors.push(`Baris ${index + 2}: 'Nama Barang' dan 'Kategori KIB' wajib diisi.`);
        return;
      }

      // Try finding room by name
      let roomId = '';
      if (row['Ruangan']) {
        const foundRoom = rooms.find(r => r.nama.toLowerCase().includes(String(row['Ruangan']).toLowerCase()));
        if (foundRoom) {
          roomId = foundRoom.id;
        }
      }

      const validCategories = [
        "Tanah (KIB A)", 
        "Peralatan & Mesin (KIB B)", 
        "Gedung & Bangunan (KIB C)", 
        "Jalan, Irigasi & Jaringan (KIB D)", 
        "Aset Tetap Lainnya (KIB E)", 
        "Aset Tak Berwujud", 
        "Ekstrakomptabel"
      ];
      const kategori = validCategories.find(c => 
        c === row['Kategori KIB'] || String(row['Kategori KIB']).includes(c)
      ) ? row['Kategori KIB'] : "Peralatan & Mesin (KIB B)";

      const asset: Asset = {
        id: "AST-" + Date.now().toString() + "-" + Math.floor(Math.random() * 1000),
        kodeBarang: String(row['Kode Barang'] || `KB-${Date.now().toString().slice(-6)}`),
        nomorRegister: String(row['Nomor Register'] || `000${Math.floor(Math.random() * 100)}`),
        nama: String(row['Nama Barang']),
        kategori: kategori as AssetCategory,
        merk: row['Merk/Tipe'] ? String(row['Merk/Tipe']) : undefined,
        nomorSertifikat: row['Nomor Sertifikat/Pabrik/Chasis/Mesin'] ? String(row['Nomor Sertifikat/Pabrik/Chasis/Mesin']) : undefined,
        bahan: row['Bahan'] ? String(row['Bahan']) : undefined,
        asalUsul: row['Asal Usul'] ? String(row['Asal Usul']) : 'Pembelian',
        tahunPerolehan: parseInt(row['Tahun Perolehan']) || new Date().getFullYear(),
        ukuranBahan: row['Ukuran/CC'] ? String(row['Ukuran/CC']) : undefined,
        kondisi: row['Kondisi (Baik/Rusak Ringan/Rusak Berat)'] as "Baik" | "Rusak Ringan" | "Rusak Berat" || "Baik",
        harga: parseFloat(row['Harga/Nilai']) || 0,
        keterangan: row['Keterangan'] ? String(row['Keterangan']) : undefined,
        sumberDana: (row['Sumber Dana'] as any) || 'BOS Reguler',
        ruanganId: roomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      newAssets.push(asset);
    });

    if (currentErrors.length > 0) {
      setErrors(currentErrors);
    } else {
      if (newAssets.length > 0) {
        onSuccess(newAssets);
        toast(`${newAssets.length} data aset berhasil diimpor!`, "success");
        onClose();
      }
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Kode Barang": "1.02.01.01.04",
        "Nomor Register": "0001",
        "Nama Barang": "Laptop Asus VivoBook",
        "Kategori KIB": "Peralatan & Mesin (KIB B)",
        "Merk/Tipe": "Asus",
        "Ukuran/CC": "14 Inch",
        "Bahan": "Logam/Plastik",
        "Tahun Perolehan": 2023,
        "Kondisi (Baik/Rusak Ringan/Rusak Berat)": "Baik",
        "Asal Usul": "Pembelian",
        "Harga/Nilai": 8500000,
        "Keterangan": "Pengadaan BOS 2023",
        "Sumber Dana": "BOS",
        "Ruangan": "Lab Komputer",
        "Nomor Sertifikat/Pabrik/Chasis/Mesin": "SN12345678"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Data_Aset");
    XLSX.writeFile(wb, "Template_Data_Aset_SARPRAS.xlsx");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-800 my-8"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Impor Data Aset Excel
            </h3>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {!file ? (
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-primary-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Pilih file Excel (.xlsx)</h4>
                <p className="text-slate-700 mt-2 max-w-sm mx-auto text-sm">
                  Seret dan lepas file Anda ke sini atau klik untuk menjelajahi komputer Anda.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-emerald-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{file.name}</p>
                      <p className="text-sm text-slate-700">{(file.size / 1024).toFixed(2)} KB • {parsedData.length} Baris data ditemukan</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setParsedData([]); setErrors([]); }}
                    className="text-slate-600 hover:text-rose-500 transition-colors bg-white dark:bg-slate-900 border shadow-sm p-1.5 rounded-md"
                    title="Ganti File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {errors.length > 0 && (
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4">
                    <h4 className="font-semibold text-rose-800 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Ditemukan {errors.length} Kesalahan
                    </h4>
                    <ul className="text-sm text-rose-600 max-h-40 overflow-y-auto space-y-1 list-disc pl-5">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 flex justify-between items-end border-t border-slate-300 dark:border-slate-800 pt-6">
              <div>
                <p className="text-sm text-slate-700 mb-2">Belum punya format yang sesuai?</p>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                  <Download className="w-4 h-4" />
                  Unduh Template Excel
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Batal</Button>
                <Button 
                  onClick={validateAndImport} 
                  disabled={!file || parsedData.length === 0 || isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? 'Memproses...' : 'Impor Data Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
