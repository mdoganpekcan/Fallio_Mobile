import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Coins, Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { revenueCatService } from '@/services/revenueCat';
import { PurchasesPackage } from 'react-native-purchases';
import { useAppStore } from '@/store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/Skeleton';

export default function BuyCreditsScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [purchasing, setPurchasing] = useState(false);

  // Reuse the shared rc-offerings cache (staleTime: 30 min set in credits.tsx)
  const { data: offeringsData, isLoading: loading } = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: () => revenueCatService.getOfferings(),
    staleTime: 1000 * 60 * 30,
  });

  const packages = offeringsData?.availablePackages ?? [];

  const handlePurchase = async (pack: PurchasesPackage) => {
    if (purchasing) return;
    setPurchasing(true);

    try {
      const customerInfo = await revenueCatService.purchasePackage(pack);
      
      // Check if the entitlement is active (this depends on how you set up entitlements in RevenueCat)
      // For consumables, we usually rely on the webhook to update the database, 
      // but we can show a success message here.
      
      Alert.alert(
        'Başarılı', 
        'Satın alma işleminiz başarıyla tamamlandı. Kredileriniz hesabınıza yükleniyor.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
      
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Hata', error.message || 'Satın alma işlemi başarısız oldu.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#1A1625']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Kredi Yükle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Mevcut Bakiyeniz</Text>
          <View style={styles.balanceRow}>
            <Coins color={Colors.primary} size={24} />
            <Text style={styles.balanceText}>{user?.credits || 0} Kredi</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Paket Seçin</Text>

        {loading ? (
          <View style={styles.packagesGrid}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.packageCard}>
                <View style={[styles.packageGradient, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Skeleton width={56} height={56} borderRadius={28} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="60%" height={18} borderRadius={BorderRadius.sm} />
                    <Skeleton width="35%" height={14} borderRadius={BorderRadius.sm} />
                  </View>
                  <Skeleton width={60} height={22} borderRadius={BorderRadius.sm} />
                </View>
              </View>
            ))}
          </View>
        ) : packages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Şu anda satışta olan paket bulunmamaktadır.</Text>
            <Text style={styles.emptySubText}>Lütfen daha sonra tekrar deneyiniz.</Text>
          </View>
        ) : (
          <View style={styles.packagesGrid}>
            {packages.map((pack) => (
              <TouchableOpacity
                key={pack.identifier}
                style={styles.packageCard}
                onPress={() => handlePurchase(pack)}
                disabled={purchasing}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.packageGradient}
                >
                  <View style={styles.packageIcon}>
                    <Coins color={Colors.secondary} size={32} />
                  </View>
                  <Text style={styles.packageTitle}>{pack.product.title}</Text>
                  <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
                  <Text style={styles.packageDesc}>{pack.product.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
  },
  balanceContainer: {
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  balanceText: {
    ...Typography.h1,
    color: Colors.primary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  packagesGrid: {
    gap: Spacing.md,
  },
  packageCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  packageGradient: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  packageIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  packagePrice: {
    ...Typography.h3,
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  packageDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.lg + 56 + Spacing.md, // Icon width + gap
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
