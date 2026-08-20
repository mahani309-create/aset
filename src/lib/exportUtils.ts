import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ColumnDef {
  header: string;
  key: string;
  render?: (item: any) => string;
}

export function exportToExcel(data: any[], columns: ColumnDef[], filename: string) {
  const exportData = data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      row[col.header] = col.render ? col.render(item) : item[col.key];
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPdf(data: any[], columns: ColumnDef[], title: string, schoolProfile: any) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  if (schoolProfile.logoDinas) {
    try {
      const formatMatch = schoolProfile.logoDinas.match(/data:image\/(.*?);/);
      const format = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';
      const parsedFormat = format === 'JPEG' || format === 'JPG' ? 'JPEG' : format === 'PNG' ? 'PNG' : 'PNG';
      // Attempt to add logo, dimensions 20x20
      doc.addImage(schoolProfile.logoDinas, parsedFormat, 15, 10, 22, 22);
    } catch(e) {
      console.warn("Failed to add logo to PDF:", e);
    }
  }

  // Kop Sekolah Header
  let currentY = 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolProfile.kementerian || 'PEMERINTAH DAERAH', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 6;
  doc.setFontSize(16);
  doc.text(schoolProfile.nama || 'NAMA INSTANSI / SEKOLAH', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const address = `${schoolProfile.alamat || ''} ${schoolProfile.kodePos || ''}`;
  doc.text(address, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  const contact = `Telp: ${schoolProfile.telepon || '-'} | Email: ${schoolProfile.email || '-'} | Website: ${schoolProfile.website || '-'}`;
  doc.text(contact, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  doc.setLineWidth(1.5);
  doc.line(14, currentY + 1, pageWidth - 14, currentY + 1);
  
  currentY += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  
  const head = [columns.map(col => col.header)];
  const body = data.map(item => columns.map(col => String(col.render ? col.render(item) : (item[col.key] || ''))));

  autoTable(doc, {
    head,
    body,
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [63, 81, 181], textColor: 255, halign: 'center' },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Signatures
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 40, finalY);
  doc.text('Kepala Sekolah', 40, finalY + 5);
  doc.text(schoolProfile.kepalaSekolah || '(_____________________)', 40, finalY + 25);
  doc.text(`NIP. ${schoolProfile.nipKepsek || '...................'}`, 40, finalY + 30);

  doc.text('Pengelola Sarpras', pageWidth - 80, finalY + 5);
  doc.text(schoolProfile.operator || '(_____________________)', pageWidth - 80, finalY + 25);
  doc.text(`NIP. ${schoolProfile.nipOperator || '...................'}`, pageWidth - 80, finalY + 30);

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}
