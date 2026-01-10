import { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';

// Configure IDs
// Use the official test IDs for development, switch to real IDs in production only if you are sure
const isDev = __DEV__;

// You can pull these from app.json or constants if securely stored, 
// but often hardcoded for simplicity in native-ads wrappers if they are static.
// Since user provided App IDs in app.json, we use unit IDs here.
// NOTE: App ID and Unit ID are different. The ones in app.json are APP IDs.
// Unit IDs should be provided by the user or created in AdMob console.
// For now, I will use TestIds for Safety and Reliability during development.
// ! IMPORTANT: Replace with Real Unit IDs before production release !

const BANNER_ID = isDev ? TestIds.BANNER : 'ca-app-pub-5812875423104468/YOUR_BANNER_UNIT_ID'; 
const INTERSTITIAL_ID = isDev ? TestIds.INTERSTITIAL : 'ca-app-pub-5812875423104468/YOUR_INTERSTITIAL_UNIT_ID';
const REWARDED_ID = isDev ? TestIds.REWARDED : 'ca-app-pub-5812875423104468/YOUR_REWARDED_UNIT_ID';
const APP_OPEN_ID = isDev ? TestIds.APP_OPEN : 'ca-app-pub-5812875423104468/YOUR_APP_OPEN_UNIT_ID';

class AdService {
  private interstitial: InterstitialAd | null = null;
  private appOpen: any = null; // AppOpenAd not exported directly as class sometimes depending on version, generic handle

  constructor() {
    this.loadInterstitial();
  }

  loadInterstitial() {
    if (this.interstitial) return;

    // Create a new interstitial
    // @ts-ignore
    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdService] Interstitial Loaded');
        this.interstitial = interstitial;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdService] Interstitial Closed');
        this.interstitial = null;
        this.loadInterstitial(); // Preload next one
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
       console.error('[AdService] Interstitial Error:', error);
       this.interstitial = null; // Clear so we can try again later maybe
    });

    interstitial.load();
  }

  async showInterstitial(): Promise<boolean> {
    if (this.interstitial) {
        try {
            await this.interstitial.show();
            this.interstitial = null; // Consumed
            this.loadInterstitial(); // Start loading next immediately
            return true;
        } catch (e) {
            console.error('[AdService] Show Interstitial Failed:', e);
            this.loadInterstitial();
            return false;
        }
    } else {
        console.log('[AdService] Interstitial not ready');
        this.loadInterstitial(); // Try loading for next time
        return false;
    }
  }

  // Helper for App Open (simplified)
  // Usually App Open is handled in the root component effectively
}

export const adService = new AdService();

export const AdUnitIds = {
    BANNER: BANNER_ID,
    INTERSTITIAL: INTERSTITIAL_ID,
    REWARDED: REWARDED_ID,
    APP_OPEN: APP_OPEN_ID
};
