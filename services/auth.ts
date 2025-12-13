import { supabase } from './supabase';
import { User, calculateZodiacSign } from '@/types';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  avatarUrl?: string;
}

export const authService = {
  async ensureUserRecords(authUser: { id: string; email?: string | null }, extra?: Partial<RegisterData>) {
    // Use RPC to create user records securely (bypassing RLS)
    console.log('[Auth] Creating user records via RPC...');
    
    const zodiacSign = extra?.birthDate ? calculateZodiacSign(extra.birthDate) : null;

    const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_record', {
      p_auth_user_id: authUser.id,
      p_email: authUser.email || '',
      p_full_name: extra?.fullName || '',
      p_avatar_url: extra?.avatarUrl || '',
      p_zodiac_sign: zodiacSign || '',
      p_birth_date: extra?.birthDate || null,
      p_gender: extra?.gender || null
    });

    if (rpcError) {
      console.error('[Auth] RPC create_user_record failed:', rpcError);
      
      // If RPC failed, it might be because the user already exists (e.g. created by trigger).
      // We should try to UPDATE the existing profile with the extra data we have.
      if (extra) {
         try {
            // 1. Get the user ID from auth_user_id
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', authUser.id)
              .maybeSingle();

            if (existingUser) {
               console.log('[Auth] Updating existing user profile with extra data...');
               // Update profiles table
               await supabase.from('profiles').update({
                  birthdate: extra.birthDate || null,
                  gender: extra.gender || null,
                  // If we have other fields like bio, job etc.
               }).eq('user_id', existingUser.id);

               // Update users table (zodiac_sign, full_name, avatar_url)
               const userUpdates: any = {};
               if (extra.fullName) userUpdates.full_name = extra.fullName;
               if (extra.avatarUrl) userUpdates.avatar_url = extra.avatarUrl;
               if (zodiacSign) userUpdates.zodiac_sign = zodiacSign;

               if (Object.keys(userUpdates).length > 0) {
                  await supabase.from('users').update(userUpdates).eq('id', existingUser.id);
               }
               
               // Return the updated user
               const { data: updatedUser } = await supabase
                 .from('users')
                 .select('*')
                 .eq('id', existingUser.id)
                 .single();
                 
               if (updatedUser) return updatedUser;
            }
         } catch (updateError) {
            console.error('[Auth] Failed to update existing profile:', updateError);
         }
      }

      // Fallback: just return what we have
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();
        
      if (existingUser) return existingUser;
      
      throw new Error(`User creation failed: ${rpcError.message}`);
    }

    // Fetch the created user to return it
    const { data: newUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', rpcData.id)
        .single();

    if (fetchError) {
      // RLS politikaları veya oturum durumu nedeniyle kullanıcı okunamıyor olabilir.
      // Bu bir hata değil, sadece veriyi geri döndüremediğimiz anlamına gelir.
      console.log('[Auth] User created but could not be fetched (likely due to RLS/Email Confirmation):', fetchError.message);
      // Fallback userRow object matching 'users' table structure
      return { 
        id: rpcData.id, 
        email: authUser.email || '',
        full_name: extra?.fullName || '',
        avatar_url: extra?.avatarUrl || null,
        zodiac_sign: zodiacSign || null,
        created_at: new Date().toISOString()
      };
    }
    return newUser;
  },

  async signIn(email: string, password: string) {
    console.log('[Auth] Signing in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }

    console.log('[Auth] Sign in successful');
    return data;
  },

  async signUp(registerData: RegisterData) {
    console.log('[Auth] Signing up:', registerData.email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
    });

    if (authError) {
      console.error('[Auth] Sign up error:', authError);
      throw authError;
    }

    // Bazı projelerde e-posta doğrulaması nedeniyle session dönmez; user'ı yeniden çekelim
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = authData.user?.id || currentUser.user?.id;

    if (!userId) {
      throw new Error('Kullanıcı oluşturulamadı (auth.users kaydı bulunamadı)');
    }

    await this.ensureUserRecords(
      { id: userId, email: registerData.email },
      registerData
    );

    console.log('[Auth] Sign up successful');
    return authData;
  },

  async signOut() {
    console.log('[Auth] Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Sign out error:', error);
      throw error;
    }
    console.log('[Auth] Sign out successful');
  },

  async resetPassword(email: string) {
    console.log('[Auth] Resetting password for:', email);
    // Use the scheme defined in app.json
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'rork-app://auth/reset-password',
    });

    if (error) {
      console.error('[Auth] Reset password error:', error);
      throw error;
    }

    console.log('[Auth] Reset password email sent');
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Auth] Get session error:', error);
      return null;
    }
    return data.session;
  },

  async getUser(extraData?: Partial<RegisterData>): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const userRow = await this.ensureUserRecords({ id: user.id, email: user.email }, extraData);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userRow.id)
        .maybeSingle();

      const { data: wallet } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', userRow.id)
        .maybeSingle();

      return {
        id: userRow.id,
        email: userRow.email,
        name: userRow.full_name,
        photoUrl: userRow.avatar_url,
        birthDate: profile?.birthdate || '',
        zodiacSign: userRow.zodiac_sign || '',
        gender: profile?.gender || 'other',
        credits: wallet?.credits || 0,
        isPremium: false,
        createdAt: userRow.created_at,
      };
    } catch (error) {
      console.error('[Auth] Get user fetch error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event);
      if (session?.user) {
        let extraData: Partial<RegisterData> | undefined;

        // Try to fetch Google Birthdate if provider token is available
        // Note: provider_token is only available if configured in Supabase and requested in scopes
        const providerToken = (session as any).provider_token;
        if (providerToken && session.user.app_metadata.provider === 'google') {
           try {
             console.log('[Auth] Attempting to fetch Google People data...');
             const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
               headers: {
                 Authorization: `Bearer ${providerToken}`
               }
             });
             
             if (response.ok) {
               const data = await response.json();
               const birthday = data.birthdays?.find((b: any) => b.date);
               if (birthday && birthday.date) {
                 const { year, month, day } = birthday.date;
                 if (year && month && day) {
                   const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   console.log('[Auth] Found Google birthdate:', birthDate);
                   extraData = { birthDate };
                 }
               }
             }
           } catch (e) {
             console.error('[Auth] Failed to fetch Google birthdate:', e);
           }
        }

        const user = await this.getUser(extraData);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  async signInWithGoogle(redirectTo?: string) {
    console.log('[Auth] Sign in with Google');
    
    // Use the correct scheme for production/development
    // For Expo Go: exp://...
    // For Production: falioapp://...
    const redirectUrl = Linking.createURL('/auth/callback');
    console.log('[Auth] Redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        scopes: 'https://www.googleapis.com/auth/user.birthday.read'
      },
    });

    if (error) {
      console.error('[Auth] Google sign-in error:', error);
      throw error;
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        // Parse the URL to get the access_token and refresh_token
        // Supabase handles the session automatically if the URL is passed back correctly,
        // but sometimes we need to manually set the session if deep linking is tricky.
        // However, usually just opening the URL is enough if the redirect goes back to the app.
      }
    }
    return data;
  },



  async deleteAccount() {
    console.log('[Auth] Deleting account...');
    // Call the RPC function to delete the user account
    const { error } = await supabase.rpc('delete_user_account');
    
    if (error) {
      console.error('[Auth] Delete account error:', error);
      throw error;
    }
    
    // Sign out after deletion
    await this.signOut();
  },

  async updateProfile(userId: string, updates: Partial<RegisterData>) {
    console.log('[Auth] Updating profile for:', userId);
    
    const zodiacSign = updates.birthDate ? calculateZodiacSign(updates.birthDate) : null;

    // Update profiles table
    const profileUpdates: any = {};
    if (updates.birthDate) profileUpdates.birth_date = updates.birthDate;
    if (updates.gender) profileUpdates.gender = updates.gender;

    if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('user_id', userId);
            
        if (profileError) throw profileError;
    }

    // Update users table
    const userUpdates: any = {};
    if (updates.fullName) userUpdates.full_name = updates.fullName;
    if (updates.avatarUrl) userUpdates.avatar_url = updates.avatarUrl;
    if (zodiacSign) userUpdates.zodiac_sign = zodiacSign;

    if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
            .from('users')
            .update(userUpdates)
            .eq('id', userId);

        if (userError) throw userError;
    }
    
    return this.getUser();
  },
};
