import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  mockAssets, mockRooms, mockConsumables, mockProcurements, 
  mockBorrowings, mockMutations, mockMaintenance, mockStocktakes, mockDisposals 
} from '../data/mockData';

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
}

const defaultProfile: SchoolProfile = {
  kementerian: "Kementerian Pendidikan dan Kebudayaan",
  nama: "SMP Belajar Nusantara",
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
  logoDinas: ""
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

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [schoolProfile, setSchoolProfile] = useLocalStorage<SchoolProfile>('sarpras_schoolProfile', defaultProfile);
  const [assets, setAssets] = useLocalStorage('sarpras_assets', mockAssets);
  const [rooms, setRooms] = useLocalStorage('sarpras_rooms', mockRooms);
  const [consumables, setConsumables] = useLocalStorage('sarpras_consumables', mockConsumables);
  const [procurements, setProcurements] = useLocalStorage('sarpras_procurements', mockProcurements);
  const [borrowings, setBorrowings] = useLocalStorage('sarpras_borrowings', mockBorrowings);
  const [mutations, setMutations] = useLocalStorage('sarpras_mutations', mockMutations);
  const [maintenances, setMaintenances] = useLocalStorage('sarpras_maintenances', mockMaintenance);
  const [stocktakes, setStocktakes] = useLocalStorage('sarpras_stocktakes', mockStocktakes);
  const [disposals, setDisposals] = useLocalStorage('sarpras_disposals', mockDisposals);

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

