import { supabase } from './supabase';
import { useAppStore } from '@/store/useAppStore';
import { Database } from '@/types/supabase';

type WalletRow = Database['public']['Tables']['wallet']['Row'];

export const walletService = {
  async getWallet(userId: string) {
    console.log('[Wallet] Fetching wallet for user:', userId);
    const { data, error }: any = await (supabase
      .from('wallet' as any) as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Wallet] Fetch error:', error);
      throw error;
    }

    if (!data) {
      console.log('[Wallet] No wallet, creating default record');
      const welcomeCredits = useAppStore.getState().appConfig?.welcome_credits ?? 500;
      const { data: newWallet, error: createError }: any = await (supabase
        .from('wallet' as any) as any)
        .insert({
          user_id: userId,
          credits: welcomeCredits,
          diamonds: 0,
        } as any)
        .select()
        .single();

      if (createError) {
        console.error('[Wallet] Create error:', createError);
        throw createError;
      }
      return {
        credits: (newWallet as any).credits,
        diamonds: (newWallet as any).diamonds || 0,
      };
    }

    return {
      credits: (data as any).credits,
      diamonds: (data as any).diamonds || 0,
    };
  },

  async updateCredits(userId: string, amount: number): Promise<void> {
    console.log('[Wallet] Updating credits for user:', userId, 'amount:', amount);
    const { data, error }: any = await (supabase
      .from('wallet' as any) as any)
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error || data === null) {
      console.error('[Wallet] Fetch before update error:', error);
      throw error || new Error('Wallet not found');
    }

    const newCredits = (data as any).credits + amount;
    if (newCredits < 0) {
      throw new Error('Yetersiz kredi');
    }

    const { error: updateError } = await (supabase
      .from('wallet' as any) as any)
      .update({ credits: newCredits, updated_at: new Date().toISOString() } as any)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[Wallet] Update credits error:', updateError);
      throw updateError;
    }

    console.log('[Wallet] Credits updated successfully');
  },

  async getDailyFreeUsageCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count, error }: any = await (supabase
      .from('daily_free_usages' as any) as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('usage_date', today);

    if (error) {
      console.error('[Wallet] Get daily usage error:', error);
      return 0;
    }
    return count || 0;
  },

  async recordDailyFreeUsage(userId: string, fortuneType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await (supabase
      .from('daily_free_usages' as any) as any)
      .insert({
        user_id: userId,
        fortune_type: fortuneType,
        usage_date: today
      } as any);

    if (error) {
      console.error('[Wallet] Record daily usage error:', error);
      throw error;
    }
  },

  async getCreditPackages() {
    const { data, error }: any = await (supabase
      .from('credit_packages' as any) as any)
      .select('id, name, credits, price, active')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('[Wallet] Fetch credit packages error:', error);
      throw error;
    }

    return data || [];
  },

  async getSubscriptionPlans() {
    const { data, error }: any = await (supabase
      .from('subscriptions' as any) as any)
      .select('id, plan_name, cycle, price, perks, status')
      .is('user_id', null)
      .order('price', { ascending: true });

    if (error) {
      console.error('[Wallet] Fetch subscription plans error:', error);
      throw error;
    }

    return data || [];
  },

  async getActiveSubscription(userId: string) {
    const { data, error }: any = await (supabase
      .from('subscriptions' as any) as any)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Wallet] Fetch subscription error:', error);
      return null;
    }

    return data;
  },
};
