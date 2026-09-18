import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useData } from "../contexts/DataContext";
import { FileText, FileSpreadsheet, PieChart, TrendingUp, AlertCircle, FileStack, Printer, X, Download, Box, ChevronDown } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

interface ReportPrintViewProps {
  reportId: string;
  data: any;
  onBack: () => void;
}

function ReportPrintView({ reportId, data, onBack }: ReportPrintViewProps) {
  const { assets, rooms, maintenances, consumables, borrowings, disposals } = data;
  const { schoolProfile } = useData();
  const toast = useToast();
  
  const [periodType, setPeriodType] = useState<'semua' | 'hari' | 'bulan' | 'tahun'>('semua');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState<string>(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterKib, setFilterKib] = useState<string>('semua');

  // Input fields for printing
  const [printKepsek, setPrintKepsek] = useState(schoolProfile.kepalaSekolah);
  const [printNipKepsek, setPrintNipKepsek] = useState(schoolProfile.nipKepsek);
  const [printOperator, setPrintOperator] = useState(schoolProfile.operator);
  const [printNipOperator, setPrintNipOperator] = useState(schoolProfile.nipOperator);
  const [printNomorSurat, setPrintNomorSurat] = useState(`001 / LAP-SARPRAS / SMP / ${new Date().getFullYear()}`);


  // Filter logic
  let displayedAssets = [...assets];
  let displayedMaintenances = [...maintenances];
  let displayedBorrowings = [...borrowings];
  let displayedDisposals = [...disposals];
  let periodText = "Semua Waktu";

  if (periodType === 'hari' && filterDate) {
    const d = new Date(filterDate);
    const yr = d.getFullYear();
    displayedAssets = displayedAssets.filter(a => a.tahunPerolehan === yr);
    displayedMaintenances = displayedMaintenances.filter(m => m.tanggalLapor.startsWith(filterDate));
    displayedBorrowings = displayedBorrowings.filter(b => b.tanggalPinjam.startsWith(filterDate));
    displayedDisposals = displayedDisposals.filter(disp => disp.tanggalPengajuan.startsWith(filterDate));
    periodText = `Tanggal: ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (periodType === 'bulan' && filterMonth) {
    const yr = parseInt(filterMonth.split('-')[0]);
    displayedAssets = displayedAssets.filter(a => a.tahunPerolehan === yr);
    displayedMaintenances = displayedMaintenances.filter(m => m.tanggalLapor.startsWith(filterMonth));
    displayedBorrowings = displayedBorrowings.filter(b => b.tanggalPinjam.startsWith(filterMonth));
    displayedDisposals = displayedDisposals.filter(disp => disp.tanggalPengajuan.startsWith(filterMonth));
    const d = new Date(`${filterMonth}-01`);
    periodText = `Bulan: ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
  } else if (periodType === 'tahun' && filterYear) {
    const yr = parseInt(filterYear);
    displayedAssets = displayedAssets.filter(a => a.tahunPerolehan === yr);
    displayedMaintenances = displayedMaintenances.filter(m => m.tanggalLapor.startsWith(filterYear));
    displayedBorrowings = displayedBorrowings.filter(b => b.tanggalPinjam.startsWith(filterYear));
    displayedDisposals = displayedDisposals.filter(disp => disp.tanggalPengajuan.startsWith(filterYear));
    periodText = `Tahun: ${filterYear}`;
  }

  if (reportId === 'r1' && filterKib !== 'semua') {
    displayedAssets = displayedAssets.filter(a => a.kategori && a.kategori.includes(`(KIB ${filterKib})`));
  }

  let title = "Laporan Sarpas";
  let content = null;

  if (reportId === "r1") {
    title = "Laporan Semua Aset (Buku Inventaris)";
    content = (
      <table className="w-full text-sm text-left border-collapse border border-slate-900 mt-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-900 px-3 py-2 text-center">No</th>
            <th className="border border-slate-900 px-3 py-2">Kode Aset</th>
            <th className="border border-slate-900 px-3 py-2">Nama Barang</th>
            <th className="border border-slate-900 px-3 py-2">Kategori</th>
            <th className="border border-slate-900 px-3 py-2">Tahun</th>
            <th className="border border-slate-900 px-3 py-2 text-right">Harga Perolehan</th>
            <th className="border border-slate-900 px-3 py-2">Kondisi</th>
          </tr>
        </thead>
        <tbody>
          {displayedAssets.length > 0 ? displayedAssets.map((asset: any, index: number) => (
            <tr key={asset.id}>
              <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
              <td className="border border-slate-900 px-3 py-2 text-center">{asset.kodeAset || asset.kodeBarang}</td>
              <td className="border border-slate-900 px-3 py-2">{asset.nama}</td>
              <td className="border border-slate-900 px-3 py-2">{asset.kategori}</td>
              <td className="border border-slate-900 px-3 py-2 text-center">{asset.tahunPerolehan}</td>
              <td className="border border-slate-900 px-3 py-2 text-right">
                Rp {asset.harga.toLocaleString("id-ID")}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-center">{asset.kondisi}</td>
            </tr>
          )) : (
            <tr><td colSpan={7} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada data untuk periode ini.</td></tr>
          )}
        </tbody>
        {displayedAssets.length > 0 && (
          <tfoot>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={5} className="border border-slate-900 px-3 py-2 text-right">Total Nilai Semua Aset:</td>
              <td className="border border-slate-900 px-3 py-2 text-right">Rp {displayedAssets.reduce((sum: number, a: any) => sum + (a.harga || 0), 0).toLocaleString("id-ID")}</td>
              <td className="border border-slate-900 px-3 py-2 text-center"></td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  } else if (reportId === "r2") {
    title = "Laporan Kondisi Barang (Rusak)";
    const damagedAssets = displayedAssets.filter((a: any) => a.kondisi !== "Baik" && a.kondisi !== undefined);
    content = (
      <table className="w-full text-sm text-left border-collapse border border-slate-900 mt-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-900 px-3 py-2 text-center">No</th>
            <th className="border border-slate-900 px-3 py-2">Nama Barang</th>
            <th className="border border-slate-900 px-3 py-2">Kategori</th>
            <th className="border border-slate-900 px-3 py-2">Lokasi Terakhir</th>
            <th className="border border-slate-900 px-3 py-2">Kondisi</th>
            <th className="border border-slate-900 px-3 py-2">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {damagedAssets.length > 0 ? damagedAssets.map((asset: any, index: number) => {
            const ruang = rooms.find((r: any) => r.id === asset.ruanganId);
            return (
              <tr key={asset.id}>
                <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-slate-900 px-3 py-2">{asset.nama}</td>
                <td className="border border-slate-900 px-3 py-2">{asset.kategori}</td>
                <td className="border border-slate-900 px-3 py-2">{ruang?.nama || "Tidak ada lokasi"}</td>
                <td className="border border-slate-900 px-3 py-2 text-center font-bold text-red-600">{asset.kondisi}</td>
                <td className="border border-slate-900 px-3 py-2">-</td>
              </tr>
            );
          }) : (
            <tr><td colSpan={6} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada aset rusak.</td></tr>
          )}
        </tbody>
      </table>
    );
  } else if (reportId === "r3") {
    title = "Laporan Rekapitulasi per Ruangan (KIR)";
    content = (
      <div className="space-y-8 mt-6">
        {rooms.map((room: any) => {
          const roomAssets = displayedAssets.filter((a: any) => a.ruanganId === room.id);
          return (
            <div key={room.id} className="mb-8">
              <h3 className="text-lg font-bold mb-2">Ruangan: {room.nama} ({room.kodeRuangan})</h3>
              <p className="text-sm mb-4">Jenis: {room.jenis} | Kapasitas: {room.kapasitas} Orang | Penanggung Jawab: {room.penanggungJawab}</p>
              <table className="w-full text-sm text-left border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-900 px-3 py-1 text-center w-12">No</th>
                    <th className="border border-slate-900 px-3 py-1">Kode Aset</th>
                    <th className="border border-slate-900 px-3 py-1">Nama Barang</th>
                    <th className="border border-slate-900 px-3 py-1">Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {roomAssets.length > 0 ? roomAssets.map((asset: any, index: number) => (
                    <tr key={asset.id}>
                      <td className="border border-slate-900 px-3 py-1 text-center">{index + 1}</td>
                      <td className="border border-slate-900 px-3 py-1 text-center">{asset.kodeAset || asset.kodeBarang}</td>
                      <td className="border border-slate-900 px-3 py-1">{asset.nama}</td>
                      <td className="border border-slate-900 px-3 py-1 text-center">{asset.kondisi}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="border border-slate-900 px-3 py-4 text-center">Kosong</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  } else if (reportId === "r4") {
    title = "Laporan Pemeliharaan & Pengeluaran";
    const totalPengeluaran = displayedMaintenances.reduce((sum: number, m: any) => sum + (m.biayaEstimasi || 0), 0);
    content = (
      <div className="mt-6">
        <table className="w-full text-sm text-left border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 px-3 py-2 text-center">No</th>
              <th className="border border-slate-900 px-3 py-2">Tanggal Lapor</th>
              <th className="border border-slate-900 px-3 py-2">Aset</th>
              <th className="border border-slate-900 px-3 py-2">Keluhan</th>
              <th className="border border-slate-900 px-3 py-2">Status</th>
              <th className="border border-slate-900 px-3 py-2 text-right">Biaya (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {displayedMaintenances.length > 0 ? displayedMaintenances.map((m: any, index: number) => {
              const asset = assets.find((a: any) => a.id === m.assetId); // lookup from all assets
              return (
                <tr key={m.id}>
                  <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-slate-900 px-3 py-2">{new Date(m.tanggalLapor).toLocaleDateString('id-ID')}</td>
                  <td className="border border-slate-900 px-3 py-2">{asset?.nama || "Tidak Ditemukan"}</td>
                  <td className="border border-slate-900 px-3 py-2">{m.keluhan || m.deskripsiKerusakan}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center">{m.status}</td>
                  <td className="border border-slate-900 px-3 py-2 text-right">
                    {(m.biayaEstimasi || 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada data untuk periode ini.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={5} className="border border-slate-900 px-3 py-2 text-right">Total Pengeluaran:</td>
              <td className="border border-slate-900 px-3 py-2 text-right">Rp {totalPengeluaran.toLocaleString("id-ID")}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  } else if (reportId === "r5") {
    title = "Laporan Barang Habis Pakai";
    content = (
      <div className="mt-6">
        <table className="w-full text-sm text-left border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 px-3 py-2 text-center">No</th>
              <th className="border border-slate-900 px-3 py-2">Nama Barang</th>
              <th className="border border-slate-900 px-3 py-2">Kategori</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Satuan</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Stok Sisa</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Batas Minimum</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
             {consumables.length > 0 ? consumables.map((c: any, index: number) => {
              const isLow = c.stokSisa <= c.batasMinimum;
              return (
                <tr key={c.id}>
                  <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-slate-900 px-3 py-2">{c.nama}</td>
                  <td className="border border-slate-900 px-3 py-2">{c.kategori}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center">{c.satuan}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-bold">{c.stokSisa}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center">{c.batasMinimum}</td>
                  <td className={`border border-slate-900 px-3 py-2 text-center font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isLow ? 'Kritis' : 'Aman'}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } else if (reportId === "r6") {
    title = "Laporan Peminjaman Barang";
    content = (
      <div className="mt-6">
        <table className="w-full text-sm text-left border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 px-3 py-2 text-center">No</th>
              <th className="border border-slate-900 px-3 py-2">Tanggal Pinjam</th>
              <th className="border border-slate-900 px-3 py-2">Peminjam</th>
              <th className="border border-slate-900 px-3 py-2">Barang / Aset</th>
              <th className="border border-slate-900 px-3 py-2">Tanggal Kembali</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
             {displayedBorrowings.length > 0 ? displayedBorrowings.map((b: any, index: number) => {
              const asset = assets.find((a: any) => a.id === b.assetId);
              return (
                <tr key={b.id}>
                  <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-slate-900 px-3 py-2">{new Date(b.tanggalPinjam).toLocaleDateString('id-ID')}</td>
                  <td className="border border-slate-900 px-3 py-2">{b.peminjam}</td>
                  <td className="border border-slate-900 px-3 py-2">{asset?.nama || "-"}</td>
                  <td className="border border-slate-900 px-3 py-2">{b.tanggalKembali ? new Date(b.tanggalKembali).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-bold">
                    {b.status}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada data peminjaman untuk periode ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } else if (reportId === "r7") {
    title = "Laporan Penyusutan Estimasi";
    const currentYear = new Date().getFullYear();
    let totalHargaOriginal = 0;
    let totalPenyusutanAkumulasi = 0;
    let totalNilaiBuku = 0;

    content = (
      <div className="mt-6">
        <table className="w-full text-sm text-left border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 px-3 py-2 text-center">No</th>
              <th className="border border-slate-900 px-3 py-2">Kode Aset</th>
              <th className="border border-slate-900 px-3 py-2">Nama Barang</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Tahun</th>
              <th className="border border-slate-900 px-3 py-2 text-right">Harga Perolehan</th>
              <th className="border border-slate-900 px-3 py-2 text-right">Akumulasi Penyusutan</th>
              <th className="border border-slate-900 px-3 py-2 text-right">Nilai Buku</th>
            </tr>
          </thead>
          <tbody>
             {displayedAssets.length > 0 ? displayedAssets.map((a: any, index: number) => {
              const usiaTahun = Math.max(0, currentYear - a.tahunPerolehan);
              // Estimasi 10% per tahun
              const akumulasi = Math.min(a.harga, a.harga * 0.1 * usiaTahun);
              const nilaiBuku = a.harga - akumulasi;
              
              totalHargaOriginal += a.harga;
              totalPenyusutanAkumulasi += akumulasi;
              totalNilaiBuku += nilaiBuku;

              return (
                <tr key={a.id}>
                  <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-slate-900 px-3 py-2">{a.kodeAset || a.kodeBarang}</td>
                  <td className="border border-slate-900 px-3 py-2">{a.nama}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center">{a.tahunPerolehan}</td>
                  <td className="border border-slate-900 px-3 py-2 text-right">Rp {a.harga.toLocaleString('id-ID')}</td>
                  <td className="border border-slate-900 px-3 py-2 text-right text-rose-600">Rp {akumulasi.toLocaleString('id-ID')}</td>
                  <td className="border border-slate-900 px-3 py-2 text-right font-bold text-emerald-600">Rp {nilaiBuku.toLocaleString('id-ID')}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada data aset.</td></tr>
            )}
          </tbody>
          {displayedAssets.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={4} className="border border-slate-900 px-3 py-2 text-right">Total:</td>
                <td className="border border-slate-900 px-3 py-2 text-right">Rp {totalHargaOriginal.toLocaleString('id-ID')}</td>
                <td className="border border-slate-900 px-3 py-2 text-right text-rose-600">Rp {totalPenyusutanAkumulasi.toLocaleString('id-ID')}</td>
                <td className="border border-slate-900 px-3 py-2 text-right text-emerald-600">Rp {totalNilaiBuku.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  } else if (reportId === "r8") {
    title = "Laporan Penghapusan Aset (Disposal)";
    content = (
      <div className="mt-6">
        <table className="w-full text-sm text-left border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 px-3 py-2 text-center">No</th>
              <th className="border border-slate-900 px-3 py-2">Tanggal Pengajuan</th>
              <th className="border border-slate-900 px-3 py-2">Aset</th>
              <th className="border border-slate-900 px-3 py-2">Metode</th>
              <th className="border border-slate-900 px-3 py-2">Alasan</th>
              <th className="border border-slate-900 px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
             {displayedDisposals.length > 0 ? displayedDisposals.map((d: any, index: number) => {
              const asset = assets.find((a: any) => a.id === d.assetId);
              return (
                <tr key={d.id}>
                  <td className="border border-slate-900 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-slate-900 px-3 py-2">{new Date(d.tanggalPengajuan).toLocaleDateString('id-ID')}</td>
                  <td className="border border-slate-900 px-3 py-2">{asset?.nama || "-"}</td>
                  <td className="border border-slate-900 px-3 py-2">{d.metode}</td>
                  <td className="border border-slate-900 px-3 py-2">{d.alasan}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-bold">
                    {d.status}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="border border-slate-900 px-3 py-6 text-center text-slate-700">Tidak ada pengajuan penghapusan untuk periode ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  const downloadCSV = () => {
    let csvContent = "";
    if (reportId === "r1") {
      csvContent += "No,Kode Aset,Nama Barang,Kategori,Tahun,Harga Perolehan,Kondisi\n";
      let totalHarga = 0;
      displayedAssets.forEach((asset: any, index: number) => {
        totalHarga += (asset.harga || 0);
        csvContent += `${index + 1},${asset.kodeAset || asset.kodeBarang},"${asset.nama}","${asset.kategori}",${asset.tahunPerolehan},${asset.harga},"${asset.kondisi}"\n`;
      });
      csvContent += `,,,,Total Nilai Semua Aset:,${totalHarga},\n`;
    } else if (reportId === "r2") {
      csvContent += "No,Nama Barang,Kategori,Lokasi Terakhir,Kondisi,Keterangan\n";
      const damagedAssets = displayedAssets.filter((a: any) => a.kondisi !== "Baik");
      damagedAssets.forEach((asset: any, index: number) => {
        const ruang = rooms.find((r: any) => r.id === asset.ruanganId);
        csvContent += `${index + 1},"${asset.nama}","${asset.kategori}","${ruang?.nama || "Tidak ada lokasi"}","${asset.kondisi}","-"\n`;
      });
    } else if (reportId === "r3") {
      csvContent += "Ruangan,No,Kode Aset,Nama Barang,Kondisi\n";
      rooms.forEach((room: any) => {
        const roomAssets = displayedAssets.filter((a: any) => a.ruanganId === room.id);
        if (roomAssets.length === 0) {
          csvContent += `"${room.nama} (${room.kodeRuangan})",-,-,-,-\n`;
        } else {
          roomAssets.forEach((asset: any, index: number) => {
            csvContent += `"${room.nama} (${room.kodeRuangan})",${index + 1},${asset.kodeAset},"${asset.nama}","${asset.kondisi}"\n`;
          });
        }
      });
    } else if (reportId === "r4") {
      csvContent += "No,Tanggal Lapor,Aset,Keluhan,Status,Biaya (Rp)\n";
      let totalPengeluaran = 0;
      displayedMaintenances.forEach((m: any, index: number) => {
        const asset = assets.find((a: any) => a.id === m.assetId);
        totalPengeluaran += (m.biayaEstimasi || 0);
        csvContent += `${index + 1},${new Date(m.tanggalLapor).toLocaleDateString('id-ID')},"${asset?.nama || "Tidak Ditemukan"}","${m.keluhan}","${m.status}",${(m.biayaEstimasi || 0)}\n`;
      });
      csvContent += `,,,,,Total Pengeluaran: ,${totalPengeluaran}\n`;
    } else if (reportId === "r5") {
      csvContent += "No,Nama Barang,Kategori,Satuan,Stok Sisa,Batas Minimum,Status\n";
      consumables.forEach((c: any, index: number) => {
        const isLow = c.stokSisa <= c.batasMinimum;
        csvContent += `${index + 1},"${c.nama}","${c.kategori}","${c.satuan}",${c.stokSisa},${c.batasMinimum},"${isLow ? "Kritis" : "Aman"}"\n`;
      });
    } else if (reportId === "r6") {
      csvContent += "No,Tanggal Pinjam,Peminjam,Barang / Aset,Tanggal Kembali,Status\n";
      displayedBorrowings.forEach((b: any, index: number) => {
        const asset = assets.find((a: any) => a.id === b.assetId);
        const tglKembali = b.tanggalKembali ? new Date(b.tanggalKembali).toLocaleDateString('id-ID') : '-';
        csvContent += `${index + 1},${new Date(b.tanggalPinjam).toLocaleDateString('id-ID')},"${b.peminjam}","${asset?.nama || '-'}","${tglKembali}","${b.status}"\n`;
      });
    } else if (reportId === "r7") {
      csvContent += "No,Kode Aset,Nama Barang,Tahun,Harga Perolehan,Akumulasi Penyusutan,Nilai Buku\n";
      const currentYear = new Date().getFullYear();
      let totalHarga = 0; let totalAkm = 0; let totalNilai = 0;
      displayedAssets.forEach((a: any, index: number) => {
        const usiaTahun = Math.max(0, currentYear - a.tahunPerolehan);
        const akumulasi = Math.min(a.harga, a.harga * 0.1 * usiaTahun);
        const nilaiBuku = a.harga - akumulasi;
        totalHarga += a.harga; totalAkm += akumulasi; totalNilai += nilaiBuku;
        csvContent += `${index + 1},${a.kodeAset || a.kodeBarang},"${a.nama}",${a.tahunPerolehan},${a.harga},${akumulasi},${nilaiBuku}\n`;
      });
      csvContent += `,,,,Total:,${totalHarga},${totalAkm},${totalNilai}\n`;
    } else if (reportId === "r8") {
      csvContent += "No,Tanggal Pengajuan,Aset,Metode,Alasan,Status\n";
      displayedDisposals.forEach((d: any, index: number) => {
        const asset = assets.find((a: any) => a.id === d.assetId);
        csvContent += `${index + 1},${new Date(d.tanggalPengajuan).toLocaleDateString('id-ID')},"${asset?.nama || '-'}","${d.metode}","${d.alasan}","${d.status}"\n`;
      });
    }

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \ufeff added for excel BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReportPDF = (action: 'download' | 'print') => {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF('p', 'pt', 'a4');
        
        if (schoolProfile.logoDinas) {
          try {
            const formatMatch = schoolProfile.logoDinas.match(/data:image\/(.*?);/);
            let format = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';
            format = format === 'JPEG' || format === 'JPG' ? 'JPEG' : format === 'PNG' ? 'PNG' : 'PNG';
            doc.addImage(schoolProfile.logoDinas, format, 40, 30, 60, 60);
          } catch(e) {
            console.warn("Failed to add logo to PDF:", e);
          }
        }
        
        // Add header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(schoolProfile.kementerian, doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.setFontSize(18);
        doc.text(schoolProfile.nama, doc.internal.pageSize.width / 2, 60, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${schoolProfile.alamat} - ${schoolProfile.kodePos}`, doc.internal.pageSize.width / 2, 75, { align: 'center' });
        doc.text(`Telp. ${schoolProfile.telepon} | Email: ${schoolProfile.email}`, doc.internal.pageSize.width / 2, 90, { align: 'center' });
        
        // Line
        doc.setLineWidth(1.5);
        doc.line(40, 105, doc.internal.pageSize.width - 40, 105);
        doc.setLineWidth(0.5);
        doc.line(40, 108, doc.internal.pageSize.width - 40, 108);
        
        // Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), doc.internal.pageSize.width / 2, 135, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Periode: ${periodText}`, doc.internal.pageSize.width / 2, 150, { align: 'center' });
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, doc.internal.pageSize.width / 2, 165, { align: 'center' });
        
        const reportNumber = `Nomor: ${printNomorSurat}`;
        doc.setFont('helvetica', 'bold');
        doc.text(reportNumber, doc.internal.pageSize.width / 2, 185, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        
        let startY = 210;

        if (reportId === "r1") {
          let totalHarga = 0;
          const body = assets.map((a: any, i: number) => {
            totalHarga += (a.harga || 0);
            return [
              i + 1, a.kodeAset || a.kodeBarang, a.nama, a.kategori, a.tahunPerolehan, `Rp ${a.harga.toLocaleString('id-ID')}`, a.kondisi
            ];
          });
          body.push(['', '', '', '', 'Total Nilai Semua Aset:', `Rp ${totalHarga.toLocaleString('id-ID')}`, '']);
          autoTable(doc, {
            startY,
            head: [['No', 'Kode Aset', 'Nama Barang', 'Kategori', 'Tahun', 'Harga Perolehan', 'Kondisi']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r2") {
          const damagedAssets = assets.filter((a: any) => a.kondisi !== "Baik");
          const body = damagedAssets.map((a: any, i: number) => {
            const ruang = rooms.find((r: any) => r.id === a.ruanganId);
            return [i + 1, a.nama, a.kategori, ruang?.nama || "-", a.kondisi, "-"];
          });
          autoTable(doc, {
            startY,
            head: [['No', 'Nama Barang', 'Kategori', 'Lokasi Terakhir', 'Kondisi', 'Keterangan']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r3") {
          rooms.forEach((room: any, index: number) => {
            if (index > 0) startY = (doc as any).lastAutoTable.finalY + 30;
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Ruangan: ${room.nama} (${room.kodeRuangan})`, 40, startY);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Jenis: ${room.jenis} | Kapasitas: ${room.kapasitas} | PJ: ${room.penanggungJawab}`, 40, startY + 15);
            
            const roomAssets = assets.filter((a: any) => a.ruanganId === room.id);
            const body = roomAssets.length > 0 
              ? roomAssets.map((a: any, i: number) => [i + 1, a.kodeAset, a.nama, a.kondisi])
              : [['-', '-', 'Kosong', '-']];

            autoTable(doc, {
              startY: startY + 25,
              head: [['No', 'Kode Aset', 'Nama Barang', 'Kondisi']],
              body: body,
              theme: 'grid',
              headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
              bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
            });
          });
        } else if (reportId === "r4") {
          let totalPengeluaran = 0;
          const body = maintenances.map((m: any, i: number) => {
            const asset = assets.find((a: any) => a.id === m.assetId);
            totalPengeluaran += (m.biayaEstimasi || 0);
            return [
              i + 1, 
              new Date(m.tanggalLapor).toLocaleDateString('id-ID'), 
              asset?.nama || "-", 
              m.keluhan, 
              m.status, 
              `Rp ${(m.biayaEstimasi || 0).toLocaleString('id-ID')}`
            ];
          });
          body.push(['', '', '', '', 'Total Pengeluaran:', `Rp ${totalPengeluaran.toLocaleString('id-ID')}`]);

          autoTable(doc, {
            startY,
            head: [['No', 'Tanggal Lapor', 'Aset', 'Keluhan', 'Status', 'Biaya']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r5") {
          const body = consumables.map((c: any, i: number) => {
            const isLow = c.stokSisa <= c.batasMinimum;
            return [
              i + 1,
              c.nama,
              c.kategori,
              c.satuan,
              c.stokSisa,
              c.batasMinimum,
              isLow ? 'Kritis' : 'Aman'
            ];
          });

          autoTable(doc, {
            startY,
            head: [['No', 'Nama Barang', 'Kategori', 'Satuan', 'Stok Sisa', 'Batas Minimum', 'Status']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r6") {
          const body = displayedBorrowings.map((b: any, i: number) => {
            const asset = assets.find((a: any) => a.id === b.assetId);
            const tglKembali = b.tanggalKembali ? new Date(b.tanggalKembali).toLocaleDateString('id-ID') : '-';
            return [
              i + 1,
              new Date(b.tanggalPinjam).toLocaleDateString('id-ID'),
              b.peminjam,
              asset?.nama || "-",
              tglKembali,
              b.status
            ];
          });
          autoTable(doc, {
            startY,
            head: [['No', 'Tanggal Pinjam', 'Peminjam', 'Barang / Aset', 'Tanggal Kembali', 'Status']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r7") {
          const currentYear = new Date().getFullYear();
          let totalHarga = 0; let totalAkm = 0; let totalNilai = 0;
          const body = displayedAssets.map((a: any, i: number) => {
            const usiaTahun = Math.max(0, currentYear - a.tahunPerolehan);
            const akumulasi = Math.min(a.harga, a.harga * 0.1 * usiaTahun);
            const nilaiBuku = a.harga - akumulasi;
            totalHarga += a.harga; totalAkm += akumulasi; totalNilai += nilaiBuku;

            return [
              i + 1,
              a.kodeAset || a.kodeBarang,
              a.nama,
              a.tahunPerolehan,
              `Rp ${a.harga.toLocaleString('id-ID')}`,
              `Rp ${akumulasi.toLocaleString('id-ID')}`,
              `Rp ${nilaiBuku.toLocaleString('id-ID')}`
            ];
          });
          body.push(['', '', '', 'Total:', `Rp ${totalHarga.toLocaleString('id-ID')}`, `Rp ${totalAkm.toLocaleString('id-ID')}`, `Rp ${totalNilai.toLocaleString('id-ID')}`]);

          autoTable(doc, {
            startY,
            head: [['No', 'Kode Aset', 'Nama Barang', 'Tahun', 'Harga Perolehan', 'Akumulasi Penyusutan', 'Nilai Buku']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        } else if (reportId === "r8") {
          const body = displayedDisposals.map((d: any, i: number) => {
            const asset = assets.find((a: any) => a.id === d.assetId);
            return [
              i + 1,
              new Date(d.tanggalPengajuan).toLocaleDateString('id-ID'),
              asset?.nama || "-",
              d.metode,
              d.alasan,
              d.status
            ];
          });

          autoTable(doc, {
            startY,
            head: [['No', 'Tanggal Pengajuan', 'Aset', 'Metode', 'Alasan', 'Status']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 1 },
            bodyStyles: { lineColor: [15, 23, 42], lineWidth: 1, textColor: [15, 23, 42] },
          });
        }
        
        // Signatures
        const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 50 : startY + 100;
        
        // Ensure signatures don't break page
        if (finalY > doc.internal.pageSize.height - 100) {
          doc.addPage();
        }
        
        const sigY = finalY > doc.internal.pageSize.height - 100 ? 50 : finalY;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Left
        doc.text("Mengetahui,", 120, sigY, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.text("Kepala Sekolah", 120, sigY + 15, { align: 'center' });
        
        doc.text(printKepsek || "-", 120, sigY + 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`NIP. ${printNipKepsek || "-"}`, 120, sigY + 85, { align: 'center' });

        // Right
        doc.text(`Kota Pelajar, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, doc.internal.pageSize.width - 120, sigY, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.text("Operator Aset / Sarpras", doc.internal.pageSize.width - 120, sigY + 15, { align: 'center' });
        
        doc.text(printOperator || "-", doc.internal.pageSize.width - 120, sigY + 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`NIP. ${printNipOperator || "-"}`, doc.internal.pageSize.width - 120, sigY + 85, { align: 'center' });

        if (action === 'print') {
          // Attempt to open the blob URL in a new window for printing, which usually bypasses popup blockers if triggered by user
          try {
            const bloburl = doc.output('bloburl');
            const newWin = window.open(bloburl, '_blank');
            if (!newWin) {
              // Popup blocked, fallback to download
              doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
              toast?.("Popup diblokir, mengunduh file secara otomatis.", "info");
            }
          } catch (e) {
            doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
          }
        } else {
          doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        }
      });
    });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] overflow-y-auto bg-slate-100 z-50 print:bg-white pb-20 print:pb-0 print:h-auto print:overflow-visible">
      <div className="sticky top-0 right-0 bg-white border-b border-slate-300 p-4 flex flex-col gap-4 print:hidden shadow-sm z-50">
        <div className="flex justify-between items-center whitespace-nowrap">
          <h2 className="text-lg font-bold text-slate-800">Pratinjau Cetak</h2>
          <div className="flex flex-wrap gap-2 items-center">
            
            <div className="flex items-center gap-2 mr-4 bg-slate-50 p-1.5 rounded-lg border border-slate-300">
              {reportId === "r1" && (
                <div className="relative">
                  <select
                    className="appearance-none text-sm bg-white border border-slate-300 rounded px-3 py-1.5 pr-8 outline-none text-blue-700 font-semibold focus:border-primary-500 hover:bg-slate-50 shadow-sm transition-colors"
                    value={filterKib}
                    onChange={(e) => setFilterKib(e.target.value)}
                  >
                    <option value="semua">Semua KIB</option>
                    <option value="A">KIB A (Tanah)</option>
                    <option value="B">KIB B (Peralatan & Mesin)</option>
                    <option value="C">KIB C (Gedung & Bangunan)</option>
                    <option value="D">KIB D (Jalan, Irigasi, Jaringan)</option>
                    <option value="E">KIB E (Aset Tetap Lainnya)</option>
                    <option value="F">KIB F (Konstruksi Dalam Pengerjaan)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600 pointer-events-none" />
                </div>
              )}
              <div className="relative">
                <select 
                  className="appearance-none text-sm bg-white border border-slate-300 rounded px-3 py-1.5 pr-8 outline-none focus:border-primary-500 hover:bg-slate-50 shadow-sm transition-colors"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                >
                  <option value="semua">Semua Waktu</option>
                  <option value="hari">Per Hari</option>
                  <option value="bulan">Per Bulan</option>
                  <option value="tahun">Per Tahun</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600 pointer-events-none" />
              </div>
              
              {periodType === 'hari' && (
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-sm border border-slate-300 rounded px-3 py-1.5 outline-none hover:border-slate-400 shadow-sm transition-colors" />
              )}
              {periodType === 'bulan' && (
                <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="text-sm border border-slate-300 rounded px-3 py-1.5 outline-none hover:border-slate-400 shadow-sm transition-colors" />
              )}
              {periodType === 'tahun' && (
                <input type="number" min="2000" max="2100" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="text-sm border border-slate-300 rounded px-3 py-1.5 outline-none w-24 hover:border-slate-400 shadow-sm transition-colors" />
              )}
            </div>

            <Button variant="outline" onClick={onBack}>
              <X className="mr-2 h-4 w-4" /> Batal
            </Button>
            <Button variant="outline" onClick={downloadCSV} className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Unduh Excel (CSV)
            </Button>
            <Button variant="outline" onClick={() => generateReportPDF('print')} className="border-slate-600 text-slate-700 hover:bg-slate-50">
              <Printer className="mr-2 h-4 w-4" /> Print Form
            </Button>
            <Button onClick={() => generateReportPDF('download')}>
               <Download className="mr-2 h-4 w-4" /> Unduh PDF
            </Button>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-amber-50 p-2 rounded border border-amber-200 mt-2">
           <span className="text-xs font-semibold text-amber-800">Ubah Penandatangan (Hanya Cetak):</span>
           <input type="text" value={printKepsek} onChange={e => setPrintKepsek(e.target.value)} placeholder="Kepala Sekolah" className="border border-slate-300 px-2 py-1 text-xs rounded bg-white w-32 outline-none" />
           <input type="text" value={printNipKepsek} onChange={e => setPrintNipKepsek(e.target.value)} placeholder="NIP Kepala Sekolah" className="border border-slate-300 px-2 py-1 text-xs rounded bg-white w-32 outline-none" />
           <span className="text-slate-300 mx-1">|</span>
           <input type="text" value={printOperator} onChange={e => setPrintOperator(e.target.value)} placeholder="Operator" className="border border-slate-300 px-2 py-1 text-xs rounded bg-white w-32 outline-none" />
           <input type="text" value={printNipOperator} onChange={e => setPrintNipOperator(e.target.value)} placeholder="NIP Operator" className="border border-slate-300 px-2 py-1 text-xs rounded bg-white w-32 outline-none" />
           <span className="text-slate-300 mx-1">|</span>
           <input type="text" value={printNomorSurat} onChange={e => setPrintNomorSurat(e.target.value)} placeholder="Nomor Surat" className="border border-slate-300 px-2 py-1 text-xs rounded bg-white w-48 outline-none" />
        </div>
      </div>
      
      <div className="w-full overflow-x-auto print:overflow-visible"><div id="print-area" className="max-w-4xl mx-auto mt-8 bg-white p-4 sm:p-8 md:p-12 shadow-lg print:shadow-none print:m-0 print:p-4 print:max-w-none text-slate-900">
        {/* Kop Surat */}
        <div className="text-center border-b-[3px] border-double border-slate-900 pb-2 mb-6 flex items-center relative min-h-[80px]">
          {schoolProfile.logoDinas && (
            <img src={schoolProfile.logoDinas} alt="Logo" className="w-[80px] h-[80px] object-contain absolute left-0 top-0 hidden print:block" />
          )}
          {schoolProfile.logoDinas && (
            <img src={schoolProfile.logoDinas} alt="Logo" className="w-[80px] h-[80px] object-contain mr-4 print:hidden" />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold uppercase tracking-wider">{schoolProfile.kementerian}</h2>
            <h1 className="text-2xl font-extrabold uppercase my-1">{schoolProfile.nama}</h1>
            <p className="text-sm">{schoolProfile.alamat} - {schoolProfile.kodePos}</p>
            <p className="text-sm">Telp. {schoolProfile.telepon} | Email: {schoolProfile.email} | Website: {schoolProfile.website}</p>
          </div>
          {schoolProfile.logoDinas && <div className="w-[80px] print:hidden"></div>}
        </div>

        {/* Judul Laporan */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2">{title}</h2>
          <p className="text-sm mt-1 font-semibold text-slate-800">Nomor: {printNomorSurat}</p>
          <p className="text-sm mt-1 font-semibold text-slate-700">Periode: {periodText}</p>
          <p className="text-sm mt-2">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Konten Laporan */ }
        <div className="min-h-[400px]">
          {content}
        </div>

        {/* Tanda Tangan */}
        <div className="flex justify-between mt-16 pt-8 px-8 break-inside-avoid">
          <div className="text-center flex flex-col items-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-24"></div>
            <p className="font-bold underline decoration-1 underline-offset-4">{printKepsek || "-"}</p>
            <p>NIP. {printNipKepsek || "-"}</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <p>Kota Pelajar, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="font-bold">Operator Aset / Sarpras</p>
            <div className="h-24"></div>
            <p className="font-bold underline decoration-1 underline-offset-4">{printOperator || "-"}</p>
            <p>NIP. {printNipOperator || "-"}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const toast = useToast();
  const { assets, rooms, maintenances, consumables, borrowings, disposals } = useData();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const reports = [
    {
      id: "r1",
      title: "Laporan Semua Aset (Buku Inventaris)",
      description: "Berisi seluruh data aset aktif beserta nilai estimasi dan depresiasi (KIB A - F).",
      icon: FileStack,
      color: "text-primary-600",
      bg: "bg-primary-100"
    },
    {
      id: "r2",
      title: "Laporan Kondisi Barang (Rusak)",
      description: "Daftar aset dengan kondisi rusak ringan dan rusak berat yang membutuhkan perbaikan.",
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-100"
    },
    {
      id: "r3",
      title: "Laporan Rekapitulasi per Ruangan (KIR)",
      description: "Sebaran jumlah dan dokumen aset dikelompokkan berdasarkan lokasi ruangan.",
      icon: PieChart,
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      id: "r4",
      title: "Laporan Pemeliharaan & Pengeluaran",
      description: "Data historis perbaikan aset dan total pengeluaran biaya dalam rentang waktu tertentu.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    },
    {
      id: "r5",
      title: "Laporan Barang Habis Pakai",
      description: "Rekap data stok barang habis pakai beserta peringatan batas ketersediaan stok.",
      icon: Box,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      id: "r6",
      title: "Laporan Peminjaman",
      description: "Histori peminjaman aset beserta status pengembaliannya.",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    },
    {
      id: "r7",
      title: "Laporan Penyusutan",
      description: "Laporan yang menunjukkan nilai penyusutan / nilai buku dari setiap aset.",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
    {
      id: "r8",
      title: "Laporan Penghapusan",
      description: "Laporan barang atau aset yang sudah diajukan untuk dihancurkan/dihapus.",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100"
    }
  ];

  if (selectedReportId) {
    return (
      <ReportPrintView 
        reportId={selectedReportId} 
        data={{assets, rooms, maintenances, consumables, borrowings, disposals}} 
        onBack={() => setSelectedReportId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Laporan & Rekapitulasi</h2>
          <p className="text-slate-700">Cetak dan unduh laporan sarana prasarana sekolah sesuai standar dinas.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col border border-slate-300">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className={`p-3 rounded-xl ${report.bg} shrink-0`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  {report.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto border-t border-slate-300 pt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedReportId(report.id)} 
                className="flex-1 bg-white hover:bg-slate-50"
              >
                <FileText className="mr-2 h-4 w-4 text-primary-600" />
                Lihat & Cetak Laporan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
