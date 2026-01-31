import { Alert } from 'react-native';
import { logger } from './logger';
import { supabase } from './supabase';
import { User, calculateZodiacSign } from '@/types';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Database } from '@/types/supabase';

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
    console.log('[Auth] Ensuring user records for AuthID:', authUser.id);

    const zodiacSign = extra?.birthDate ? calculateZodiacSign(extra.birthDate) : null;

    // 1. Check if public user exists linked to this Auth ID
    let publicUserId: string | null = null;
    
    // First try to find by auth_user_id
    const { data: existingUser } = await (supabase
        .from('users' as any) as any)
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();
    
    if (existingUser) {
        publicUserId = existingUser.id;
        console.log('[Auth] Found existing public user ID:', publicUserId);
    } else {
        // Try to find by email if auth_id link is missing (legacy support)
        if (authUser.email) {
            const { data: emailUser } = await (supabase
                .from('users' as any) as any)
                .select('id')
                .eq('email', authUser.email)
                .single();
            
            if (emailUser) {
                publicUserId = emailUser.id;
                console.log('[Auth] Found existing public user by Email:', publicUserId);
                // Link it now
                await (supabase.from('users' as any) as any)
                    .update({ auth_user_id: authUser.id })
                    .eq('id', publicUserId);
            }
        }
    }

    // 2. If no public user found, create one
    if (!publicUserId) {
        console.log('[Auth] No public user found, creating new record...');
        try {
            // First try RPC if available
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_record', {
                p_auth_user_id: authUser.id,
                p_email: authUser.email || '',
                p_full_name: extra?.fullName || '',
                p_avatar_url: extra?.avatarUrl || '',
                p_zodiac_sign: zodiacSign || '',
                p_birth_date: extra?.birthDate || null,
                p_gender: extra?.gender || null
            } as any);

            if (!rpcError && rpcData) {
                publicUserId = (rpcData as any).id;
            } else {
                console.log('[Auth] RPC failed/missing, falling back to direct INSERT.');
                // Helper to insert directly
                const { data: insertedUser, error: insertError } = await (supabase.from('users' as any) as any)
                    .insert({
                        auth_user_id: authUser.id,
                        email: authUser.email,
                        full_name: extra?.fullName,
                        zodiac_sign: zodiacSign,
                        birthdate: extra?.birthDate,
                        gender: extra?.gender,
                        avatar_url: extra?.avatarUrl,
                        status: 'active'
                    })
                    .select('id')
                    .single();
                
                if (insertError) throw insertError;
                publicUserId = insertedUser.id;
            }
        } catch (e: any) {
            console.error('[Auth] Failed to create public user:', e);
            throw new Error(`Kullanıcı oluşturulamadı: ${e.message}`);
        }
    }

    if (!publicUserId) throw new Error('Public User ID could not be determined.');

    // 3. Ensure Profile Exists (using publicUserId)
    const profileData: any = {
        user_id: publicUserId, // Using the correct foreign key
        email: authUser.email,
    };
    // Sync only if provided to avoid overwriting with nulls
    if (extra?.birthDate) profileData.birthdate = extra.birthDate;
    if (extra?.gender) profileData.gender = extra.gender;
    if (extra?.fullName) profileData.full_name = extra.fullName;
    if (extra?.avatarUrl) profileData.avatar_url = extra.avatarUrl;
    if (zodiacSign) profileData.zodiac_sign = zodiacSign;

    // We need to upsert. The profiles table has `id` PK (random) and `user_id` unique FK.
    // We should upsert based on `user_id`. But Supabase upsert requires ON CONFLICT column.
    // Ensure `user_id` has a unique constraint in DB (Schema says: user_id uuid NOT NULL UNIQUE).
    await (supabase.from('profiles' as any) as any)
        .upsert(profileData, { onConflict: 'user_id' });

    // 4. Return full user object
    return this.getUser();
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
      options: {
        emailRedirectTo: 'https://fallio-web.vercel.app/auth/verified',
      },
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
      redirectTo: 'fallio://auth/reset-password',
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
      // Fetch from users table and join profiles to get complete picture
      // This solves the issue where data might be in users but not caught by profile-only query
      const { data: userData, error: fetchError } = await (supabase
        .from('users' as any) as any)
        .select('*, profiles(*)')
        .eq('id', user.id)
        .single();

      if (fetchError || !userData) {
        console.log('[Auth] User record not found in public table, checking/creating...');
        // Fallback to ensure records exist
        await this.ensureUserRecords({ id: user.id, email: user.email }, extraData);
        // Retry fetch
        const { data: retryData } = await (supabase
          .from('users' as any) as any)
          .select('*, profiles(*)')
          .eq('id', user.id)
          .single();
        
        if (!retryData) return null;
        return this.mapUserRecord(retryData);
      } else if (extraData && Object.keys(extraData).length > 0) {
        console.log('[Auth] Updating existing profile with extra data...');
        await this.updateProfile(user.id, extraData);
        // Re-fetch to get updated data
        const { data: updatedData } = await (supabase
          .from('users' as any) as any)
          .select('*, profiles(*)')
          .eq('id', user.id)
          .single();
        return this.mapUserRecord(updatedData);
      }

      return this.mapUserRecord(userData);
    } catch (error) {
      console.error('[Auth] Get user fetch error:', error);
      return null;
    }
  },

  // Helper to map DB response to User type
  mapUserRecord(userData: any): User {
    const profileData = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
    
    // Check both tables for critical fields
    const birthDate = userData.birthdate || userData.birth_date || 
                     profileData?.birthdate || profileData?.birth_date || '';
                     
    const gender = userData.gender || profileData?.gender || 'other';

    const wallet = userData.wallet || {}; // Wallet might need specific join if not in users/profiles

    return {
      id: userData.id,
      email: userData.email || '',
      name: userData.full_name || profileData?.full_name || '',
      photoUrl: userData.avatar_url || profileData?.avatar_url || undefined,
      birthDate: birthDate,
      zodiacSign: userData.zodiac_sign || profileData?.zodiac_sign || '',
      gender: gender as any,
      credits: (wallet as any)?.credits || 0, // Note: this assumes wallet join logic if needed later
      isPremium: !!(wallet as any)?.subscription_type,
      createdAt: userData.created_at || new Date().toISOString(),
    };
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
              const data: any = await response.json();
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
    console.log('[Auth] Sign in with Google via Vercel Callback');

    // Web tabanlı yönlendirme kullanıyoruz (Vercel)
    // Web tabanlı yönlendirme (Supabase için)
    const supabaseRedirectUrl = 'https://fallio-web.vercel.app/auth/callback';
    
    // Mobil uygulama şema yönlendirmesi (AuthSession için)
    // Bu URL, web sayfasının en son yönlendireceği adrestir (fallio://auth/callback)
    const deepLinkUrl = Linking.createURL('/auth/callback') || 'fallio://auth/callback';

    console.log('[Auth] Supabase Redirect:', supabaseRedirectUrl);
    console.log('[Auth] Deep Link (Expected Return):', deepLinkUrl);

    // URL işleme fonksiyonu
    const handleAuthUrl = async (url: string) => {
        try {
            if (!url) return;
            
            logger.info('Processing deep link', { url });
            // FIXME: Debug sonrası kaldırılacak
            Alert.alert('Debug: Link Geldi', url.substring(0, 50) + '...'); 

            // Parsing logic
            const parsed = Linking.parse(url);
            const { queryParams } = parsed;
            
            // SAFER PARSING: Handle missing '?' safely
            const queryString = url.includes('?') ? url.split('?')[1] : '';
            const code = queryParams?.code || new URLSearchParams(queryString).get('code');
            
            if (code && typeof code === 'string') {
                Alert.alert('Debug', 'Code Detected!');
                logger.info('Detected auth code, exchanging for session...');

                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    Alert.alert('Debug Error (Code)', error.message);
                    logger.error('Exchange Code Failed', { error });
                } else {
                    Alert.alert('Debug Success', 'Code Exchanged!');
                    logger.info('Session exchanged successfully');
                }
                return;
            }

            const hashIndex = url.indexOf('#');
            if (hashIndex > -1) {
                const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
                const access_token = hashParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token');

                if (access_token && refresh_token) {
                    logger.info('Setting session from deep link (Tokens)...');
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });
                    if (error) {
                        Alert.alert('Debug Error (Token)', error.message);
                        logger.error('Set Session Failed', { error });
                    }
                    else {
                        Alert.alert('Debug Success', 'Token Session Set!');
                        logger.info('Session set successfully from tokens');
                    }
                } else {
                    Alert.alert('Debug Fail', 'Hash var ama token yok');
                    logger.warn('Hash present but missing tokens', { url });
                }
            } else {
                Alert.alert('Debug Fail', 'URL içinde # sembolü yok');
                logger.warn('No hash or code found', { url });
            }
        } catch (e: any) {
            console.error('[Auth] Deep Link Crash:', e);
            logger.critical('Deep Link CRASH detected', { error: e.message, stack: e.stack });
            Alert.alert('CRITICAL ERROR', e.message || JSON.stringify(e));
        }
    };

    try {
      // 1. Dışarıdan gelen linkleri dinle (Yedek mekanizma)
      const linkingSubmission = Linking.addEventListener('url', (event) => {
        if (event.url.includes('auth/callback')) {
            handleAuthUrl(event.url);
        }
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: supabaseRedirectUrl,
          skipBrowserRedirect: true,
          scopes: 'https://www.googleapis.com/auth/user.birthday.read'
        },
      });
  
      if (error) throw error;
  
      if (data?.url) {
        // 2. AuthSession başlat
        const result = await WebBrowser.openAuthSessionAsync(data.url, deepLinkUrl);
        
        // Android'de bazen result.type 'success' dönmeyebilir ama link açılmış olabilir.
        if (result.type === 'success' && result.url) {
            await handleAuthUrl(result.url);
        }
      }

      // Listener'ı temizle (kısa bir gecikme ile, belki olay geç düşer)
      setTimeout(() => {
        linkingSubmission.remove();
      }, 5000);

      return data;
    } catch (e) {
      console.error('[Auth] Sign in flow error:', e);
      throw e;
    }
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

    const profileUpdates: any = {};
    if (updates.birthDate) {
      profileUpdates.birthdate = updates.birthDate;
    }
    if (updates.gender) profileUpdates.gender = updates.gender;
    if (updates.fullName) profileUpdates.full_name = updates.fullName;
    if (updates.avatarUrl) profileUpdates.avatar_url = updates.avatarUrl;
    if (zodiacSign) profileUpdates.zodiac_sign = zodiacSign;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await (supabase
        .from('profiles' as any) as any)
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    return this.getUser();
  },
};
