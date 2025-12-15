import { supabase } from './supabase';

export interface AppConfig {
  id: number;
  ad_reward_amount: number;
  welcome_credits: number;
  daily_free_fortune_limit: number;
  maintenance_mode: boolean;
  contact_email: string;
  fortune_costs: Record<string, number>;
}

export const configService = {
  async getAppConfig(): Promise<AppConfig | null> {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .single();

    if (error) {
      console.error('[Config] Error fetching app config:', error);
      return null;
    }

    return data as AppConfig;
  },
};
