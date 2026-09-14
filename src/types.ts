export type AssetState = "Baik" | "Rusak Ringan" | "Rusak Berat";
export type AssetCategory = "Tanah (KIB A)" | "Peralatan & Mesin (KIB B)" | "Gedung & Bangunan (KIB C)" | "Jalan, Irigasi & Jaringan (KIB D)" | "Aset Tetap Lainnya (KIB E)" | "Aset Tak Berwujud" | "Ekstrakomptabel";
export type MaintenanceStatus = "Menunggu" | "Proses Perbaikan" | "Selesai" | "Dibatalkan";

export interface Asset {
  id: string;
  kodeBarang: string;
  nomorRegister: string;
  nama: string;
  kategori: AssetCategory;
  merk: string;
  bahan: string;
  tahunPerolehan: number;
  kondisi: AssetState;
  ruanganId: string;
  harga: number;
  sumberDana: "BOS Reguler" | "BOS Kinerja" | "BOS Daerah (BOSDa)" | "Hibah / Sumbangan" | "Yayasan" | "Pemerintah Pusat" | "Lainnya";
  catatan?: string;
  gambarUrl?: string;
  
  // Specific KIB A (Tanah) Properties
  luasTanah?: number;
  letakAlamat?: string;
  statusHak?: string;
  tanggalSertifikat?: string;
  nomorSertifikat?: string;
  penggunaan?: string;

  // Specific KIB B (Peralatan dan Mesin) Properties
  ukuranCc?: string;
  nomorPabrik?: string;
  nomorRangka?: string;
  nomorMesin?: string;
  nomorPolisi?: string;
  nomorBpkb?: string;

  // Specific KIB C (Gedung dan Bangunan) Properties
  bertingkat?: "Bertingkat" | "Tidak";
  beton?: "Beton" | "Bukan";
  luasLantai?: number;
  dokumenGedungTanggal?: string;
  dokumenGedungNomor?: string;
  statusTanah?: string;
  nomorKodeTanah?: string;

  // Specific KIB D (Jalan, Irigasi dan Jaringan) Properties
  konstruksi?: string;
  panjang?: number;
  lebar?: number;
  luasKibD?: number;
  dokumenTanggalKibD?: string;
  dokumenNomorKibD?: string;
  statusTanahKibD?: string;
  nomorKodeTanahKibD?: string;

  // Specific KIB E (Aset Tetap Lainnya) Properties
  bukuJudulPencipta?: string;
  bukuSpesifikasi?: string;
  seniAsalDaerah?: string;
  seniPencipta?: string;
  seniBahan?: string;
  hewanTumbuhanJenis?: string;
  hewanTumbuhanUkuran?: string;
  jumlahKibE?: number;
  tahunCetakKibE?: string;
}

export interface Room {
  id: string;
  kodeRuangan: string;
  nama: string;
  jenis: "Kelas" | "Laboratorium" | "Perpustakaan" | "Kantor" | "Gudang" | "Fasilitas Umum" | "Lainnya";
  panjang?: number;
  lebar?: number;
  tinggi?: number;
  luas?: number;
  bangunan?: string;
  kondisi?: string;
  kapasitas: number;
  penanggungJawab: string; // Nama guru/staf
  nipPenanggungJawab?: string;
  tahunBangunan?: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  tanggalLapor: string; // ISO Date string
  pelapor: string;
  deskripsiKerusakan: string;
  status: MaintenanceStatus;
  tanggalSelesai?: string;
  biayaEstimasi?: number;
  teknisi?: string;
  catatanTeknisi?: string;
  prioritas?: string;
}

export interface Consumable {
  id: string;
  nama: string;
  kategori: string;
  merk?: string;
  spesifikasi?: string;
  lokasiPenyimpanan?: string;
  stokSisa: number;
  satuan: string;
  batasMinimum: number;
}

export interface Borrowing {
  id: string;
  assetId: string;
  peminjam: string;
  nipPeminjam?: string;
  kontakPeminjam?: string;
  alamat?: string;
  unitKerja?: string;
  jabatan?: string; // e.g. Guru, Siswa, Staf, etc.
  lokasiPenggunaan?: string; // Where the asset will be used
  penanggungJawab?: string; // Supervisor/Person in charge if applicable
  keperluan?: string;
  tanggalPinjam: string;
  rencanaTanggalKembali?: string;
  tanggalKembali?: string;
  kondisiPinjam?: string;
  kondisiKembali?: string;
  keterangan?: string;
  jumlah?: number;
  durasi?: string;
  status: "Menunggu Persetujuan" | "Dipinjam" | "Dikembalikan" | "Terlambat" | "Ditolak";
}

export interface Procurement {
  id: string;
  namaItem: string;
  jumlah: number;
  estimasiHarga: number;
  tanggalPengajuan: string;
  status: "Pengajuan" | "Disetujui" | "Selesai" | "Ditolak";
  sumberDana: string;
}

export interface Mutation {
  id: string;
  assetId: string;
  dariRuanganId: string;
  keRuanganId: string;
  tanggalMutasi: string;
  alasan: string;
  status: "Proses" | "Selesai";
}

export interface Stocktake {
  id: string;
  tanggal: string;
  penanggungJawab: string;
  totalAsetDiperiksa: number;
  asetSesuai: number;
  asetSelisih: number;
  status: "Berlangsung" | "Selesai";
}

export interface Disposal {
  id: string;
  assetId: string;
  tanggalPengajuan: string;
  metode: "Pemusnahan" | "Penjualan / Lelang" | "Hibah";
  alasan: string;
  status: "Diajukan" | "Disetujui" | "Selesai";
}

// Stats for dashboard
export interface DashboardStats {
  totalAssets: number;
  totalRooms: number;
  assetsGoodCondition: number;
  assetsNeedRepair: number;
  totalValue: number;
  recentMaintenanceCount: number;
}
