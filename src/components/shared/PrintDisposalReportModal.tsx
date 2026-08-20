import React, { useRef, useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Printer } from 'lucide-react';
import { Button } from '../ui/Button';

interface PrintDisposalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  disposal: any;
  asset: any;
}

export function PrintDisposalReportModal({ isOpen, onClose, disposal, asset }: PrintDisposalReportModalProps) {
  const { schoolProfile } = useData();
  const printRef = useRef<HTMLDivElement>(null);
  const [formValues, setFormValues] = useState({
    nomorSurat: '',
    pihak1Nama: '',
    pihak1Nip: '',
    kepsekNama: '',
    kepsekNip: ''
  });

  useEffect(() => {
    if (disposal) {
      setFormValues({
        nomorSurat: `${String(disposal.id).replace(/\D/g, '').padStart(3, '0') || '001'} / BAP-HPS / SMP / ${new Date(disposal.tanggalPengajuan).getFullYear()}`,
        pihak1Nama: schoolProfile?.operator || '..........................',
        pihak1Nip: schoolProfile?.nipOperator || '..........................',
        kepsekNama: schoolProfile?.kepalaSekolah || '..........................',
        kepsekNip: schoolProfile?.nipKepsek || '..........................'
      });
    }
  }, [disposal, schoolProfile]);

  if (!isOpen || !disposal || !asset) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const currentLogo = schoolProfile?.logoDinas;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Surat Penghapusan Aset - ${disposal.id}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 0;
                padding: 0;
                background: white;
              }
              @media print {
                @page { size: A4 portrait; margin: 20mm; }
                body { -webkit-print-color-adjust: exact; }
              }
              table th, table td { border-color: #000 !important; }
            </style>
          </head>
          <body>
            <div style="width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px;">
              ${content}
            </div>
            <script>
              setTimeout(() => {
                window.print();
              }, 1200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            Cetak Berita Acara Pemeriksaan / Penghapusan
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-200 flex flex-col items-center">
          <div className="w-full max-w-[210mm] p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-300">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Surat</label>
                <input 
                  type="text" 
                  name="nomorSurat"
                  value={formValues.nomorSurat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div className="border p-3 rounded-lg bg-slate-50 flex flex-col gap-2">
                <h4 className="font-semibold text-sm text-slate-800">Panitia / Pengurus Barang</h4>
                <input type="text" name="pihak1Nama" value={formValues.pihak1Nama} onChange={handleChange} placeholder="Nama" className="w-full px-2 py-1 text-sm border rounded" />
                <input type="text" name="pihak1Nip" value={formValues.pihak1Nip} onChange={handleChange} placeholder="NIP" className="w-full px-2 py-1 text-sm border rounded" />
              </div>
              <div className="border p-3 rounded-lg bg-slate-50 flex flex-col gap-2">
                <h4 className="font-semibold text-sm text-slate-800">Mengetahui (Kepala Sekolah)</h4>
                <input type="text" name="kepsekNama" value={formValues.kepsekNama} onChange={handleChange} placeholder="Nama" className="w-full px-2 py-1 text-sm border rounded" />
                <input type="text" name="kepsekNip" value={formValues.kepsekNip} onChange={handleChange} placeholder="NIP" className="w-full px-2 py-1 text-sm border rounded" />
              </div>
              <div className="col-span-2 flex items-end justify-end pt-2">
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Cetak Surat Penghapusan
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md my-4" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
            <div ref={printRef} style={{ width: '100%', margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', fontSize: '12px' }}>
              <div className="text-center border-b-[3px] border-double border-black pb-3 mb-5" style={{ position: 'relative', minHeight: '80px' }}>
                {currentLogo && (
                  <img src={currentLogo} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain', position: 'absolute', left: 0, top: 0 }} />
                )}
                <div>
                  <h3 className="m-0 text-[14pt] font-bold uppercase">{schoolProfile.kementerian || 'KEMENTERIAN PENDIDIKAN'}</h3>
                  <h2 className="mt-[2px] mb-1.5 text-[16pt] font-bold uppercase">{schoolProfile.nama}</h2>
                  <p className="m-0 text-[11pt]">{schoolProfile.alamat} {schoolProfile.kodePos}</p>
                  <p className="m-0 text-[11pt] mb-1">Telp: {schoolProfile.telepon} | Email: {schoolProfile.email} | Website: {schoolProfile.website}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="m-0 text-[12pt] font-bold uppercase underline">BERITA ACARA PEMERIKSAAN UNTUK PENGHAPUSAN BARANG / ASET</h2>
                <p className="m-0 text-[11pt] mt-1">Nomor: {formValues.nomorSurat}</p>
              </div>
              
              <p className="mb-4 text-justify leading-relaxed">
                Pada hari ini, tanggal <strong>{currentDate}</strong>, Panitia Pemeriksa Barang / Tim Teknis <strong>{schoolProfile.nama}</strong> telah melakukan pemeriksaan kondisi barang inventaris/aset yang diusulkan untuk dihapuskan. Setelah dilakukan pengecekan fisik, kami melaporkan rincian barang sebagai berikut:
              </p>

              <div className="mb-6">
                <table className="w-full text-xs border-collapse border border-black text-left" cellPadding={6}>
                  <tbody>
                    <tr><th className="border border-black w-1/3 bg-gray-100">Kode Barang</th><td className="border border-black">{asset?.kodeBarang || '-'}</td></tr>
                    <tr><th className="border border-black bg-gray-100">Nama Barang</th><td className="border border-black">{asset?.nama || '-'}</td></tr>
                    <tr><th className="border border-black bg-gray-100">No. Register</th><td className="border border-black">{asset?.nomorRegister || '-'}</td></tr>
                    <tr><th className="border border-black bg-gray-100">Merk / Tipe</th><td className="border border-black">{asset?.merk || '-'}</td></tr>
                    <tr><th className="border border-black bg-gray-100">Tahun Perolehan</th><td className="border border-black">{asset?.tahunPerolehan || '-'}</td></tr>
                    <tr><th className="border border-black bg-gray-100">Harga Perolehan</th><td className="border border-black">Rp {asset?.harga?.toLocaleString('id-ID') || '0'}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <h3 className="font-bold underline mb-2 uppercase text-sm">HASIL PEMERIKSAAN & ALASAN PENGHAPUSAN</h3>
                <p className="text-justify leading-relaxed">
                  Berdasarkan hasil pemeriksaan fisik, barang/aset tersebut direkomendasikan untuk <strong>dihapuskan</strong> dari Daftar Inventaris/Kartu Inventaris Barang (KIB) melalui rencana metode <strong>{disposal.metode}</strong> dengan alasan dan pertimbangan teknis sebagai berikut:
                </p>
                <div className="border border-black p-4 mt-2 min-h-[100px]">
                  {disposal.alasan}
                </div>
              </div>

              <p className="mb-8 text-justify leading-relaxed">
                Demikian Berita Acara Pemeriksaan ini dibuat dengan sebenar-benarnya untuk digunakan sebagai dasar usulan penghapusan barang/aset milik <strong>{schoolProfile.nama}</strong> sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.
              </p>

              <div className="flex justify-between mt-12 text-xs">
                <div className="text-center w-[45%]">
                  <p className="mb-16">Panitia Pemeriksa / Pengurus Barang</p>
                  <p className="font-bold underline mb-0">
                    {formValues.pihak1Nama}
                  </p>
                  <p className="mt-1">{formValues.pihak1Nip ? (formValues.pihak1Nip.startsWith('NIP') ? formValues.pihak1Nip : `NIP. ${formValues.pihak1Nip}`) : ''}</p>
                </div>
                <div className="text-center w-[45%]">
                  <p className="mb-16">Mengetahui & Menyetujui,<br/>Kepala Sekolah</p>
                  <p className="font-bold underline mb-0">{formValues.kepsekNama}</p>
                  <p className="mt-1">{formValues.kepsekNip ? (formValues.kepsekNip.startsWith('NIP') ? formValues.kepsekNip : `NIP. ${formValues.kepsekNip}`) : ''}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-300 bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Cetak Surat Penghapusan
          </Button>
        </div>
      </div>
    </div>
  );
}
