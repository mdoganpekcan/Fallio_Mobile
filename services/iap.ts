export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  type: 'credit' | 'subscription';
}

export interface PurchaseResult {
  productId: string;
  transactionId: string;
  purchaseTime: number;
}

export const CREDIT_PRODUCTS = [
  {
    productId: 'falio_credits_100',
    title: '100 Kredi',
    description: 'Yaklaşık 2 fal bakımı için kredi',
    price: '₺29.99',
    currency: 'TRY',
    amount: 100,
    type: 'credit' as const,
  },
  {
    productId: 'falio_credits_250',
    title: '250 Kredi',
    description: 'Yaklaşık 5 fal bakımı için kredi',
    price: '₺69.99',
    currency: 'TRY',
    amount: 250,
    type: 'credit' as const,
    popular: true,
  },
  {
    productId: 'falio_credits_500',
    title: '500 Kredi',
    description: 'Yaklaşık 10 fal bakımı için kredi',
    price: '₺129.99',
    currency: 'TRY',
    amount: 500,
    type: 'credit' as const,
    bestValue: true,
  },
];

export const SUBSCRIPTION_PRODUCTS = [
  {
    productId: 'falio_sub_weekly',
    title: 'Haftalık Abonelik',
    description: 'Premium özelliklere 1 hafta erişim',
    price: '₺24.99',
    currency: 'TRY',
    period: 'weekly' as const,
    type: 'subscription' as const,
  },
  {
    productId: 'falio_sub_monthly',
    title: 'Aylık Abonelik',
    description: 'Premium özelliklere 1 ay erişim',
    price: '₺79.99',
    currency: 'TRY',
    period: 'monthly' as const,
    type: 'subscription' as const,
    popular: true,
  },
  {
    productId: 'falio_sub_yearly',
    title: 'Yıllık Abonelik',
    description: 'Premium özelliklere 1 yıl erişim - %40 tasarruf',
    price: '₺499.99',
    currency: 'TRY',
    period: 'yearly' as const,
    type: 'subscription' as const,
    discount: 40,
    bestValue: true,
  },
];

class IAPService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[IAP] In-app purchases are not configured in this build');
    this.isInitialized = true;
  }

  async getProducts(): Promise<Product[]> {
    await this.initialize();
    return [];
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    await this.initialize();
    throw new Error('In-app purchase yapılandırılmadı.');
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    await this.initialize();
    throw new Error('Restore purchases desteklenmiyor.');
  }

  async finishTransaction(transactionId: string): Promise<void> {
    console.log('[IAP] Finish transaction skipped for:', transactionId);
  }
}

export const iapService = new IAPService();
