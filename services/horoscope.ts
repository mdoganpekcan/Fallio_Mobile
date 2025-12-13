import { supabase } from './supabase';

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

export const horoscopeService = {
  async getDailyHoroscope(zodiacSign: string): Promise<HoroscopeReading | null> {
    return this.getHoroscopeByScope(zodiacSign, 'daily');
  },

  async getWeeklyHoroscope(zodiacSign: string): Promise<HoroscopeReading | null> {
    return this.getHoroscopeByScope(zodiacSign, 'weekly');
  },

  async getMonthlyHoroscope(zodiacSign: string): Promise<HoroscopeReading | null> {
    return this.getHoroscopeByScope(zodiacSign, 'monthly');
  },

  async getHoroscopeByScope(zodiacSign: string, scope: 'daily' | 'weekly' | 'monthly') {
    console.log('[Horoscope] Fetching horoscope for:', zodiacSign, scope);
    const { data, error } = await supabase
      .from('horoscopes')
      .select('*')
      .eq('sign', zodiacSign)
      .eq('scope', scope)
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Horoscope] Fetch error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      zodiacSign: data.sign,
      general: data.general,
      love: data.love,
      career: data.money,
      health: data.health,
      date: data.effective_date,
    };
  },
};
