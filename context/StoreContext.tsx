import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, CreativeWork } from '../types';

interface StoreContextType {
  user: User | null;
  works: CreativeWork[];
  login: (name: string) => void;
  logout: () => void;
  addWork: (work: Omit<CreativeWork, 'id' | 'createdAt'>) => void;
  deleteWork: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEMO_WORKS: CreativeWork[] = [
  {
    id: 'demo-1',
    type: 'image',
    url: 'https://picsum.photos/id/28/800/800',
    prompt: 'A minimalist forest landscape with fog, high contrast, monochrome style',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'demo-2',
    type: 'image',
    url: 'https://picsum.photos/id/56/800/600',
    prompt: 'Product photography of a ceramic vase, soft lighting, pastel background',
    createdAt: Date.now() - 5000000,
  }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [works, setWorks] = useState<CreativeWork[]>(DEMO_WORKS);

  const login = (name: string) => {
    setUser({
      id: 'u-1',
      name: name || 'Designer',
      role: 'Senior Designer',
      avatar: `https://ui-avatars.com/api/?name=${name || 'Designer'}&background=4f46e5&color=fff`,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const addWork = (work: Omit<CreativeWork, 'id' | 'createdAt'>) => {
    const newWork: CreativeWork = {
      ...work,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setWorks((prev) => [newWork, ...prev]);
  };

  const deleteWork = (id: string) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <StoreContext.Provider value={{ user, works, login, logout, addWork, deleteWork }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};