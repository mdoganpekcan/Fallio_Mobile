import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Database } from '@/types/supabase';

export type UpdateProfileData = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  async getProfile(userId: string) {
    console.log('[Profile] Fetching profile for user:', userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('[Profile] Fetch error:', error);
      throw error || new Error('User not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url || undefined,
      birthDate: profile.birth_date,
      zodiacSign: profile.zodiac_sign,
      gender: profile.gender,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  async updateProfile(userId: string, updates: UpdateProfileData) {
    console.log('[Profile] Updating profile for user:', userId);

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('[Profile] Profile update error:', error);
        throw error;
      }
    }

    console.log('[Profile] Profile updated successfully');
  },

  async uploadAvatar(userId: string, uri: string): Promise<string> {
    console.log('[Profile] Uploading avatar for user:', userId);

    try {
      const fileExt = uri.includes('.') ? uri.split('.').pop() : 'jpg';
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      // Android'de fetch/blob bazen sorun çıkarabiliyor.
      // En güvenilir yöntem: Dosyayı base64 oku -> ArrayBuffer'a çevir -> Yükle
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64);

      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, arrayBuffer, {
          upsert: true,
          contentType: contentType,
        });

      if (error) {
        console.error('[Profile] Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(data.path);

      // Update user profile with new avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('[Profile] Upload exception:', error);
      throw error;
    }
  },
};
