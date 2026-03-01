import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ── RevenueCat API Keys ──────────────────────────────────────────────────────
const API_KEYS = {
  ios: 'appl_placeholder_for_future_release',
  android: 'goog_frfgrLlLzhceSzZHzaPJOKxnXmw',
};

// Entitlement ID as defined on the RevenueCat Dashboard
const ENTITLEMENT_ID = 'premium';

// ── Service ──────────────────────────────────────────────────────────────────
class RevenueCatService {
  private isInitialized = false;
  private customerInfoListenerRemover: (() => void) | null = null;

  // ── Init ───────────────────────────────────────────────────────────────────
  async init(userId?: string) {
    if (this.isInitialized) return;

    if (Platform.OS === 'web') {
      console.log('[RevenueCat] ⚡ Web platform — skipping init');
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

    try {
      const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
      await Purchases.configure({ apiKey, appUserID: userId });
      this.isInitialized = true;
      console.log('[RevenueCat] ✅ Initialized (userId:', userId ?? 'anonymous', ')');
    } catch (error) {
      console.error('[RevenueCat] ❌ Initialization failed:', error);
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(userId: string) {
    if (!this.isInitialized) await this.init(userId);
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      console.log('[RevenueCat] ✅ Logged in:', userId);
      this._logEntitlements(customerInfo);
    } catch (error) {
      console.error('[RevenueCat] ❌ Login failed:', error);
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  async logout() {
    this._removeListener();
    try {
      await Purchases.logOut();
      console.log('[RevenueCat] Logged out');
    } catch (error) {
      console.error('[RevenueCat] ❌ Logout failed:', error);
    }
  }

  // ── Real-time CustomerInfo Listener ────────────────────────────────────────
  /**
   * Registers a callback that fires whenever RevenueCat's CustomerInfo changes
   * (e.g., sandbox subscription renewal, server-side cancellation).
   * Returns a remove function — call it in component cleanup.
   */
  addCustomerInfoListener(
    callback: (info: CustomerInfo) => void
  ): () => void {
    if (!this.isInitialized) {
      console.warn('[RevenueCat] addCustomerInfoListener called before init');
      return () => {};
    }

    this._removeListener(); // Ensure no duplicate listeners

    const purchasesListener = Purchases.addCustomerInfoUpdateListener(
      (info: CustomerInfo) => {
        const isPro = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        const expiresAt = info.entitlements.active[ENTITLEMENT_ID]?.expirationDate;
        console.log(
          `[RevenueCat] 🔔 CustomerInfo updated — isPro: ${isPro}` +
          (expiresAt ? ` | expires: ${expiresAt}` : '')
        );
        callback(info);
      }
    );

    this.customerInfoListenerRemover = purchasesListener.remove.bind(purchasesListener);
    return this.customerInfoListenerRemover;
  }

  private _removeListener() {
    if (this.customerInfoListenerRemover) {
      this.customerInfoListenerRemover();
      this.customerInfoListenerRemover = null;
    }
  }

  // ── Offerings (Product List) ────────────────────────────────────────────────
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) return null;
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        console.log(
          `[RevenueCat] Offerings fetched: ${offerings.current.availablePackages.length} packages`
        );
        return offerings.current;
      }
      console.warn('[RevenueCat] No packages found in current offering');
      return null;
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'ConfigurationError' || err.message?.includes('ConfigurationError')) {
        console.warn(
          '[RevenueCat] ⚠️ Offerings not configured yet. ' +
          'Check RevenueCat Dashboard → Products → Offerings.'
        );
        return null;
      }
      console.error('[RevenueCat] ❌ Error fetching offerings:', JSON.stringify(e, null, 2));
      return null;
    }
  }

  // ── Purchase ───────────────────────────────────────────────────────────────
  async purchasePackage(
    pack: PurchasesPackage
  ): Promise<{ isPro: boolean; customerInfo: CustomerInfo }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      console.log(`[RevenueCat] ✅ Purchase complete — isPro: ${isPro}`);
      this._logEntitlements(customerInfo);
      return { isPro, customerInfo };
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        console.error('[RevenueCat] ❌ Purchase error:', e);
      }
      throw e;
    }
  }

  // ── Restore Purchases ──────────────────────────────────────────────────────
  async restorePurchases(): Promise<{ isPro: boolean; customerInfo: CustomerInfo }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      console.log(`[RevenueCat] ✅ Restore complete — isPro: ${isPro}`);
      this._logEntitlements(customerInfo);
      return { isPro, customerInfo };
    } catch (e: unknown) {
      console.error('[RevenueCat] ❌ Restore error:', e);
      throw e;
    }
  }

  // ── Subscription Status ────────────────────────────────────────────────────
  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      if (__DEV__) {
        const expiresAt = customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;
        console.log(
          `[RevenueCat] Subscription status: ${isPro ? '✅ Premium' : '❌ Free'}` +
          (expiresAt ? ` | expires: ${expiresAt}` : '')
        );
      }
      return isPro;
    } catch (e: unknown) {
      console.error('[RevenueCat] ❌ Status check error:', e);
      return false;
    }
  }

  // ── Debug Helper ───────────────────────────────────────────────────────────
  private _logEntitlements(customerInfo: CustomerInfo) {
    if (!__DEV__) return;
    const active = Object.keys(customerInfo.entitlements.active);
    console.log(
      active.length > 0
        ? `[RevenueCat] 🔑 Active entitlements: ${active.join(', ')}`
        : '[RevenueCat] ℹ️ No active entitlements'
    );
  }
}

export const revenueCatService = new RevenueCatService();
