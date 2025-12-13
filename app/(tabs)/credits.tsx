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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet';
import { useAppStore } from '@/store/useAppStore';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function CreditsScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const updateUserCredits = useAppStore((state) => state.updateUserCredits);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  const { data: creditPackages = [], isLoading: creditLoading } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => walletService.getCreditPackages(),
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['active-subscription', user?.id],
    queryFn: () => (user ? walletService.getActiveSubscription(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const { data: subscriptionPlans = [], isLoading: subscriptionPlansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => walletService.getSubscriptionPlans(),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (credits: number) => {
      if (!user) throw new Error('Kullanıcı bulunamadı');
      await walletService.updateCredits(user.id, credits);
      const wallet = await walletService.getWallet(user.id);
      updateUserCredits(wallet.credits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      Alert.alert('Başarılı', 'Kredi eklendi.');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error?.message || 'Satın alma sırasında hata oluştu.');
    },
  });

  const handlePurchaseUnavailable = () => {
    Alert.alert('Bilgi', 'Satın alma altyapısı henüz yapılandırılmadı.');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kredi & Abonelik</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potansiyelini Ortaya Çıkar</Text>
          <Text style={styles.sectionDescription}>
            Premium özelliklerle kaderinin sırlarını çöz.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureText}>Sınırsız Fal Yorumu</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🚫</Text>
              <Text style={styles.featureText}>Reklamsız Deneyim</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>Özel İçeriklere Erişim</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kredi Paketleri</Text>

          {creditLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : creditPackages.length === 0 ? (
            <Text style={styles.emptyText}>Aktif kredi paketi bulunamadı.</Text>
          ) : (
            creditPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => purchaseMutation.mutate(pkg.credits)}
                disabled={purchaseMutation.isPending}
              >
                <View style={styles.packageContent}>
                  <View style={styles.packageIcon}>
                    <Text style={styles.diamondIcon}>💳</Text>
                  </View>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageAmount}>{pkg.credits} kredi</Text>
                    <Text style={styles.packagePrice}>{pkg.price} TL</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonelik Seçenekleri</Text>

          {subscriptionPlansLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : subscriptionPlans.length === 0 ? (
            <Text style={styles.emptyText}>Aktif abonelik seçeneği bulunamadı.</Text>
          ) : (
            subscriptionPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.subscriptionCard,
                  plan.status === 'active' && styles.subscriptionCardHighlighted,
                  selectedPlanId === plan.id && styles.subscriptionCardHighlighted,
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.8}
              >
                <View style={styles.subscriptionContent}>
                  <View style={styles.radioButton}>
                    <View style={styles.radioButtonInner} />
                  </View>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionPeriod}>{plan.plan_name}</Text>
                    <Text style={styles.subscriptionPrice}>
                      {plan.price} TL / {plan.cycle}
                    </Text>
                    {plan.perks?.length ? (
                      <View style={{ marginTop: 6 }}>
                        {plan.perks.map((perk) => (
                          <Text key={perk} style={styles.perkItem}>
                            • {perk}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.subscriptionStatus}>Satın alma için destekle iletişime geç</Text>
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Abonelik Durumu</Text>

          {subscriptionLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : subscription ? (
            <View style={[styles.subscriptionCard, styles.subscriptionCardHighlighted]}>
              <View style={styles.subscriptionContent}>
                <View style={styles.radioButton}>
                  <View style={styles.radioButtonInner} />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionPeriod}>{subscription.plan_name}</Text>
                  <Text style={styles.subscriptionPrice}>
                    {subscription.price} TL / {subscription.cycle}
                  </Text>
                </View>
              </View>
              <Text style={styles.subscriptionStatus}>Aktif</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Aktif abonelik bulunmuyor.</Text>
          )}
        </View>

        {subscriptionPlans.length > 0 && (
          <TouchableOpacity
            style={[styles.purchaseButton, !selectedPlanId && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedPlanId) return;
              Alert.alert('Bilgi', 'Abonelik satın alma akışı henüz aktif değil. Play Console ürün kimlikleri tanımlandığında devreye alınacak.');
            }}
            disabled={!selectedPlanId}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMiddle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseGradient}
            >
              <Text style={styles.purchaseButtonText}>
                {selectedPlanId ? 'Abone Ol' : 'Plan Seç'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Text style={styles.rewardIconText}>💎</Text>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>İzle & Kazan</Text>
              <Text style={styles.rewardDescription}>
                Ödüllü reklam izleyerek kredi kazan.
              </Text>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>+10</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Gizlilik Politikası</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Kullanım Koşulları</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  featuresList: {
    marginBottom: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
  },
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  diamondIcon: {
    fontSize: 28,
  },
  packageInfo: {
    flex: 1,
  },
  packageAmount: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: 4,
  },
  packagePrice: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  subscriptionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subscriptionCardHighlighted: {
    borderColor: Colors.primary,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  discountText: {
    ...Typography.small,
    color: Colors.background,
    fontWeight: '600',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPeriod: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  subscriptionPrice: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  subscriptionStatus: {
    ...Typography.caption,
    color: Colors.premium,
    marginTop: Spacing.sm,
  },
  perkItem: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rewardIconText: {
    fontSize: 28,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rewardBadge: {
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  rewardBadgeText: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  purchaseButton: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  footerLink: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  footerSeparator: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
