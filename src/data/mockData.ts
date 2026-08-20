import { Asset, Room, MaintenanceRecord, Consumable, Borrowing, Procurement, Mutation, Stocktake, Disposal } from "../types";
import { subDays, formatISO } from "date-fns";

export const mockRooms: Room[] = [
  { id: "r1", kodeRuangan: "R-VII-A", nama: "Ruang Kelas VII-A", jenis: "Kelas", kapasitas: 32, penanggungJawab: "Bpk. Budi Santoso" },
  { id: "r2", kodeRuangan: "R-VII-B", nama: "Ruang Kelas VII-B", jenis: "Kelas", kapasitas: 32, penanggungJawab: "Ibu Siti Aminah" },
  { id: "r3", kodeRuangan: "R-LAB-KOM", nama: "Laboratorium Komputer", jenis: "Laboratorium", kapasitas: 40, penanggungJawab: "Bpk. Adi Gunawan" },
  { id: "r4", kodeRuangan: "R-PERPUS", nama: "Perpustakaan Pusat", jenis: "Perpustakaan", kapasitas: 50, penanggungJawab: "Ibu Ratna Kumala" },
  { id: "r5", kodeRuangan: "R-GURU", nama: "Ruang Guru", jenis: "Kantor", kapasitas: 60, penanggungJawab: "Bpk. Kepala Sekolah" },
  { id: "r6", kodeRuangan: "R-AULA", nama: "Aula Utama", jenis: "Fasilitas Umum", kapasitas: 200, penanggungJawab: "Staf Sarpras" },
];

export const mockAssets: Asset[] = [
  // Kelas VII-A
  { id: "a1", kodeBarang: "02.06.02.01.21", nomorRegister: "000001", nama: "Meja Siswa", kategori: "Peralatan & Mesin (KIB B)", merk: "Custom Lokal", bahan: "Kayu Jati", tahunPerolehan: 2020, kondisi: "Baik", ruanganId: "r1", harga: 250000, sumberDana: "Yayasan" },
  { id: "a2", kodeBarang: "02.06.02.01.22", nomorRegister: "000002", nama: "Kursi Siswa", kategori: "Peralatan & Mesin (KIB B)", merk: "Custom Lokal", bahan: "Kayu Jati", tahunPerolehan: 2020, kondisi: "Baik", ruanganId: "r1", harga: 150000, sumberDana: "Yayasan" },
  { id: "a3", kodeBarang: "02.06.02.06.03", nomorRegister: "000003", nama: "Proyektor LCD", kategori: "Peralatan & Mesin (KIB B)", merk: "Epson EB-X05", bahan: "Plastik/Logam", tahunPerolehan: 2022, kondisi: "Baik", ruanganId: "r1", harga: 4500000, sumberDana: "BOS Reguler" },
  
  // Lab Komputer
  { id: "a4", kodeBarang: "02.06.03.02.01", nomorRegister: "000004", nama: "PC Desktop All-in-One", kategori: "Peralatan & Mesin (KIB B)", merk: "Lenovo IdeaCentre", bahan: "Campuran", tahunPerolehan: 2023, kondisi: "Baik", ruanganId: "r3", harga: 8500000, sumberDana: "Pemerintah Pusat" },
  { id: "a5", kodeBarang: "02.06.03.02.01", nomorRegister: "000005", nama: "PC Desktop All-in-One", kategori: "Peralatan & Mesin (KIB B)", merk: "Lenovo IdeaCentre", bahan: "Campuran", tahunPerolehan: 2023, kondisi: "Baik", ruanganId: "r3", harga: 8500000, sumberDana: "Pemerintah Pusat" },
  { id: "a6", kodeBarang: "02.06.02.04.04", nomorRegister: "000006", nama: "AC Split 2 PK", kategori: "Peralatan & Mesin (KIB B)", merk: "Daikin", bahan: "Campuran", tahunPerolehan: 2021, kondisi: "Rusak Ringan", ruanganId: "r3", harga: 6000000, sumberDana: "Hibah / Sumbangan", catatan: "Kurang dingin, perlu service cuci" },
  { id: "a7", kodeBarang: "02.06.03.04.12", nomorRegister: "000007", nama: "Switch Hub 24 Port", kategori: "Peralatan & Mesin (KIB B)", merk: "Cisco", bahan: "Logam", tahunPerolehan: 2019, kondisi: "Baik", ruanganId: "r3", harga: 2000000, sumberDana: "BOS Reguler" },

  // Perpustakaan
  { id: "a8", kodeBarang: "05.01.01.01.01", nomorRegister: "000008", nama: "Buku Teks Matematika K13", kategori: "Aset Tetap Lainnya (KIB E)", merk: "Kemdikbud", bahan: "Kertas", tahunPerolehan: 2020, kondisi: "Rusak Berat", ruanganId: "r4", harga: 55000, sumberDana: "BOS Reguler", catatan: "Halaman banyak yang sobek" },
  { id: "a9", kodeBarang: "02.06.02.01.33", nomorRegister: "000009", nama: "Rak Buku Besi 5 Susun", kategori: "Peralatan & Mesin (KIB B)", merk: "Brother", bahan: "Besi", tahunPerolehan: 2018, kondisi: "Baik", ruanganId: "r4", harga: 1200000, sumberDana: "Yayasan" },
  
  // Ruang Guru
  { id: "a10", kodeBarang: "02.06.03.03.01", nomorRegister: "000010", nama: "Printer InkJet Multifungsi", kategori: "Peralatan & Mesin (KIB B)", merk: "Brother DCP-T510W", bahan: "Plastik", tahunPerolehan: 2021, kondisi: "Rusak Ringan", ruanganId: "r5", harga: 2800000, sumberDana: "BOS Daerah (BOSDa)", catatan: "Tinta hitam mampet" },
  { id: "a11", kodeBarang: "02.06.02.05.05", nomorRegister: "000011", nama: "Dispenser Air Minum", kategori: "Peralatan & Mesin (KIB B)", merk: "Miyako", bahan: "Plastik", tahunPerolehan: 2019, kondisi: "Baik", ruanganId: "r5", harga: 300000, sumberDana: "Lainnya" },
];

