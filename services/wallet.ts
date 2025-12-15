import { supabase } from './supabase';
import { useAppStore } from '@/store/useAppStore';

export const walletService = {
  async getWallet(userId: string) {
    console.log('[Wallet] Fetching wallet for user:', userId);
    const { data, error } = await supabase
      .from('wallet')
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
      const { data: newWallet, error: createError } = await supabase
        .from('wallet')
        .insert({
          user_id: userId,
          credits: welcomeCredits,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Wallet] Create error:', createError);
        throw createError;
      }
      return {
        credits: newWallet.credits,
      };
    }

    return {
      credits: data.credits,
    };
  },

  async updateCredits(userId: string, amount: number): Promise<void> {
    console.log('[Wallet] Updating credits for user:', userId, 'amount:', amount);
    const { data, error } = await supabase
      .from('wallet')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error || data === null) {
      console.error('[Wallet] Fetch before update error:', error);
      throw error || new Error('Wallet not found');
    }

    const newCredits = data.credits + amount;
    if (newCredits < 0) {
      throw new Error('Yetersiz kredi');
    }

    const { error: updateError } = await supabase
      .from('wallet')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[Wallet] Update credits error:', updateError);
      throw updateError;
    }

    console.log('[Wallet] Credits updated successfully');
  },

  async getCreditPackages() {
    const { data, error } = await supabase
      .from('credit_packages')
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
    const { data, error } = await supabase
      .from('subscriptions')
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
    const { data, error } = await supabase
      .from('subscriptions')
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
