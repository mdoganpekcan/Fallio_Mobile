import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual keys from RevenueCat Dashboard
const API_KEYS = {
  ios: 'test_fpdmKMvvyvCITXZccUSKnPSflyz', // TODO: Add your iOS API Key
  android: 'test_fpdmKMvvyvCITXZccUSKnPSflyz', // TODO: Add your Android API Key
};

class RevenueCatService {
  private isInitialized = false;

  async init(userId?: string) {
    if (this.isInitialized) return;

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.ios, appUserID: userId });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.android, appUserID: userId });
    }

    this.isInitialized = true;
  }

  async login(userId: string) {
    if (!this.isInitialized) await this.init(userId);
    await Purchases.logIn(userId);
  }

  async logout() {
    await Purchases.logOut();
  }

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (e) {
      console.error('Error fetching offerings', e);
      return null;
    }
  }

  async purchasePackage(pack: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return customerInfo;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error', e);
      }
      throw e;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (e) {
      console.error('Restore purchases error', e);
      throw e;
    }
  }
}

export const revenueCatService = new RevenueCatService();
