import { supabase } from './supabase';

export interface UpdateProfileData {
  fullName?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  zodiacSign?: string;
  bio?: string;
  job?: string;
  relationshipStatus?: string;
}

export const profileService = {
  async getProfile(userId: string) {
    console.log('[Profile] Fetching profile for user:', userId);
    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userRow) {
      console.error('[Profile] Fetch error:', error);
      throw error || new Error('User not found');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.full_name,
      avatarUrl: userRow.avatar_url,
      birthDate: profile?.birthdate || '',
      zodiacSign: userRow.zodiac_sign,
      gender: profile?.gender || 'other',
      bio: profile?.bio,
      job: profile?.job,
      relationshipStatus: profile?.relationship_status,
      createdAt: userRow.created_at,
      updatedAt: profile?.updated_at,
    };
  },

  async updateProfile(userId: string, updates: UpdateProfileData) {
    console.log('[Profile] Updating profile for user:', userId);

    const userUpdate: any = {};
    const profileUpdate: any = {};

    if (updates.fullName) userUpdate.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) userUpdate.avatar_url = updates.avatarUrl;
    if (updates.zodiacSign) userUpdate.zodiac_sign = updates.zodiacSign;

    if (updates.birthDate) profileUpdate.birthdate = updates.birthDate;
    if (updates.gender) profileUpdate.gender = updates.gender;
    if (updates.bio !== undefined) profileUpdate.bio = updates.bio;
    if (updates.job !== undefined) profileUpdate.job = updates.job;
    if (updates.relationshipStatus !== undefined) profileUpdate.relationship_status = updates.relationshipStatus;

    if (Object.keys(userUpdate).length > 0) {
      const { error } = await supabase.from('users').update(userUpdate).eq('id', userId);
      if (error) {
        console.error('[Profile] User update error:', error);
        throw error;
      }
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase.from('profiles').update(profileUpdate).eq('user_id', userId);
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

      // Use fetch to get the blob from the URI (more reliable than FormData on Android)
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        });

      if (error) {
        console.error('[Profile] Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(data.path);

      // Update user profile with new avatar URL
      await this.updateProfile(userId, { avatarUrl: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('[Profile] Upload exception:', error);
      throw error;
    }
  },
};
