import { supabase } from './supabase';
import { Fortune } from '@/types';
import { FortuneType } from '@/constants/fortuneTypes';

export interface CreateFortuneData {
  userId: string;
  type: FortuneType;
  fortuneTellerId?: string;
  images?: string[];
  note?: string;
  metadata?: Record<string, any>;
}

export const fortuneService = {
  async getUserFortunes(userId: string): Promise<Fortune[]> {
    console.log('[Fortune] Fetching fortunes for user:', userId);
    const { data, error } = await supabase
      .from('fortunes')
      .select(`
        *,
        fortune_tellers (
          id,
          name,
          avatar_url,
          expertise,
          rating,
          price,
          is_online,
          is_ai
        ),
        fortune_images (url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Fortune] Fetch error:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      fortuneTellerId: item.teller_id,
      fortuneTellerName: item.fortune_tellers?.name,
      fortuneTellerAvatar: item.fortune_tellers?.avatar_url,
      type: item.type,
      status: item.status,
      images: item.fortune_images?.map((img: any) => img.url) || [],
      note: item.user_note,
      result: item.response,
      createdAt: item.created_at,
      completedAt: item.completed_at,
      isRead: item.is_read ?? false,
      userRating: item.user_rating ?? null,
      metadata: item.metadata,
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

    const { data: fortune, error } = await supabase
      .from('fortunes')
      .insert({
        user_id: user.id,
        teller_id: data.fortuneTellerId,
        type: data.type,
        user_note: data.note,
        status: 'pending',
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[Fortune] Create error:', error);
      throw error;
    }

    if (data.images?.length) {
      for (const uri of data.images) {
        const publicUrl = await this.uploadImage(user.id, uri, data.type);
        await supabase.from('fortune_images').insert({
          fortune_id: fortune.id,
          url: publicUrl,
        });
      }
    }

    console.log('[Fortune] Created successfully:', fortune.id);

    // --- AI TETİKLEME ---
    // Fal oluşturulduktan sonra, eğer AI falcısı ise hemen işlemesi için backend'i dürtüyoruz.
    try {
      // Not: Bu URL'i kendi Vercel URL'inizle değiştirin veya .env'den çekin
      const API_URL = 'https://fallio-web.vercel.app/api/cron/process-fortunes'; 
      const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      // Arka planda çalışsın, cevabı beklemeye gerek yok (fire and forget)
      fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`
        }
      }).catch(err => console.log('[Fortune] AI trigger failed (non-fatal):', err));
      
    } catch (e) {
      // Tetikleme hatası falın oluşmasını engellememeli
      console.log('[Fortune] AI trigger error:', e);
    }

    return {
      id: fortune.id,
      userId: fortune.user_id,
      fortuneTellerId: fortune.teller_id,
      type: fortune.type,
      status: fortune.status,
      images: data.images || [],
      note: fortune.user_note,
      createdAt: fortune.created_at,
      isRead: false,
      metadata: fortune.metadata,
    };
  },
  async markAsRead(fortuneId: string): Promise<void> {
    const { error } = await supabase
      .from('fortunes')
      .update({ is_read: true })
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
      } as any);

      const { data, error } = await supabase.storage
        .from('fortune-images')
        .upload(fileName, formData as any, {
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
    const { data, error } = await supabase
      .from('fortunes')
      .select(`
        *,
        fortune_tellers (
          id,
          name,
          avatar_url,
          expertise,
          rating,
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

    return {
      id: data.id,
      userId: data.user_id,
      fortuneTellerId: data.teller_id,
      fortuneTellerName: data.fortune_tellers?.name,
      fortuneTellerAvatar: data.fortune_tellers?.avatar_url,
      type: data.type,
      status: data.status,
      images: data.fortune_images?.map((img: any) => img.url) || [],
      note: data.user_note,
      result: data.response,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      isRead: data.is_read ?? false,
      userRating: data.user_rating ?? null,
    };
  },

  async rateFortuneResponse(fortuneId: string, rating: 1 | -1): Promise<void> {
    const { error } = await supabase
      .from('fortunes')
      .update({ user_rating: rating })
      .eq('id', fortuneId);
    if (error) {
      console.error('[Fortune] Rating update error:', error);
      throw error;
    }
  },

  async simulateFortuneResponse(fortuneId: string): Promise<void> {
    console.log('[Fortune] simulateFortuneResponse skipped (awaiting real teller response)');
  },
};
