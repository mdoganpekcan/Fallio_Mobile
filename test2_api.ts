import { createClient } from '@supabase/supabase-js';

type DB = {
  public: {
    Tables: {
      wallet: {
        Row: { id: string };
        Insert: { id: string };
        Update: { id: string };
        Relationships: any[];
      }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  }
};

const s = createClient<DB>('...', '...');
s.from('wallet').insert({ id: '1' });
