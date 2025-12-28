import { supabase } from './supabase';
import { FortuneTeller } from '@/types';
import { fortuneTypes } from '@/constants/fortuneTypes';
import { Database } from '@/types/supabase';

type FortuneTellerRow = Database['public']['Tables']['fortune_tellers']['Row'];

export interface FortuneTellerFilters {
  specialty?: string;
  minRating?: number;
  sortBy?: 'rating' | 'price' | 'views';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export const fortuneTellerService = {
  async getFortuneTellers(filters?: FortuneTellerFilters): Promise<FortuneTeller[]> {
    let query = supabase.from('fortune_tellers').select('*');

    // Only apply specialty filter if it's not empty and not 'all'
    if (filters?.specialty && filters.specialty !== 'all') {
      // Map the ID (e.g. 'coffee') to the Display Name (e.g. 'Kahve Falı')
      // because the database stores display names in the expertise array.
      const fortuneType = fortuneTypes.find(f => f.id === filters.specialty);
      const specialtyName = fortuneType ? fortuneType.name : filters.specialty;

      query = query.contains('expertise', [specialtyName]);
    }

    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,bio.ilike.%${filters.searchQuery}%`);
    }

    const sortBy = filters?.sortBy || 'rating';
    const sortOrder = filters?.sortOrder || 'desc';
    const columnMap: Record<string, string> = {
      rating: 'rating',
      price: 'price',
      views: 'created_at',
    };

    query = query.order(columnMap[sortBy] as any, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fortune tellers:', error);
      return [];
    }

    // If no data found, return mock data for testing if needed, or empty array
    if (!data || data.length === 0) {
      console.log('No fortune tellers found, returning empty array');
      return [];
    }

    return (data as FortuneTellerRow[]).map((item) => ({
      id: item.id,
      name: item.name,
      avatarUrl: item.avatar_url || undefined,
      expertise: item.expertise || [],
      rating: item.rating,
      price: item.price,
      isOnline: item.is_online,
      bio: item.bio || undefined,
      isAI: item.is_ai,
    }));
  },

  getMockFortuneTellers(): FortuneTeller[] {
    return [
      {
        id: '1',
        name: 'Falcı Ada',
        avatarUrl: '',
        expertise: ['Kahve Falı', 'Tarot'],
        rating: 4.9,
        views: 12543,
        price: 50,
        isOnline: true,
        bio: '15 yıllık deneyim',
      },
      {
        id: '2',
        name: 'Falcı Elif',
        avatarUrl: '',
        expertise: ['Tarot', 'Aşk Falı'],
        rating: 4.8,
        views: 9821,
        price: 75,
        isOnline: true,
        bio: '10 yıllık deneyim',
      },
      {
        id: '3',
        name: 'Falcı Deniz',
        avatarUrl: '',
        expertise: ['El Falı', 'Rüya Yorumu'],
        rating: 4.7,
        views: 8234,
        price: 60,
        isOnline: false,
        bio: '12 yıllık deneyim',
      },
      {
        id: '4',
        name: 'Falcı Ayşe',
        avatarUrl: '',
        expertise: ['Kahve Falı', 'İskambil'],
        rating: 4.9,
        views: 15234,
        price: 50,
        isOnline: true,
        bio: '20 yıllık deneyim',
      },
      {
        id: '5',
        name: 'Falcı Zeynep',
        avatarUrl: '',
        expertise: ['Tarot', 'Renk Falı'],
        rating: 4.6,
        views: 7123,
        price: 65,
        isOnline: false,
        bio: '8 yıllık deneyim',
      },
    ];
  },

  async getFortuneTellerById(id: string): Promise<FortuneTeller | null> {
    const { data, error } = await supabase
      .from('fortune_tellers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const item = data as FortuneTellerRow;

    return {
      id: item.id,
      name: item.name,
      avatarUrl: item.avatar_url || undefined,
      expertise: item.expertise || [],
      rating: item.rating,
      price: item.price,
      isOnline: item.is_online,
      bio: item.bio || undefined,
      isAI: item.is_ai,
    };
  },

  async incrementViews(): Promise<void> {
    console.log('[FortuneTellers] incrementViews not implemented in current schema');
  },
};
