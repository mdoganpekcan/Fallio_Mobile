export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  birthDate: string;
  zodiacSign: string;
  gender: 'male' | 'female' | 'other';
  credits: number;
  isPremium: boolean;
  createdAt: string;
}

export interface FortuneTeller {
  id: string;
  name: string;
  avatarUrl?: string;
  expertise: string[];
  bio?: string;
  price: number;
  rating: number;
  isOnline: boolean;
  isAI?: boolean;
  views?: number;
}

export interface Fortune {
  id: string;
  userId: string;
  fortuneTellerId?: string;
  fortuneTellerName?: string;
  fortuneTellerAvatar?: string;
  type: 'coffee' | 'tarot' | 'palm' | 'dream' | 'love' | 'card' | 'color';
  status: 'pending' | 'completed';
  images?: string[];
  note?: string;
  result?: string;
  createdAt: string;
  completedAt?: string;
  isRead?: boolean;
  userRating?: number | null;
  metadata?: Record<string, any>;
}

export interface HoroscopeReading {
  zodiacSign: string;
  general: string;
  love?: string;
  career?: string;
  health?: string;
  date?: string;
  weekStart?: string;
  year?: number;
  month?: number;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency?: string;
  productId?: string;
}

export interface Subscription {
  id: string;
  plan_name: string;
  cycle: 'weekly' | 'monthly' | 'yearly';
  price: number;
  perks?: string[];
  status?: string;
  expires_at?: string | null;
}

export const zodiacSigns = [
  { name: 'Koç', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { name: 'Boğa', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { name: 'İkizler', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { name: 'Yengeç', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { name: 'Aslan', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { name: 'Başak', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { name: 'Terazi', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { name: 'Akrep', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { name: 'Yay', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { name: 'Oğlak', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { name: 'Kova', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { name: 'Balık', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
];

export const calculateZodiacSign = (birthDate: string): string => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of zodiacSigns) {
    const { start, end } = sign;
    
    if (start.month === end.month) {
      if (month === start.month && day >= start.day && day <= end.day) {
        return sign.name;
      }
    } else {
      if (
        (month === start.month && day >= start.day) ||
        (month === end.month && day <= end.day)
      ) {
        return sign.name;
      }
    }
  }

  return 'Koç';
};
