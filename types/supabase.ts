export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          role: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          role?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string;
          role?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
      };
      ai_settings: {
        Row: {
          id: number;
          base_prompt: string;
          claude_api_key: string | null;
          claude_model: string | null;
          gemini_api_key: string | null;
          gemini_model: string | null;
          openai_api_key: string | null;
          openai_model: string | null;
          updated_at: string;
          active_provider: string | null;
        };
        Insert: {
          id?: number;
          base_prompt?: string;
          claude_api_key?: string | null;
          claude_model?: string | null;
          gemini_api_key?: string | null;
          gemini_model?: string | null;
          openai_api_key?: string | null;
          openai_model?: string | null;
          updated_at?: string;
          active_provider?: string | null;
        };
        Update: {
          id?: number;
          base_prompt?: string;
          claude_api_key?: string | null;
          claude_model?: string | null;
          gemini_api_key?: string | null;
          gemini_model?: string | null;
          openai_api_key?: string | null;
          openai_model?: string | null;
          updated_at?: string;
          active_provider?: string | null;
        };
      };
      app_config: {
        Row: {
          id: number;
          ad_reward_amount: number | null;
          welcome_credits: number | null;
          daily_free_fortune_limit: number | null;
          maintenance_mode: boolean | null;
          contact_email: string | null;
          fortune_costs: Json | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          ad_reward_amount?: number | null;
          welcome_credits?: number | null;
          daily_free_fortune_limit?: number | null;
          maintenance_mode?: boolean | null;
          contact_email?: string | null;
          fortune_costs?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          ad_reward_amount?: number | null;
          welcome_credits?: number | null;
          daily_free_fortune_limit?: number | null;
          maintenance_mode?: boolean | null;
          contact_email?: string | null;
          fortune_costs?: Json | null;
          updated_at?: string | null;
        };
      };
      credit_packages: {
        Row: {
          id: string;
          name: string;
          credits: number;
          price: number;
          active: boolean;
          created_at: string;
          ios_product_id: string | null;
          android_product_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          credits: number;
          price: number;
          active?: boolean;
          created_at?: string;
          ios_product_id?: string | null;
          android_product_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          credits?: number;
          price?: number;
          active?: boolean;
          created_at?: string;
          ios_product_id?: string | null;
          android_product_id?: string | null;
        };
      };
      daily_free_usages: {
        Row: {
          id: string;
          user_id: string | null;
          usage_date: string | null;
          fortune_type: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          usage_date?: string | null;
          fortune_type: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          usage_date?: string | null;
          fortune_type?: string;
          created_at?: string | null;
        };
      };
      earning_rules: {
        Row: {
          id: string;
          title: string;
          type: string;
          diamonds: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: string;
          diamonds: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          diamonds?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      fortune_images: {
        Row: {
          id: string;
          fortune_id: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          fortune_id: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          fortune_id?: string;
          url?: string;
          created_at?: string;
        };
      };
      fortune_tellers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          expertise: string[];
          price: number;
          rating: number;
          is_online: boolean;
          is_ai: boolean;
          created_at: string;
          ai_provider: string | null;
          ai_model: string | null;
          is_active: boolean | null;
          total_ratings: number | null;
          credit_price: number | null;
          views: number | null;
          description: string | null;
          price_credits: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          expertise?: string[];
          price?: number;
          rating?: number;
          is_online?: boolean;
          is_ai?: boolean;
          created_at?: string;
          ai_provider?: string | null;
          ai_model?: string | null;
          is_active?: boolean | null;
          total_ratings?: number | null;
          credit_price?: number | null;
          views?: number | null;
          description?: string | null;
          price_credits?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          expertise?: string[];
          price?: number;
          rating?: number;
          is_online?: boolean;
          is_ai?: boolean;
          created_at?: string;
          ai_provider?: string | null;
          ai_model?: string | null;
          is_active?: boolean | null;
          total_ratings?: number | null;
          credit_price?: number | null;
          views?: number | null;
          description?: string | null;
          price_credits?: number | null;
        };
      };
      fortunes: {
        Row: {
          id: string;
          user_id: string;
          teller_id: string | null;
          type: string;
          status: string;
          user_note: string | null;
          response: string | null;
          created_at: string;
          completed_at: string | null;
          is_read: boolean;
          user_rating: number | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          teller_id?: string | null;
          type: string;
          status?: string;
          user_note?: string | null;
          response?: string | null;
          created_at?: string;
          completed_at?: string | null;
          is_read?: boolean;
          user_rating?: number | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          teller_id?: string | null;
          type?: string;
          status?: string;
          user_note?: string | null;
          response?: string | null;
          created_at?: string;
          completed_at?: string | null;
          is_read?: boolean;
          user_rating?: number | null;
          metadata?: Json | null;
        };
      };
      horoscopes: {
        Row: {
          id: string;
          sign: string;
          scope: string;
          love: string | null;
          money: string | null;
          health: string | null;
          general: string | null;
          effective_date: string;
          updated_at: string;
          language: string | null;
        };
        Insert: {
          id?: string;
          sign: string;
          scope: string;
          love?: string | null;
          money?: string | null;
          health?: string | null;
          general?: string | null;
          effective_date?: string;
          updated_at?: string;
          language?: string | null;
        };
        Update: {
          id?: string;
          sign?: string;
          scope?: string;
          love?: string | null;
          money?: string | null;
          health?: string | null;
          general?: string | null;
          effective_date?: string;
          updated_at?: string;
          language?: string | null;
        };
      };
      logs: {
        Row: {
          id: number;
          actor_admin_id: string | null;
          action: string;
          entity: string | null;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          actor_admin_id?: string | null;
          action: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          actor_admin_id?: string | null;
          action?: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          fortune_id: string;
          sender_type: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          fortune_id: string;
          sender_type: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          fortune_id?: string;
          sender_type?: string;
          body?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: string | null;
          segment: string | null;
          title: string;
          message: string;
          status: string;
          created_at: string;
          sent_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          segment?: string | null;
          title: string;
          message: string;
          status?: string;
          created_at?: string;
          sent_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: never;
          user_id?: string | null;
          segment?: string | null;
          title?: string;
          message?: string;
          status?: string;
          created_at?: string;
          sent_at?: string | null;
          created_by?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          birth_date: string | null;
          gender: string | null;
          bio: string | null;
          preferred_teller_id: string | null;
          last_login: string | null;
          job: string | null;
          relationship_status: string | null;
          email: string | null;
          birthdate: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          birth_date?: string | null;
          gender?: string | null;
          bio?: string | null;
          preferred_teller_id?: string | null;
          last_login?: string | null;
          job?: string | null;
          relationship_status?: string | null;
          email?: string | null;
          birthdate?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          birth_date?: string | null;
          gender?: string | null;
          bio?: string | null;
          preferred_teller_id?: string | null;
          last_login?: string | null;
          job?: string | null;
          relationship_status?: string | null;
          email?: string | null;
          birthdate?: string | null;
        };
      };
      settings: {
        Row: {
          id: number;
          theme: string;
          ai_enabled: boolean;
          support_email: string;
          instagram: string | null;
          twitter: string | null;
          facebook: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          theme?: string;
          ai_enabled?: boolean;
          support_email: string;
          instagram?: string | null;
          twitter?: string | null;
          facebook?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          theme?: string;
          ai_enabled?: boolean;
          support_email?: string;
          instagram?: string | null;
          twitter?: string | null;
          facebook?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          plan_name: string;
          cycle: string;
          status: string;
          price: number;
          perks: string[];
          started_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_name: string;
          cycle?: string;
          status?: string;
          price?: number;
          perks?: string[];
          started_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          plan_name?: string;
          cycle?: string;
          status?: string;
          price?: number;
          perks?: string[];
          started_at?: string;
          expires_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          package_id: string | null;
          amount: number;
          currency: string | null;
          credits_amount: number;
          transaction_type: string;
          provider: string | null;
          provider_transaction_id: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id?: string | null;
          amount?: number;
          currency?: string | null;
          credits_amount?: number;
          transaction_type: string;
          provider?: string | null;
          provider_transaction_id?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string | null;
          amount?: number;
          currency?: string | null;
          credits_amount?: number;
          transaction_type?: string;
          provider?: string | null;
          provider_transaction_id?: string | null;
          status?: string | null;
          created_at?: string;
        };
      };
      user_devices: {
        Row: {
          id: string;
          user_id: string;
          push_token: string;
          platform: string | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          push_token: string;
          platform?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          push_token?: string;
          platform?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string | null;
          zodiac_sign: string | null;
          avatar_url: string | null;
          city: string | null;
          status: string;
          created_at: string;
          birth_date: string | null;
          gender: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          full_name?: string | null;
          zodiac_sign?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          status?: string;
          created_at?: string;
          birth_date?: string | null;
          gender?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string;
          full_name?: string | null;
          zodiac_sign?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          status?: string;
          created_at?: string;
          birth_date?: string | null;
          gender?: string | null;
          updated_at?: string | null;
        };
      };
      wallet: {
        Row: {
          id: string;
          user_id: string;
          credits: number;
          diamonds: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credits?: number;
          diamonds?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credits?: number;
          diamonds?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_fortune_secure: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_teller_id: string | null;
          p_note: string | undefined;
          p_metadata: Json;
          p_images: string[];
        };
        Returns: {
          id: string;
          cost: number;
          is_free: boolean;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
