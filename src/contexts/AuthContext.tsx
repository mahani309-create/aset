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
  loginWithGoogle: (forcePrompt?: boolean) => Promise<{success: boolean, code?: string, token?: string}>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let cachedAccessToken: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        cachedAccessToken = null;
        setAccessToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (forcePrompt: boolean = false): Promise<{success: boolean, code?: string, token?: string}> => {
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
        cachedAccessToken = credential.accessToken;
        setAccessToken(credential.accessToken);
      }
      
      return { success: true, token: credential?.accessToken };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      return { success: false, code: error.code };
    }
  };

  const logout = async () => {
    cachedAccessToken = null;
    setAccessToken(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, accessToken, loginWithGoogle, logout }}>
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
