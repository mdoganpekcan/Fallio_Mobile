import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat Dashboard'dan alacağınız API Anahtarları
// https://app.revenuecat.com/
const API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY', // TODO: iOS API Key'inizi buraya girin
  android: 'goog_YOUR_ANDROID_API_KEY', // TODO: Android API Key'inizi buraya girin
};

// RevenueCat üzerindeki Entitlement ID'niz (örn: 'premium', 'pro_access')
const ENTITLEMENT_ID = 'premium';

class RevenueCatService {
  private isInitialized = false;

  async init(userId?: string) {
    if (this.isInitialized) return;

    if (Platform.OS === 'web') {
      console.log('[RevenueCat] Web platform not supported');
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    try {
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: API_KEYS.ios, appUserID: userId });
      } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: API_KEYS.android, appUserID: userId });
      }
      
      this.isInitialized = true;
      console.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
    }
  }

  async login(userId: string) {
    if (!this.isInitialized) await this.init(userId);
    try {
      await Purchases.logIn(userId);
      console.log('[RevenueCat] Logged in as:', userId);
    } catch (error) {
      console.error('[RevenueCat] Login failed:', error);
    }
  }

  async logout() {
    try {
      await Purchases.logOut();
      console.log('[RevenueCat] Logged out');
    } catch (error) {
      console.error('[RevenueCat] Logout failed:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length !== 0) {
        return offerings.current;
      }
      return null;
    } catch (e) {
      console.error('[RevenueCat] Error fetching offerings:', e);
      return null;
    }
  }

  async purchasePackage(pack: PurchasesPackage): Promise<{ isPro: boolean; customerInfo: CustomerInfo }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      return { isPro, customerInfo };
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('[RevenueCat] Purchase error:', e);
      }
      throw e;
    }
  }

  async restorePurchases(): Promise<{ isPro: boolean; customerInfo: CustomerInfo }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      return { isPro, customerInfo };
    } catch (e) {
      console.error('[RevenueCat] Restore error:', e);
      throw e;
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    } catch (e) {
      console.error('[RevenueCat] Check status error:', e);
      return false;
    }
  }
}

export const revenueCatService = new RevenueCatService();
