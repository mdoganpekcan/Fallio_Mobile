import { supabase } from './supabase';
import { AppConfig } from '@/types';

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
