import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Package, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { motion } from "motion/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast("Login berhasil. Selamat datang!", "success");
      navigate("/");
    } else {
      toast("Kredensial salah. Silakan coba lagi.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 selection:bg-primary-100 selection:text-primary-900 relative overflow-hidden">
      {/* Decorative background blobs */}
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-200/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <motion.div 
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-200/50 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl w-full bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Branding / Graphic */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Animated overlapping circles inside banner */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-400 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-primary-900 rounded-full blur-3xl"
          ></motion.div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-12"
            >
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
              <span>Sarpras SMP</span>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
                Sistem Informasi Manajemen Sarana & Prasarana
              </h1>
              <p className="text-primary-100 text-lg leading-relaxed max-w-md">
                Kelola aset sekolah dengan mudah, cepat, dan transparan. Pantau ketersediaan, kondisi, dan riwayat pergerakan barang.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative z-10 mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-primary-200 font-medium mb-1 tracking-wide uppercase">Developed By</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary-100" />
              </div>
              <p className="text-xl font-bold text-white tracking-tight">Khabibu Rohman</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-white/50">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-sm w-full mx-auto"
          >
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang 👋</h2>
              <p className="text-slate-700 mt-3 text-sm flex items-center justify-center md:justify-start gap-1">
                Silakan masuk menggunakan akun <strong className="text-slate-700">administrator</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <User className="h-5 w-5 text-slate-600 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: administrator"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-2xl bg-white text-slate-900 placeholder-slate-400 sm:text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan sandi..."
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-2xl bg-white text-slate-900 placeholder-slate-400 sm:text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all group"
                >
                  <span>Masuk Sistem</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/portal-peminjaman')}
                    className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    Kembali ke Portal Peminjaman
                  </button>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
