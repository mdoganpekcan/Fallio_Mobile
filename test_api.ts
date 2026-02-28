import { Database } from './types/supabase';
import { supabase } from './services/supabase';

// Explicit type extractions
type WalletInsert = Database['public']['Tables']['wallet']['Insert'];
type WalletUpdate = Database['public']['Tables']['wallet']['Update'];
type GetProfileFn = Database['public']['Functions']['get_full_user_profile'];

// Explicit assignments
const testInsert: WalletInsert = { user_id: '123' };

// Direct calls
supabase.from('wallet').insert({ user_id: '123', credits: 10, diamonds: 0 });
supabase.rpc('get_full_user_profile', { p_auth_user_id: '123' });
