import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loginWithGoogle: (forcePrompt?: boolean) => Promise<{success: boolean, code?: string, message?: string, token?: string}>;
  ensureAccessToken: (forcePrompt?: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "sarpras_gdrive_access_token";
const TOKEN_TIME_KEY = "sarpras_gdrive_token_time";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedTime = localStorage.getItem(TOKEN_TIME_KEY);
      if (stored && storedTime) {
        // If token is less than 55 minutes old, it is valid
        const age = Date.now() - Number(storedTime);
        if (age < 55 * 60 * 1000) {
          return stored;
        }
      }
      return stored || null;
    } catch {
      return null;
    }
  });

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_TIME_KEY);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (forcePrompt: boolean = false): Promise<{success: boolean, code?: string, message?: string, token?: string}> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      
      if (forcePrompt) {
        provider.setCustomParameters({ prompt: 'select_account' });
      }
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
      
      return { success: true, token: credential?.accessToken };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      let userFriendlyMessage = "Gagal masuk ke akun Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = "Jendela login Google ditutup sebelum selesai.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = "Permintaan autentikasi dibatalkan.";
      } else if (error.code === 'auth/popup-blocked') {
        userFriendlyMessage = "Jendela popup Google diblokir oleh browser. Harap izinkan popup di peramban Anda.";
      } else if (error.code === 'auth/network-request-failed') {
        userFriendlyMessage = "Gagal terhubung ke server Google. Periksa koneksi internet Anda.";
      } else if (error.code === 'auth/unauthorized-domain') {
        userFriendlyMessage = "Domain aplikasi ini belum diizinkan pada konfigurasi Firebase Authentication.";
      }
      return { success: false, code: error.code, message: userFriendlyMessage };
    }
  };

  const ensureAccessToken = async (forcePrompt: boolean = false): Promise<string | null> => {
    if (accessToken && !forcePrompt) {
      // Check age if available
      try {
        const storedTime = localStorage.getItem(TOKEN_TIME_KEY);
        if (storedTime && Date.now() - Number(storedTime) > 55 * 60 * 1000) {
          // Token expired, re-authenticate silently or with prompt
          const res = await loginWithGoogle(forcePrompt);
          return res.token || null;
        }
      } catch {
        // ignore
      }
      return accessToken;
    }
    const res = await loginWithGoogle(forcePrompt);
    return res.token || null;
  };

  const logout = async () => {
    setAccessToken(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      loading, 
      accessToken, 
      setAccessToken,
      loginWithGoogle, 
      ensureAccessToken,
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
