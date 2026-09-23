import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Package, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { motion } from "motion/react";

export default function Login() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const { schoolProfile } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  
  const appIcon = schoolProfile.logoAplikasi || schoolProfile.logoSekolah || "/icon.svg";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleVerifyPin = () => {
    const correctPin = schoolProfile.adminPin || "123456";
    if (pinInput === correctPin) {
      setIsPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
      toast("PIN Admin salah. Silakan coba lagi.", "error");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      toast("Login berhasil. Selamat datang!", "success");
      navigate("/");
    } else {
      if (result.code === 'auth/popup-closed-by-user' || result.code === 'auth/cancelled-popup-request') {
        toast("Login dibatalkan. Silakan coba lagi.", "info");
      } else {
        toast("Gagal masuk dengan Google. Silakan coba lagi.", "error");
      }
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
        <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
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
              <div className="h-12 w-12 flex items-center justify-center shrink-0">
                <img src={appIcon} alt="Logo Aplikasi" className="h-full w-full object-contain" />
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
        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/50">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-sm w-full mx-auto"
          >
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang 👋</h2>
              <p className="text-slate-700 mt-3 text-sm flex items-center justify-center md:justify-start gap-1">
                {isPinVerified ? "Silakan masuk menggunakan " : "Masukkan PIN Admin untuk "} <strong className="text-slate-700">{isPinVerified ? "Akun Google Anda" : "melanjutkan"}.</strong>
              </p>
            </div>

            <div className="space-y-6">
              {!isPinVerified ? (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">PIN Admin</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleVerifyPin();
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${pinError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/10'}`}
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>
                    {pinError && <p className="text-xs text-red-500 font-medium">PIN yang dimasukkan salah.</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPin}
                    className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm text-sm font-bold transition-all gap-2"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center py-4 px-4 border border-slate-300 rounded-2xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </button>
                </motion.div>
              )}
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-6 text-center"
              >
                <button
                  type="button"
                  onClick={() => navigate('/portal-peminjaman')}
                  className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                >
                  Kembali ke Portal Peminjaman
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