export const mockMaintenance: MaintenanceRecord[] = [
  { id: "m1", assetId: "a6", tanggalLapor: formatISO(subDays(new Date(), 5)), pelapor: "Bpk. Adi Gunawan", deskripsiKerusakan: "AC kurang dingin, sudah 1 minggu tidak terasa anginnya.", status: "Proses Perbaikan", teknisi: "Pak Marno (Teknisi Luar)", biayaEstimasi: 150000 },
  { id: "m2", assetId: "a8", tanggalLapor: formatISO(subDays(new Date(), 30)), pelapor: "Ibu Ratna Kumala", deskripsiKerusakan: "Sampul lepas dan beberapa halaman inti hilang.", status: "Dibatalkan", catatan: "Buku ditarik dari peredaran, ganti baru." } as any,
  { id: "m3", assetId: "a10", tanggalLapor: formatISO(subDays(new Date(), 2)), pelapor: "Ibu Nurul", deskripsiKerusakan: "Hasil print warna hitam putus-putus. Sudah dicoba cleaning tetap sama.", status: "Menunggu" },
];

export const mockConsumables: Consumable[] = [
  { id: "c1", nama: "Kertas HVS A4 80gr", kategori: "ATK & Kertas", stokSisa: 12, satuan: "Rim", batasMinimum: 5 },
  { id: "c2", nama: "Tinta Printer Epson 003 Hitam", kategori: "ATK & Tinta", stokSisa: 2, satuan: "Botol", batasMinimum: 5 },
  { id: "c3", nama: "Spidol Papan Tulis Snowman", kategori: "ATK", stokSisa: 45, satuan: "Pcs", batasMinimum: 20 },
  { id: "c4", nama: "Cairan Pembersih Lantai", kategori: "Kebersihan", stokSisa: 15, satuan: "Botol", batasMinimum: 10 },
];

export const mockBorrowings: Borrowing[] = [
  { id: "b1", assetId: "a3", peminjam: "Bpk. Andi (Guru IPA)", tanggalPinjam: formatISO(subDays(new Date(), 2)), status: "Dipinjam" },
  { id: "b2", assetId: "a7", peminjam: "Staf TU", tanggalPinjam: formatISO(subDays(new Date(), 5)), tanggalKembali: formatISO(subDays(new Date(), 4)), status: "Dikembalikan" },
];

export const mockProcurements: Procurement[] = [
  { id: "p1", namaItem: "Laptop Guru", jumlah: 5, estimasiHarga: 40000000, tanggalPengajuan: formatISO(subDays(new Date(), 15)), status: "Disetujui", sumberDana: "BOS Reguler" },
  { id: "p2", namaItem: "Meja & Kursi Siswa", jumlah: 40, estimasiHarga: 16000000, tanggalPengajuan: formatISO(subDays(new Date(), 3)), status: "Pengajuan", sumberDana: "Yayasan" },
];

export const mockMutations: Mutation[] = [
  { id: "mu1", assetId: "a4", dariRuanganId: "r3", keRuanganId: "r5", tanggalMutasi: formatISO(subDays(new Date(), 10)), alasan: "Pemindahan sementara untuk staf TU", status: "Selesai" },
];

export const mockStocktakes: Stocktake[] = [
  { id: "s1", tanggal: formatISO(subDays(new Date(), 90)), penanggungJawab: "Tim Audit Sarpras", totalAsetDiperiksa: 150, asetSesuai: 148, asetSelisih: 2, status: "Selesai" },
  { id: "s2", tanggal: formatISO(new Date()), penanggungJawab: "Waka Sarpras", totalAsetDiperiksa: 50, asetSesuai: 50, asetSelisih: 0, status: "Berlangsung" },
];

export const mockDisposals: Disposal[] = [
  { id: "d1", assetId: "a8", tanggalPengajuan: formatISO(subDays(new Date(), 10)), metode: "Pemusnahan", alasan: "Buku hancur, basah, dan sobek", status: "Diajukan" },
];
