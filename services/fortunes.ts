import { supabase } from './supabase';
import { getLocales } from 'expo-localization';
import { Fortune } from '@/types';
import { FortuneType } from '@/constants/fortuneTypes';
import { Database } from '@/types/supabase';
import * as StoreReview from 'expo-store-review';

type FortuneRow = Database['public']['Tables']['fortunes']['Row'] & {
  fortune_tellers: {
    id: string;
    name: string;
    avatar_url: string | null;
    expertise: string[];
    rating: number;
    price_credits: number | null;
    price: number;
    is_online: boolean;
    is_ai: boolean;
  } | null;
  fortune_images: { url: string }[] | null;
};

export interface CreateFortuneData {
  userId: string;
  type: FortuneType;
  fortuneTellerId?: string;
  images?: string[];
  note?: string;
  metadata?: Record<string, any>;
}

export const fortuneService = {
  async getUserFortunes(userId: string, page: number = 0, pageSize: number = 15): Promise<Fortune[]> {
    console.log('[Fortune] Fetching fortunes for user:', userId, 'page:', page);
    const from = page * pageSize;
    const to = (page + 1) * pageSize - 1;
    const { data, error } = await (supabase
      .from('fortunes' ) )
      .select(`
        *,
        fortune_tellers (
          id,
          name,
          avatar_url,
          expertise,
          rating,
          price_credits,
          price,
          is_online,
          is_ai
        ),
        fortune_images (url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[Fortune] Fetch error:', error);
      throw error;
    }

    return ((data as unknown as FortuneRow[]) || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      fortuneTellerId: item.teller_id || undefined,
      fortuneTellerName: item.fortune_tellers?.name,
      fortuneTellerAvatar: item.fortune_tellers?.avatar_url || undefined,
      type: item.type as FortuneType,
      status: item.status as 'pending' | 'completed',
      images: item.fortune_images?.map((img) => img.url) || [],
      note: item.user_note || undefined,
      result: item.response || undefined,
      createdAt: item.created_at,
      completedAt: item.completed_at || undefined,
      isRead: item.is_read ?? false,
      userRating: (item.user_rating as 1 | -1) ?? null,
      metadata: (item.metadata || {}) as Record<string, any>,
    }));
  },

  async createFortune(data: CreateFortuneData): Promise<Fortune> {
    console.log('[Fortune] Creating fortune:', data.type);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[Fortune] No auth user');
      throw userError || new Error('Oturum bulunamadı');
    }

    const { data: fortune, error } = await (supabase
      .from('fortunes' ) )
      .insert({
        user_id: user.id,
        teller_id: data.fortuneTellerId || null,
        type: data.type,
        user_note: data.note || null,
        status: 'pending',
        metadata: (data.metadata || {}) as typeof data.metadata,
      } )
      .select()
      .single();

    if (error) {
      console.error('[Fortune] Create error:', error);
      throw error;
    }

    if (data.images?.length) {
      for (const uri of data.images) {
        const publicUrl = await this.uploadImage(user.id, uri, data.type);
        await (supabase.from('fortune_images' ) ).insert({
          fortune_id: (fortune as any).id,
          url: publicUrl,
        } );
      }
    }

    console.log('[Fortune] Created successfully:', (fortune ).id);

    return {
      id: (fortune as { id: string }).id,
      userId: (fortune as { user_id: string }).user_id,
      fortuneTellerId: (fortune as { teller_id: string | null }).teller_id || undefined,
      type: (fortune as { type: string }).type as FortuneType,
      status: (fortune as { status: string }).status as 'pending' | 'completed',
      images: data.images || [],
      note: (fortune as { user_note: string | null }).user_note || undefined,
      createdAt: (fortune as { created_at: string }).created_at,
      isRead: false,
      metadata: ((fortune as { metadata: any }).metadata || {}) as Record<string, any>,
    };
  },

  async markAsRead(fortuneId: string): Promise<void> {
    const { error } = await (supabase
      .from('fortunes' ) )
      .update({ is_read: true } )
      .eq('id', fortuneId);
    if (error) {
      console.error('[Fortune] Mark as read error:', error);
      throw error;
    }
  },

  async uploadImage(userId: string, uri: string, type: FortuneType): Promise<string> {
    console.log('[Fortune] Uploading image for:', type);

    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      } );

      const { data, error } = await supabase.storage
        .from('fortune-images')
        .upload(fileName, formData , {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        });

      if (error) {
        console.error('[Fortune] Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('fortune-images')
        .getPublicUrl(data.path);

      console.log('[Fortune] Image uploaded:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('[Fortune] Upload exception:', error);
      throw error;
    }
  },

  async getFortuneById(fortuneId: string): Promise<Fortune | null> {
    const { data, error } = await (supabase
      .from('fortunes' ) )
      .select(`
        *,
        fortune_tellers (
          id,
          name,
          avatar_url,
          expertise,
          rating,
          price_credits,
          price,
          is_online,
          is_ai
        ),
        fortune_images (url)
      `)
      .eq('id', fortuneId)
      .single();

    if (error || !data) {
      return null;
    }

    const item = data as unknown as FortuneRow;

    return {
      id: item.id,
      userId: item.user_id,
      fortuneTellerId: item.teller_id || undefined,
      fortuneTellerName: item.fortune_tellers?.name,
      fortuneTellerAvatar: item.fortune_tellers?.avatar_url || undefined,
      type: item.type as FortuneType,
      status: item.status as 'pending' | 'completed',
      images: item.fortune_images?.map((img) => img.url) || [],
      note: item.user_note || undefined,
      result: item.response || undefined,
      createdAt: item.created_at,
      completedAt: item.completed_at || undefined,
      isRead: item.is_read ?? false,
      userRating: (item.user_rating as 1 | -1) ?? null,
      metadata: (item.metadata || {}) as Record<string, any>,
    };
  },

  async rateFortuneResponse(fortuneId: string, rating: 1 | -1): Promise<void> {
    const { error } = await (supabase
      .from('fortunes' ) )
      .update({ user_rating: rating } )
      .eq('id', fortuneId);
    if (error) {
      console.error('[Fortune] Rating update error:', error);
      throw error;
    }

    if (rating === 1 && await StoreReview.hasAction()) {
        try {
            await StoreReview.requestReview();
        } catch (e) {
            console.log('[StoreReview] Error:', e);
        }
    }
  }, 

  async createFortuneSecure(data: CreateFortuneData): Promise<{ id: string; isFree: boolean; cost: number }> {
    // @ts-ignore - Supabase RPC strict typing mismatch workaround
    const { data: result, error } = await supabase.rpc('create_fortune_secure', {
      p_user_id: data.userId,
      p_type: data.type,
      p_teller_id: data.fortuneTellerId || null,
      p_note: data.note,
      p_metadata: { ...data.metadata, language: getLocales()[0]?.languageCode ?? 'tr' },
      p_images: data.images || []
    } );

    if (error) {
      console.error('[Fortune] Secure creation error:', error);
      throw error;
    }

    const res = result as { id: string; is_free: boolean; cost: number };

    return {
      id: res.id,
      isFree: res.is_free,
      cost: res.cost
    };
  },
};
