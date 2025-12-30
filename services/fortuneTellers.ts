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
      price: 'price_credits',
      views: 'views',
    };

    query = query.order(columnMap[sortBy] || 'rating', { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fortune tellers:', error);
      return [];
    }

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
      price: item.price_credits || item.price, // Prefer price_credits
      isOnline: item.is_online,
      bio: item.bio || undefined,
      isAI: item.is_ai,
      views: item.views || 0,
    }));
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
      price: item.price_credits || item.price,
      isOnline: item.is_online,
      bio: item.bio || undefined,
      isAI: item.is_ai,
      views: item.views || 0,
    };
  },

  async incrementViews(id: string): Promise<void> {
    // Note: This usually requires a RPC call to safely increment
    const { data, error: fetchError } = await supabase
      .from('fortune_tellers')
      .select('views')
      .eq('id', id)
      .single();

    if (fetchError || !data) return;

    await supabase
      .from('fortune_tellers')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
  },
};
