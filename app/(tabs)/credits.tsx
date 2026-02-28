import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { walletService } from '@/services/wallet';
import { useAppStore } from '@/store/useAppStore';
import { PurchasesPackage } from 'react-native-purchases';
import { revenueCatService } from '@/services/revenueCat';
import { adMobService } from '@/services/admob';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function CreditsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const appConfig = useAppStore((state) => state.appConfig);
  const updateUserCredits = useAppStore((state) => state.updateUserCredits);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = React.useState<PurchasesPackage | null>(null);
  const [loadingAd, setLoadingAd] = React.useState(false);

  // RevenueCat Offerings (Ürünler) — statik veri, 30 dakika cache
  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: () => revenueCatService.getOfferings(),
    staleTime: 1000 * 60 * 30, // 30 dakika — paket listesi sık değişmez
  });

  // RevenueCat Abonelik Durumu
  const { data: isPro, isLoading: proLoading } = useQuery({
    queryKey: ['rc-status', user?.id],
    queryFn: () => revenueCatService.checkSubscriptionStatus(),
  });

  // Kredi Ekleme (Backend)
  const addCreditsMutation = useMutation({
    mutationFn: async (credits: number) => {
      if (!user) throw new Error(t('auth.errors.user_not_found'));
      await walletService.updateCredits(user.id, credits);
      const wallet = await walletService.getWallet(user.id);
      updateUserCredits(wallet.credits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      Alert.alert(t('credits.messages.success'), t('credits.messages.creditsAdded'));
    },
  });

  // Satın Alma İşlemi
  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await revenueCatService.purchasePackage(pkg);
      
      // Eğer kredi paketi ise (identifier kontrolü veya metadata)
      // Örnek: '10_credits_pack'
      if (pkg.product.identifier.includes('credit')) {
        // Paketteki kredi miktarını belirle (Metadata veya ID'den)
        // Basitlik için: ID içinde sayı varsa onu al, yoksa 10 varsay
        const credits = parseInt(pkg.product.identifier.replace(/[^0-9]/g, '')) || 10;
        await addCreditsMutation.mutateAsync(credits);
      } else {
        // Abonelik ise
        Alert.alert(t('credits.messages.success'), t('credits.messages.premiumActivated'));
        queryClient.invalidateQueries({ queryKey: ['rc-status'] });
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert(t('credits.messages.error'), e.message || t('credits.messages.purchaseFailed'));
      }
    }
  };

  const handleWatchAd = async () => {
    if (!user) return;
    
    if (!adMobService.isRewardedReady()) {
      Alert.alert(t('common.info'), t('credits.messages.adLoading'));
      return;
    }

    setLoadingAd(true);
    try {
      const result = await adMobService.showRewarded();
      if (result.watched) {
        const rewardAmount = appConfig?.ad_reward_amount || 1;
        await addCreditsMutation.mutateAsync(rewardAmount);
      } else {
        // İzleme tamamlanmadı veya hata oluştu
        // Alert.alert('Bilgi', 'Reklam sonuna kadar izlenmedi.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('credits.messages.error'), t('credits.messages.adError'));
    } finally {
      setLoadingAd(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('credits.title')}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Ücretsiz Kredi Alanı */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('credits.freeCredits.title')}</Text>
          <TouchableOpacity 
            style={styles.adButton}
            onPress={handleWatchAd}
            disabled={loadingAd}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.adButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loadingAd ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={styles.adContent}>
                  <Text style={styles.adButtonIcon}>🎬</Text>
                  <View>
                    <Text style={styles.adButtonTitle}>{t('credits.freeCredits.watchAd')}</Text>
                    <Text style={styles.adButtonSubtitle}>{t('credits.freeCredits.earn', { amount: appConfig?.ad_reward_amount || 1 })}</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('credits.premium.title')}</Text>
          <Text style={styles.sectionDescription}>
            {t('credits.premium.description')}
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureText}>{t('credits.premium.features.unlimited')}</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🚫</Text>
              <Text style={styles.featureText}>{t('credits.premium.features.noAds')}</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>{t('credits.premium.features.specialContent')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('credits.packages.title')}</Text>
          <View style={styles.packagesContainer}>
            {offeringsLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              offerings?.availablePackages
                .filter((pkg) => pkg.product.identifier.includes('credit'))
                .map((pkg) => (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={styles.packageCard}
                  onPress={() => handlePurchase(pkg)}
                >
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageAmount}>{pkg.product.title}</Text>
                  </View>
                  <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                </TouchableOpacity>
              ))
            )}
            {(!offerings || offerings.availablePackages.filter(p => p.product.identifier.includes('credit')).length === 0) && !offeringsLoading && (
               <Text style={{color: Colors.textSecondary}}>{t('credits.packages.noPackages')}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('credits.premium.subscriptionTitle')}</Text>
          {isPro ? (
            <View style={styles.activeSubscription}>
              <Text style={styles.activeSubTitle}>{t('credits.premium.active')}</Text>
              <Text style={styles.activeSubDate}>
                {t('credits.premium.activeDesc')}
              </Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {offeringsLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                offerings?.availablePackages
                  .filter((pkg) => !pkg.product.identifier.includes('credit'))
                  .map((pkg) => (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.planCard,
                      selectedPackage?.identifier === pkg.identifier && styles.selectedPlan,
                    ]}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{pkg.product.title}</Text>
                    </View>
                    <Text style={styles.planPrice}>{pkg.product.priceString} / {pkg.product.subscriptionPeriod || 'Ay'}</Text>
                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        selectedPackage?.identifier === pkg.identifier && styles.selectedSubscribeButton,
                      ]}
                      onPress={() => handlePurchase(pkg)}
                    >
                      <Text
                        style={[
                          styles.subscribeButtonText,
                          selectedPackage?.identifier === pkg.identifier && styles.selectedSubscribeButtonText,
                        ]}
                      >
                        {t('credits.premium.subscribe')}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
               {(!offerings || offerings.availablePackages.filter(p => !p.product.identifier.includes('credit')).length === 0) && !offeringsLoading && (
               <Text style={{color: Colors.textSecondary}}>{t('credits.premium.noPlans')}</Text>
            )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.title,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
  },
  packagesContainer: {
    gap: Spacing.md,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  packageAmount: {
    ...Typography.subheading,
    color: Colors.text,
  },
  packageBonus: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: 'bold',
  },
  packagePrice: {
    ...Typography.subheading,
    color: Colors.primary,
  },
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPlan: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  planName: {
    ...Typography.subheading,
    color: Colors.text,
  },
  popularBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  popularText: {
    ...Typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  planPrice: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  subscribeButton: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    alignItems: 'center',
  },
  selectedSubscribeButton: {
    backgroundColor: Colors.primary,
  },
  subscribeButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  selectedSubscribeButtonText: {
    color: '#FFF',
  },
  activeSubscription: {
    padding: Spacing.md,
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  activeSubTitle: {
    ...Typography.subheading,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  activeSubDate: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  adButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  adButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  adButtonIcon: {
    fontSize: 24,
  },
  adButtonTitle: {
    ...Typography.subheading,
    color: '#FFF',
  },
  adButtonSubtitle: {
    ...Typography.caption,
    color: '#E0E7FF',
  },
});
