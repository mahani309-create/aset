import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { useData } from "../contexts/DataContext";
import { Package, DoorClosed, CheckCircle2, AlertTriangle, Activity, Wrench, ArrowRightLeft, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { motion } from 'motion/react';

import { Link } from "react-router-dom";

export default function Dashboard() {
  const { assets, rooms, maintenances, borrowings } = useData();

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.harga || 0), 0);

  const stats = {
    totalAssets: assets.length,
    totalRooms: rooms.length,
    goodCondition: assets.filter(a => a.kondisi === "Baik").length,
    needsRepair: assets.filter(a => a.kondisi !== "Baik").length,
    maintenanceCount: maintenances.length,
    totalValue: totalAssetValue,
    activeBorrowings: borrowings?.filter(b => b.status === "Dipinjam" || b.status === "Menunggu Persetujuan").length || 0
  };

  const kibStats = [
    { name: "KIB A (Tanah)", label: "KIB A", count: assets.filter(a => a.kategori === "Tanah (KIB A)").length, value: assets.filter(a => a.kategori === "Tanah (KIB A)").reduce((sum, a) => sum + (a.harga || 0), 0) },
    { name: "KIB B (Peralatan & Mesin)", label: "KIB B", count: assets.filter(a => a.kategori === "Peralatan & Mesin (KIB B)").length, value: assets.filter(a => a.kategori === "Peralatan & Mesin (KIB B)").reduce((sum, a) => sum + (a.harga || 0), 0) },
    { name: "KIB C (Gedung & Bangunan)", label: "KIB C", count: assets.filter(a => a.kategori === "Gedung & Bangunan (KIB C)").length, value: assets.filter(a => a.kategori === "Gedung & Bangunan (KIB C)").reduce((sum, a) => sum + (a.harga || 0), 0) },
    { name: "KIB D (Jalan, Irigasi & Jaringan)", label: "KIB D", count: assets.filter(a => a.kategori === "Jalan, Irigasi & Jaringan (KIB D)").length, value: assets.filter(a => a.kategori === "Jalan, Irigasi & Jaringan (KIB D)").reduce((sum, a) => sum + (a.harga || 0), 0) },
    { name: "KIB E (Aset Tetap Lainnya)", label: "KIB E", count: assets.filter(a => a.kategori === "Aset Tetap Lainnya (KIB E)").length, value: assets.filter(a => a.kategori === "Aset Tetap Lainnya (KIB E)").reduce((sum, a) => sum + (a.harga || 0), 0) },
    { name: "Lainnya", label: "Lainnya", count: assets.filter(a => ["Aset Tak Berwujud", "Ekstrakomptabel"].includes(a.kategori)).length, value: assets.filter(a => ["Aset Tak Berwujud", "Ekstrakomptabel"].includes(a.kategori)).reduce((sum, a) => sum + (a.harga || 0), 0) },
  ].filter(k => k.count > 0 || k.label === "KIB A" || k.label === "KIB B"); // always show some KIBs at least

  // Data for chart
  const categoryData = assets.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.kategori);
    if (existing) {
      existing.jumlah += 1;
    } else {
      acc.push({ name: curr.kategori, jumlah: 1 });
    }
    return acc;
  }, [] as { name: string, jumlah: number }[]);

  const conditionData = [
    { name: 'Baik', value: assets.filter(a => a.kondisi === "Baik").length, color: '#10b981' },
    { name: 'Rusak Ringan', value: assets.filter(a => a.kondisi === "Rusak Ringan").length, color: '#f59e0b' },
    { name: 'Rusak Berat', value: assets.filter(a => a.kondisi === "Rusak Berat").length, color: '#ef4444' }
  ].filter(c => c.value > 0);

  // Growth Trend Data by year
  const growthDataMap = assets.reduce((acc, curr) => {
    const year = curr.tahunPerolehan || new Date().getFullYear();
    if (!acc[year]) acc[year] = 0;
    acc[year] += 1;
    return acc;
  }, {} as Record<number, number>);
  
  const growthData = Object.entries(growthDataMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, total]) => ({ year, total }));

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-700 font-medium mt-1">Sistem Informasi Manajemen Barang & Aset Inventaris.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 font-semibold rounded-xl shadow-sm transition-colors flex" onClick={() => window.location.hash = '/borrowing'}>
            <span className="text-sm">🔄 Peminjaman</span>
          </button>
          <button className="flex-1 sm:flex-none items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 font-semibold rounded-xl shadow-sm transition-colors flex" onClick={() => window.location.hash = '/maintenance'}>
            <Wrench className="h-4 w-4 text-amber-500" />
            <span className="text-sm border-l border-slate-300 dark:border-slate-700 pl-2">Lapor Rusak</span>
          </button>
          <button className="flex-1 sm:flex-none items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 font-semibold rounded-xl shadow-sm shadow-primary-500/20 transition-colors flex" onClick={() => window.location.hash = '/assets'}>
            <Package className="h-4 w-4" />
            <span className="text-sm border-l border-white/20 pl-2">Kelola Aset</span>
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <Package className="h-24 w-24 text-primary-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-600">Total Aset</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.totalAssets}</div>
            <p className="text-sm text-primary-600 font-semibold mt-1">Rp {stats.totalValue.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <CheckCircle2 className="h-24 w-24 text-emerald-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-600">Kondisi Baik</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.goodCondition}</div>
            <p className="text-sm text-emerald-600 font-semibold mt-1">Aset siap pakai</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <AlertTriangle className="h-24 w-24 text-amber-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-600">Perbaikan</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.needsRepair}</div>
            <p className="text-sm text-amber-600 font-semibold mt-1">Butuh perhatian</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <ArrowRightLeft className="h-24 w-24 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-600">Dipinjam</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.activeBorrowings}</div>
            <p className="text-sm text-blue-600 font-semibold mt-1">Sedang dipinjam</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <DoorClosed className="h-24 w-24 text-indigo-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-600">Total Ruangan</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <DoorClosed className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRooms}</div>
            <p className="text-sm text-indigo-600 font-semibold mt-1">Fasilitas ada</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kibStats.map((kib, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 border-l-4 border-l-primary-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">{kib.name}</CardTitle>
              <Package className="h-4 w-4 text-primary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{kib.count} <span className="text-sm font-normal text-slate-700">Item</span></div>
              <p className="text-sm text-slate-700 mt-1 font-medium">Nilai: Rp {kib.value.toLocaleString('id-ID')}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <CardTitle className="font-bold">Distribusi Aset Menurut Kategori</CardTitle>
            <CardDescription className="text-sm mt-1">
              Jumlah barang berdasarkan pengelompokan sistem KIB terbaru.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pl-0">
            {categoryData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="jumlah" fill="var(--color-primary-500, #6366f1)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
                <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-[300px]">
                  <Package className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-700 block">Tidak ada data aset</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-sm">Tambah aset baru untuk melihat distribusinya berdasarkan kategori KIB.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <CardTitle className="font-bold">Kondisi Aset</CardTitle>
            <CardDescription className="text-sm mt-1">
              Persentase kondisi aset saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            {conditionData.length > 0 ? (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {conditionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-6 justify-center">
                  {conditionData.map(c => (
                    <div key={c.name} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-600">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name} ({c.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Activity className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-700 block">Belum Ada Kondisi Tertatat</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-[200px]">Data kondisi aset tidak tersedia.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <CardTitle className="font-bold">Tren Pertambahan Aset</CardTitle>
            <CardDescription className="text-sm mt-1">
              Grafik pertumbuhan pengadaan inventaris dari tahun ke tahun.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {growthData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="var(--color-primary-500, #6366f1)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary-500, #6366f1)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            ) : (
                <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-[250px]">
                  <Activity className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-700 block">Tidak dapat memuat tren</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-sm">Data riwayat pengadaan aset masih kosong.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <CardTitle className="font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              Aktivitas Pemeliharaan Terbaru
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Riwayat 5 tiket pemeliharaan aset terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-80 overflow-y-auto">
            <div className="space-y-6">
              {maintenances.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium">Belum ada aktivitas pemeliharaan.</p>
                </div>
              ) : (
                maintenances.slice(0, 5).map((record) => {
                  const asset = assets.find(a => a.id === record.assetId);
                  return (
                    <motion.div 
                      key={record.id} 
                      className="flex items-start gap-4 group p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 p-2 rounded-full h-10 w-10 items-center justify-center shrink-0 transition-colors">
                        <Wrench className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {asset?.nama || "Unknown Asset"} <span className="text-slate-600 font-normal">({asset?.kodeBarang})</span>
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-600 line-clamp-1 leading-snug">
                          {record.deskripsiKerusakan}
                        </p>
                        <div className="flex items-center pt-1 gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${record.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                            {record.status}
                          </span>
                          <span className="text-xs font-medium text-slate-600">
                            {new Date(record.tanggalLapor).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <CardTitle className="font-bold">Akses Cepat</CardTitle>
            <CardDescription className="text-sm mt-1">
              Menu pintasan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/assets" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-colors group">
                 <Package className="h-6 w-6 text-slate-600 group-hover:text-primary-600 mb-2 transition-colors" />
                 <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700">Aset</span>
              </Link>
              <Link to="/procurement" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-colors group">
                 <Plus className="h-6 w-6 text-slate-600 group-hover:text-primary-600 mb-2 transition-colors" />
                 <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700">Pengadaan</span>
              </Link>
              <Link to="/borrowing" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-colors group">
                 <ArrowRightLeft className="h-6 w-6 text-slate-600 group-hover:text-primary-600 mb-2 transition-colors" />
                 <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700">Peminjaman</span>
              </Link>
              <Link to="/reports" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-colors group">
                 <Activity className="h-6 w-6 text-slate-600 group-hover:text-primary-600 mb-2 transition-colors" />
                 <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700">Laporan</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
