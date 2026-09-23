import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  mockAssets, mockRooms, mockConsumables, mockProcurements, 
  mockBorrowings, mockMutations, mockMaintenance, mockStocktakes, mockDisposals 
} from '../data/mockData';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface SchoolProfile {
  kementerian: string;
  nama: string;
  npsn: string;
  alamat: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepsek: string;
  operator: string;
  nipOperator: string;
  logoDinas?: string;
  logoSekolah?: string;
  logoAplikasi?: string;
  adminPin?: string;
  adminUsername?: string;
  adminPassword?: string;
}

const defaultProfile: SchoolProfile = {
  kementerian: "Kementerian Pendidikan dan Kebudayaan",
  nama: "SMP Negeri 3 Kras",
  npsn: "20202020",
  alamat: "Jl. Pendidikan No. 123, Kota Pelajar, Provinsi Ilmu Pengetahuan",
  kodePos: "40123",
  telepon: "(021) 1234567",
  email: "info@smpbelajar.id",
  website: "www.smpbelajar.id",
  kepalaSekolah: "Bpk. H. Ahmad Sudirman, S.Pd., M.Si.",
  nipKepsek: "19780101 200501 1 001",
  operator: "Ibu Mahani",
  nipOperator: "19850101 201001 2 002",
  logoDinas: "",
  logoSekolah: "",
  logoAplikasi: "/icon.svg",
  adminPin: "123456",
  adminUsername: "admin",
  adminPassword: "admin123"
};

interface DataContextType {
  schoolProfile: SchoolProfile;
  setSchoolProfile: React.Dispatch<React.SetStateAction<SchoolProfile>>;
  assets: typeof mockAssets;
  setAssets: React.Dispatch<React.SetStateAction<typeof mockAssets>>;
  rooms: typeof mockRooms;
  setRooms: React.Dispatch<React.SetStateAction<typeof mockRooms>>;
  consumables: typeof mockConsumables;
  setConsumables: React.Dispatch<React.SetStateAction<typeof mockConsumables>>;
  procurements: typeof mockProcurements;
  setProcurements: React.Dispatch<React.SetStateAction<typeof mockProcurements>>;
  borrowings: typeof mockBorrowings;
  setBorrowings: React.Dispatch<React.SetStateAction<typeof mockBorrowings>>;
  mutations: typeof mockMutations;
  setMutations: React.Dispatch<React.SetStateAction<typeof mockMutations>>;
  maintenances: typeof mockMaintenance;
  setMaintenances: React.Dispatch<React.SetStateAction<typeof mockMaintenance>>;
  stocktakes: typeof mockStocktakes;
  setStocktakes: React.Dispatch<React.SetStateAction<typeof mockStocktakes>>;
  disposals: typeof mockDisposals;
  setDisposals: React.Dispatch<React.SetStateAction<typeof mockDisposals>>;
  getFullDatabase: () => Record<string, any>;
  importFullDatabase: (data: any) => void;
  resetToInitialData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// A robust Firestore sync hook that behaves exactly like useState/useLocalStorage
function useFirestoreDocument<T>(docId: string, initialValue: T) {
  const { isAuthenticated } = useAuth();
  
  // Try to load from localStorage first for instant display
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`sarpras_${docId}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (docId === 'schoolProfile' && parsed) {
          if (!parsed.logoAplikasi) parsed.logoAplikasi = '/icon.svg';
          if (!parsed.adminUsername) parsed.adminUsername = 'admin';
          if (!parsed.adminPassword) parsed.adminPassword = 'admin123';
          if (!parsed.adminPin) parsed.adminPin = '123456';
        }
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Subscribe to Firestore changes
    const docRef = doc(db, 'appData', docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().value as T;
        if (docId === 'schoolProfile' && data && !(data as any).logoAplikasi) {
          (data as any).logoAplikasi = '/icon.svg';
        }
        setStoredValue(data);
        // Also update local storage for offline caching
        window.localStorage.setItem(`sarpras_${docId}`, JSON.stringify(data));
      } else {
        // First time initialization in Firestore
        setDoc(docRef, { value: storedValue });
      }
    }, (error) => {
      console.error(`Error subscribing to ${docId}:`, error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, docId]);

  const setValue = (value: React.SetStateAction<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(`sarpras_${docId}`, JSON.stringify(valueToStore));
      
      if (isAuthenticated) {
        setDoc(doc(db, 'appData', docId), { value: valueToStore });
      }
    } catch (error) {
      console.error(`Error setting value for ${docId}:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [schoolProfile, setSchoolProfile] = useFirestoreDocument<SchoolProfile>('schoolProfile', defaultProfile);
  const [assets, setAssets] = useFirestoreDocument('assets', mockAssets);
  const [rooms, setRooms] = useFirestoreDocument('rooms', mockRooms);
  const [consumables, setConsumables] = useFirestoreDocument('consumables', mockConsumables);
  const [procurements, setProcurements] = useFirestoreDocument('procurements', mockProcurements);
  const [borrowings, setBorrowings] = useFirestoreDocument('borrowings', mockBorrowings);
  const [mutations, setMutations] = useFirestoreDocument('mutations', mockMutations);
  const [maintenances, setMaintenances] = useFirestoreDocument('maintenances', mockMaintenance);
  const [stocktakes, setStocktakes] = useFirestoreDocument('stocktakes', mockStocktakes);
  const [disposals, setDisposals] = useFirestoreDocument('disposals', mockDisposals);

  const getFullDatabase = () => {
    return {
      schoolProfile,
      assets,
      rooms,
      consumables,
      procurements,
      borrowings,
      mutations,
      maintenances,
      stocktakes,
      disposals,
    };
  };

  const importFullDatabase = (data: any) => {
    if (!data || typeof data !== 'object') return;
    if (data.schoolProfile) setSchoolProfile(data.schoolProfile);
    if (Array.isArray(data.assets)) setAssets(data.assets);
    if (Array.isArray(data.rooms)) setRooms(data.rooms);
    if (Array.isArray(data.consumables)) setConsumables(data.consumables);
    if (Array.isArray(data.procurements)) setProcurements(data.procurements);
    if (Array.isArray(data.borrowings)) setBorrowings(data.borrowings);
    if (Array.isArray(data.mutations)) setMutations(data.mutations);
    if (Array.isArray(data.maintenances)) setMaintenances(data.maintenances);
    if (Array.isArray(data.stocktakes)) setStocktakes(data.stocktakes);
    if (Array.isArray(data.disposals)) setDisposals(data.disposals);
  };

  const resetToInitialData = () => {
    setSchoolProfile(defaultProfile);
    setAssets(mockAssets);
    setRooms(mockRooms);
    setConsumables(mockConsumables);
    setProcurements(mockProcurements);
    setBorrowings(mockBorrowings);
    setMutations(mockMutations);
    setMaintenances(mockMaintenance);
    setStocktakes(mockStocktakes);
    setDisposals(mockDisposals);
  };

  return (
    <DataContext.Provider value={{
      schoolProfile, setSchoolProfile,
      assets, setAssets,
      rooms, setRooms,
      consumables, setConsumables,
      procurements, setProcurements,
      borrowings, setBorrowings,
      mutations, setMutations,
      maintenances, setMaintenances,
      stocktakes, setStocktakes,
      disposals, setDisposals,
      getFullDatabase,
      importFullDatabase,
      resetToInitialData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

