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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];
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
      create_user_record: {
        Args: { p_auth_user_id: string; p_email: string; p_full_name: string; p_avatar_url: string; p_zodiac_sign: string; p_birth_date: string | null; p_gender: string | null; };
        Returns: { id: string; };
      };
      delete_user_account: {
        Args: Record<string, never>;
        Returns: null;
      };
      get_full_user_profile: {
        Args: { p_auth_user_id: string; };
        Returns: Json;
      };
      create_transaction: {
        Args: { p_user_id: string; p_amount: number; p_transaction_type: string; };
        Returns: Json;
      };
      increment_user_balance: {
        Args: { p_user_id: string; p_diamonds_qty?: number; p_rate?: number; };
        Returns: Json;
      };
      decrement_user_balance: {
        Args: { p_user_id: string; p_amount: number; };
        Returns: Json;
      };
      increment_fortune_teller_views: {
        Args: { p_teller_id: string; };
        Returns: null;
      };
      check_daily_free_usage: {
        Args: { p_user_id: string; p_fortune_type: string; };
        Returns: boolean;
      };
      handle_credit_transaction: {
        Args: { p_user_id: string; p_amount: number; p_transaction_type: string; };
        Returns: Json;
      };
      handle_diamond_transaction: {
        Args: { p_user_id: string; p_amount: number; p_transaction_type: string; };
        Returns: Json;
      };
      exchange_diamonds_for_credits: {
        Args: { p_user_id: string; p_diamonds_qty: number; p_rate: number; };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
