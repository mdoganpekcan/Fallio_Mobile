import { Platform } from 'react-native';

export const ADMOB_CONFIG = {
  testMode: true,
  
  bannerAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  
  interstitialAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  
  rewardedAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

class AdMobService {
  private interstitialLoaded = false;
  private rewardedLoaded = false;

  async initialize(): Promise<void> {
    console.log('[AdMob] Ad service not configured in this build');
  }

  async loadInterstitial(): Promise<void> {
    console.log('[AdMob] Loading interstitial skipped');
  }

  async showInterstitial(): Promise<void> {
    console.log('[AdMob] Show interstitial skipped');
  }

  async loadRewarded(): Promise<void> {
    console.log('[AdMob] Loading rewarded skipped');
  }

  async showRewarded(): Promise<{ watched: boolean; reward?: number }> {
    console.log('[AdMob] Show rewarded skipped');
    return { watched: false };
  }

  isInterstitialReady(): boolean {
    return this.interstitialLoaded;
  }

  isRewardedReady(): boolean {
    return this.rewardedLoaded;
  }
}

export const adMobService = new AdMobService();
