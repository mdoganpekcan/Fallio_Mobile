import { Platform } from 'react-native';
import { 
  TestIds, 
  InterstitialAd, 
  RewardedAd, 
  AdEventType, 
  RewardedAdEventType,
  BannerAd,
  BannerAdSize
} from 'react-native-google-mobile-ads';

// Gerçek ID'lerinizi buraya gireceksiniz. Şimdilik Test ID'leri kullanılıyor.
const PRODUCTION_IDS = {
  android: {
    banner: 'ca-app-pub-5812875423104468/2455138831',
    interstitial: 'ca-app-pub-5812875423104468/6177749666',
    rewarded: 'ca-app-pub-5812875423104468/4533495503',
  },
  ios: {
    banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    rewarded: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  }
};

export const ADMOB_CONFIG = {
  testMode: __DEV__, // Sadece geliştirme ortamında test modunu açar
  
  bannerAdUnitId: __DEV__ 
    ? TestIds.BANNER 
    : Platform.select({
        ios: PRODUCTION_IDS.ios.banner,
        android: PRODUCTION_IDS.android.banner,
        default: TestIds.BANNER,
      }),
  
  interstitialAdUnitId: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: PRODUCTION_IDS.ios.interstitial,
        android: PRODUCTION_IDS.android.interstitial,
        default: TestIds.INTERSTITIAL,
      }),
  
  rewardedAdUnitId: __DEV__
    ? TestIds.REWARDED
    : Platform.select({
        ios: PRODUCTION_IDS.ios.rewarded,
        android: PRODUCTION_IDS.android.rewarded,
        default: TestIds.REWARDED,
      }),
};

class AdMobService {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
  private interstitialLoaded = false;
  private rewardedLoaded = false;

  constructor() {
    this.createInterstitial();
    this.createRewarded();
  }

  private createInterstitial() {
    if (!ADMOB_CONFIG.interstitialAdUnitId) return;

    this.interstitial = InterstitialAd.createForAdRequest(ADMOB_CONFIG.interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdMob] Interstitial loaded');
      this.interstitialLoaded = true;
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Interstitial closed');
      this.interstitialLoaded = false;
      this.createInterstitial(); // Bir sonraki için yeniden yükle
    });
    
    this.interstitial.load();
  }

  private createRewarded() {
    if (!ADMOB_CONFIG.rewardedAdUnitId) return;

    this.rewarded = RewardedAd.createForAdRequest(ADMOB_CONFIG.rewardedAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Rewarded loaded');
      this.rewardedLoaded = true;
    });

    this.rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Rewarded closed');
      this.rewardedLoaded = false;
      this.createRewarded(); // Bir sonraki için yeniden yükle
    });

    this.rewarded.load();
  }

  async initialize(): Promise<void> {
    // react-native-google-mobile-ads otomatik initialize olur, 
    // ancak manuel kontrol gerekirse buraya eklenebilir.
    console.log('[AdMob] Service initialized');
  }

  async showInterstitial(): Promise<void> {
    if (this.interstitialLoaded && this.interstitial) {
      await this.interstitial.show();
    } else {
      console.log('[AdMob] Interstitial not ready yet');
      // Eğer hazır değilse yeniden yüklemeyi tetikle
      if (this.interstitial) this.interstitial.load();
    }
  }

  async showRewarded(): Promise<{ watched: boolean; reward?: number }> {
    return new Promise((resolve) => {
      if (this.rewardedLoaded && this.rewarded) {
        let earned = false;
        let rewardAmount = 0;

        // Geçici event listener'lar
        const unsubscribeEarned = this.rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            earned = true;
            rewardAmount = reward.amount;
            console.log('[AdMob] Reward earned:', reward);
          }
        );
        
        const unsubscribeClosed = this.rewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
             unsubscribeEarned();
             unsubscribeClosed();
             resolve({ watched: earned, reward: rewardAmount });
          }
        );

        this.rewarded.show().catch((error) => {
           console.error('[AdMob] Show error:', error);
           unsubscribeEarned();
           unsubscribeClosed();
           resolve({ watched: false });
        });
      } else {
        console.log('[AdMob] Rewarded not ready yet');
        if (this.rewarded) this.rewarded.load();
        resolve({ watched: false });
      }
    });
  }

  isInterstitialReady(): boolean {
    return this.interstitialLoaded;
  }

  isRewardedReady(): boolean {
    return this.rewardedLoaded;
  }
}

export const adMobService = new AdMobService();
