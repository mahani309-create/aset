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
  logoAplikasi: ""
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// A robust Firestore sync hook that behaves exactly like useState/useLocalStorage
function useFirestoreDocument<T>(docId: string, initialValue: T) {
  const { isAuthenticated } = useAuth();
  
  // Try to load from localStorage first for instant display
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`sarpras_${docId}`);
      return item ? JSON.parse(item) : initialValue;
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
      disposals, setDisposals
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

