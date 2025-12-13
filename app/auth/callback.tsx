import { useEffect } from 'react';
import { Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/auth';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Supabase handles the session automatically when the deep link is opened.
    // We just need to check if we have a user and ensure records exist.
    
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Ensure public.users record exists
          await authService.ensureUserRecords({ 
            id: session.user.id, 
            email: session.user.email 
          }, {
            fullName: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
          
          router.replace('/(tabs)');
        } catch (e) {
          console.error('Error ensuring user records:', e);
          // Even if this fails, we might want to let them in or show an error
          router.replace('/(tabs)'); 
        }
      } else {
        router.replace('/auth/login');
      }
    };

    handleAuth();
  }, []);

  return <Text>Giriş yapılıyor...</Text>;
}
