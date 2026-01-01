import { supabase } from "./supabase";
import { useAppStore } from "@/store/useAppStore";
import { Database } from "@/types/supabase";

type WalletRow = Database["public"]["Tables"]["wallet"]["Row"];

export const walletService = {
  async getWallet(userId: string) {
    console.log("[Wallet] Fetching wallet for user:", userId);
    const { data, error }: any = await (supabase.from("wallet" as any) as any)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Wallet] Fetch error:", error);
      throw error;
    }

    if (!data) {
      console.log("[Wallet] No wallet, creating default record");
      const welcomeCredits =
        useAppStore.getState().appConfig?.welcome_credits ?? 500;
      const { data: newWallet, error: createError }: any = await (
        supabase.from("wallet" as any) as any
      )
        .insert({
          user_id: userId,
          credits: welcomeCredits,
          diamonds: 0,
        } as any)
        .select()
        .single();

      if (createError) {
        console.error("[Wallet] Create error:", createError);
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

  async updateCredits(
    userId: string,
    amount: number,
    transactionType: string = "adjustment"
  ): Promise<number> {
    console.log(
      "[Wallet] Updating credits via RPC:",
      userId,
      "amount:",
      amount
    );

    const { data, error } = await supabase.rpc("handle_credit_transaction", {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: transactionType,
    });

    if (error) {
      console.error("[Wallet] RPC Transaction error:", error);
      if (error.message.includes("INSUFFICIENT_CREDITS")) {
        throw new Error("Yetersiz kredi");
      }
      throw error;
    }

    // RPC returns the new balance
    const newBalance = data?.[0]?.new_balance ?? 0;
    console.log("[Wallet] Transaction successful. New balance:", newBalance);
    return newBalance;
  },

  async updateDiamonds(userId: string, amount: number, transactionType: string = 'diamond_reward'): Promise<number> {
    console.log('[Wallet] Updating diamonds via RPC:', userId, 'amount:', amount);
    
    const { data, error } = await supabase.rpc('handle_diamond_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: transactionType
    });

    if (error) {
      console.error('[Wallet] Diamond Transaction error:', error);
      if (error.message.includes('INSUFFICIENT_DIAMONDS')) {
        throw new Error('Yetersiz elmas');
      }
      throw error;
    }

    const newBalance = data?.[0]?.new_diamonds ?? 0;
    console.log('[Wallet] Diamond transaction successful. New balance:', newBalance);
    return newBalance;
  },

  async exchangeDiamonds(userId: string, diamondsQty: number, rate: number = 10): Promise<{ diamonds: number; credits: number }> {
    console.log('[Wallet] Exchanging diamonds for credits via RPC:', userId, 'qty:', diamondsQty);
    
    const { data, error } = await supabase.rpc('exchange_diamonds_for_credits', {
      p_user_id: userId,
      p_diamonds_qty: diamondsQty,
      p_rate: rate
    });

    if (error) {
      console.error('[Wallet] Exchange error:', error);
      if (error.message.includes('INSUFFICIENT_DIAMONDS')) {
        throw new Error('Yetersiz elmas');
      } else if (error.message.includes('INVALID_QUANTITY')) {
        throw new Error(`Miktar ${rate}'un katı olmalıdır.`);
      }
      throw error;
    }

    const { new_diamonds, new_credits } = data?.[0] || { new_diamonds: 0, new_credits: 0 };
    console.log('[Wallet] Exchange successful. New diamonds:', new_diamonds, 'New credits:', new_credits);
    return { diamonds: new_diamonds, credits: new_credits };
  },

  async getDailyFreeUsageCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const { count, error }: any = await (
      supabase.from("daily_free_usages" as any) as any
    )
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("usage_date", today);

    if (error) {
      console.error("[Wallet] Get daily usage error:", error);
      return 0;
    }
    return count || 0;
  },

  async recordDailyFreeUsage(
    userId: string,
    fortuneType: string
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await (
      supabase.from("daily_free_usages" as any) as any
    ).insert({
      user_id: userId,
      fortune_type: fortuneType,
      usage_date: today,
    } as any);

    if (error) {
      console.error("[Wallet] Record daily usage error:", error);
      throw error;
    }
  },

  async getCreditPackages() {
    const { data, error }: any = await (
      supabase.from("credit_packages" as any) as any
    )
      .select("id, name, credits, price, active")
      .eq("active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error("[Wallet] Fetch credit packages error:", error);
      throw error;
    }

    return data || [];
  },

  async getSubscriptionPlans() {
    const { data, error }: any = await (
      supabase.from("subscriptions" as any) as any
    )
      .select("id, plan_name, cycle, price, perks, status")
      .is("user_id", null)
      .order("price", { ascending: true });

    if (error) {
      console.error("[Wallet] Fetch subscription plans error:", error);
      throw error;
    }

    return data || [];
  },

  async getActiveSubscription(userId: string) {
    const { data, error }: any = await (
      supabase.from("subscriptions" as any) as any
    )
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[Wallet] Fetch subscription error:", error);
      return null;
    }

    return data;
  },
};
