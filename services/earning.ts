import { supabase } from './supabase';
import { Database } from '@/types/supabase';
import { walletService } from './wallet';

export type EarningRule = Database['public']['Tables']['earning_rules']['Row'];

export const earningService = {
  /**
   * Fetch active earning rules (daily login, ad watch, etc.)
   */
  async getEarningRules(): Promise<EarningRule[]> {
    const { data, error } = await supabase
      .from('earning_rules')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('[Earning] Fetch rules error:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Check if user is eligible for daily reward
   */
  async checkDailyRewardEligibility(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    // Using a custom metadata or a separate table if available, 
    // but for now let's check logs or a 'daily_checkins' metadata in profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('last_login')
      .eq('user_id', userId)
      .single();

    if (error || !data?.last_login) return true;

    const lastLoginDate = new Date(data.last_login).toISOString().split('T')[0];
    return lastLoginDate !== today;
  },

  /**
   * Claim reward for an action (e.g., 'daily_login', 'watch_ad')
   */
  async claimReward(userId: string, ruleType: string): Promise<{ success: boolean; amount: number }> {
    console.log('[Earning] Claiming reward for:', ruleType);
    
    // 1. Get the rule
    const { data: rule, error: ruleError } = await supabase
      .from('earning_rules')
      .select('*')
      .eq('type', ruleType)
      .eq('active', true)
      .single();

    if (ruleError || !rule) {
      throw new Error('Ödül kuralı bulunamadı');
    }

    // 2. Perform the update in wallet (Atomically)
    // In a real app, this should be a stored procedure (RPC) for security
    const { data: wallet, error: walletFetchError } = await supabase
      .from('wallet')
      .select('diamonds')
      .eq('user_id', userId)
      .single();

    if (walletFetchError) throw walletFetchError;

    const newDiamonds = (wallet?.diamonds || 0) + rule.diamonds;

    const { error: updateError } = await supabase
      .from('wallet')
      .update({ 
        diamonds: newDiamonds, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 3. Update last_login to today if it's daily reward
    if (ruleType === 'daily_login') {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    }

    // 4. Record transaction (optional but better for logs)
    return { success: true, amount: rule.diamonds };
  },

  /**
   * Exchange Diamonds for Credits
   * Rate: 10 Diamonds = 1 Credit (Adjust as needed)
   */
  async exchangeDiamondsToCredits(userId: string, diamondsQty: number): Promise<void> {
    const rate = 10; // 10 diamonds = 1 credit
    if (diamondsQty % rate !== 0) throw new Error(`Elmas miktarı ${rate}'un katı olmalıdır.`);

    const creditsToGain = diamondsQty / rate;

    // This should ideally be a safe RPC call
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('diamonds, credits')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) throw new Error('Cüzdan bulunamadı');

    if (wallet.diamonds < diamondsQty) throw new Error('Yetersiz elmas');

    const { error: updateError } = await supabase
      .from('wallet')
      .update({
        diamonds: wallet.diamonds - diamondsQty,
        credits: wallet.credits + creditsToGain,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  }
};
