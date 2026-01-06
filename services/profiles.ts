import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Database } from '@/types/supabase';

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  async getProfile(userId: string) {
    console.log('[Profile] Fetching profile for user:', userId);
    
    // Fetch from users table and join profiles table
    const { data: user, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', userId)
      .single() as any;

    if (error || !user) {
      console.error('[Profile] Fetch error:', error);
      throw error || new Error('User not found');
    }

    const profileData = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url || undefined,
      birthDate: (user as any).birthdate || (profileData as any)?.birthdate,
      zodiacSign: user.zodiac_sign,
      gender: user.gender || profileData?.gender,
      city: user.city,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      // Extended fields from profiles table
      bio: profileData?.bio,
      job: profileData?.job,
      relationshipStatus: profileData?.relationship_status,
      preferredTellerId: profileData?.preferred_teller_id,
    };
  },

  async updateProfile(userId: string, updates: { user?: UserUpdate, profile?: ProfileUpdate }) {
    console.log('[Profile] Updating profile for user:', userId);

    const promises = [];

    if (updates.user && Object.keys(updates.user).length > 0) {
      promises.push(
        (supabase
          .from('users') as any)
          .update(updates.user)
          .eq('id', userId)
      );
    }

    if (updates.profile && Object.keys(updates.profile).length > 0) {
      promises.push(
        (supabase
          .from('profiles') as any)
          .update(updates.profile)
          .eq('user_id', userId)
      );
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        console.error('[Profile] Update error:', errors);
        throw errors[0];
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

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
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

      // Update user table with new avatar URL
      await this.updateProfile(userId, { user: { avatar_url: publicUrl } });

      return publicUrl;
    } catch (error) {
      console.error('[Profile] Upload exception:', error);
      throw error;
    }
  },
};
