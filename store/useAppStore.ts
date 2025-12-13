import { create } from 'zustand';
import { User, Fortune, FortuneTeller, HoroscopeReading } from '@/types';

interface AppState {
  user: User | null;
  fortunes: Fortune[];
  fortuneTellers: FortuneTeller[];
  horoscope: HoroscopeReading | null;
  isOnboardingComplete: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  
  setUser: (user: User | null) => void;
  updateUserCredits: (credits: number) => void;
  setFortunes: (fortunes: Fortune[]) => void;
  addFortune: (fortune: Fortune) => void;
  updateFortune: (id: string, updates: Partial<Fortune>) => void;
  setFortuneTellers: (fortuneTellers: FortuneTeller[]) => void;
  setHoroscope: (horoscope: HoroscopeReading) => void;
  completeOnboarding: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'tr' | 'en') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  fortunes: [],
  fortuneTellers: [],
  horoscope: null,
  isOnboardingComplete: false,
  theme: 'dark',
  language: 'tr',

  setUser: (user) => set({ user }),
  
  updateUserCredits: (credits) =>
    set((state) => ({
      user: state.user ? { ...state.user, credits } : null,
    })),

  setFortunes: (fortunes) => set({ fortunes }),
  
  addFortune: (fortune) =>
    set((state) => ({
      fortunes: [fortune, ...state.fortunes],
    })),
  
  updateFortune: (id, updates) =>
    set((state) => ({
      fortunes: state.fortunes.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  setFortuneTellers: (fortuneTellers) => set({ fortuneTellers }),
  
  setHoroscope: (horoscope) => set({ horoscope }),
  
  completeOnboarding: () => set({ isOnboardingComplete: true }),
  
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  logout: () =>
    set({
      user: null,
      fortunes: [],
      horoscope: null,
    }),
}));
