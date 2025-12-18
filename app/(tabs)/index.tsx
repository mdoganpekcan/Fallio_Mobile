import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Bell, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import FortuneCard from '@/components/FortuneCard';
import { fortuneTypes } from '@/constants/fortuneTypes';
import { useAppStore } from '@/store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { walletService } from '@/services/wallet';
import { horoscopeService } from '@/services/horoscope';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type HoroscopeCategory = 'general' | 'love' | 'career' | 'health';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [selectedPeriod, setSelectedPeriod] = useState<HoroscopePeriod>('Günlük');
  const [selectedCategory, setSelectedCategory] = useState<HoroscopeCategory>('general');
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => (user ? walletService.getWallet(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const { data: horoscope, refetch: refetchHoroscope } = useQuery({
    queryKey: ['horoscope', user?.zodiacSign, selectedPeriod],
    queryFn: async () => {
      if (!user?.zodiacSign) return null;
      if (selectedPeriod === 'Günlük') {
        return horoscopeService.getDailyHoroscope(user.zodiacSign);
      }
      if (selectedPeriod === 'Haftalık') {
        return horoscopeService.getWeeklyHoroscope(user.zodiacSign);
      }
      return horoscopeService.getMonthlyHoroscope(user.zodiacSign);
    },
    enabled: !!user?.zodiacSign,
  });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetchWallet();
        refetchHoroscope();
      }
    }, [user, refetchWallet, refetchHoroscope])
  );

  const horoscopePeriods: HoroscopePeriod[] = ['Günlük', 'Haftalık', 'Aylık'];
  const displayCredits = wallet?.credits ?? user?.credits ?? 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'F'}</Text>
          </View>
          <Text style={styles.headerTitle}>{user?.name || 'Misafir'}</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.creditsContainer}>
          <View style={styles.creditCard}>
            <View style={styles.creditIconContainer}>
              <Text style={styles.creditIcon}>💎</Text>
            </View>
            <View>
              <Text style={styles.creditAmount}>{displayCredits}</Text>
              <Text style={styles.creditLabel}>Kredi</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Burç Yorumun</Text>

          <View style={styles.periodTabs}>
            {horoscopePeriods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodTab,
                  selectedPeriod === period && styles.periodTabActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodTabText,
                    selectedPeriod === period && styles.periodTabTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.horoscopeCard}>
          <View style={styles.horoscopeHeader}>
            <TouchableOpacity 
              style={[styles.horoscopeIconRow, selectedCategory === 'love' && styles.activeCategory]}
              onPress={() => setSelectedCategory('love')}
            >
              <Text style={styles.horoscopeCategory}>❤️ Aşk</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.horoscopeIconRow, selectedCategory === 'career' && styles.activeCategory]}
              onPress={() => setSelectedCategory('career')}
            >
              <Text style={styles.horoscopeCategory}>💰 Para</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.horoscopeIconRow, selectedCategory === 'health' && styles.activeCategory]}
              onPress={() => setSelectedCategory('health')}
            >
              <Text style={styles.horoscopeCategory}>🛡️ Sağlık</Text>
            </TouchableOpacity>
             <TouchableOpacity 
              style={[styles.horoscopeIconRow, selectedCategory === 'general' && styles.activeCategory]}
              onPress={() => setSelectedCategory('general')}
            >
              <Text style={styles.horoscopeCategory}>✨ Genel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.horoscopeText} numberOfLines={4}>
            {horoscope?.[selectedCategory] ||
              (user?.zodiacSign
                ? 'Burç yorumun hazırlanıyor.'
                : 'Burç bilgisi için profilini tamamla.')}
          </Text>

          <TouchableOpacity 
            style={styles.readMoreButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.readMoreText}>Devamını Oku...</Text>
          </TouchableOpacity>
        </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fal Baktır</Text>

          <View style={styles.fortuneGrid}>
            {fortuneTypes.map((fortune) => (
              <FortuneCard
                key={fortune.id}
                icon={fortune.icon}
                title={fortune.name}
                onPress={() => router.push(`/fortune/${fortune.id}` as any)}
                testID={`fortune-card-${fortune.id}`}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => router.push('/credits' as any)}
        >
          <LinearGradient
            colors={['#6A3DF8', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumGradient}
          >
            <Text style={styles.premiumTitle}>Falio Premium&apos;a Geç</Text>

            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>🚫</Text>
                <Text style={styles.premiumFeatureText}>Reklamsız Deneyim</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>📍</Text>
                <Text style={styles.premiumFeatureText}>Günlük Bonus Kredi</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>⚡</Text>
                <Text style={styles.premiumFeatureText}>Öncelikli & Hızlı Yanıt</Text>
              </View>
            </View>

            <View style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Hemen Yükselt</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{user?.zodiacSign} Burcu Yorumu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>Genel</Text>
              <Text style={styles.modalText}>{horoscope?.general}</Text>
              
              {horoscope?.love && (
                <>
                  <Text style={styles.modalSectionTitle}>❤️ Aşk</Text>
                  <Text style={styles.modalText}>{horoscope.love}</Text>
                </>
              )}
              
              {horoscope?.career && (
                <>
                  <Text style={styles.modalSectionTitle}>💼 Kariyer & Para</Text>
                  <Text style={styles.modalText}>{horoscope.career}</Text>
                </>
              )}
              
              {horoscope?.health && (
                <>
                  <Text style={styles.modalSectionTitle}>🛡️ Sağlık</Text>
                  <Text style={styles.modalText}>{horoscope.health}</Text>
                </>
              )}
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardSecondary,
    marginRight: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
    flex: 1,
  },
  avatarText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  creditCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  creditIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  creditIcon: {
    fontSize: 24,
  },
  creditAmount: {
    ...Typography.heading,
    color: Colors.text,
    fontSize: 20,
  },
  creditLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodTabText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: Colors.text,
  },
  horoscopeCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  horoscopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  horoscopeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 8,
  },
  activeCategory: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)', // Colors.primary with opacity
  },
  horoscopeCategory: {
    ...Typography.caption,
    color: Colors.text,
  },
  horoscopeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    ...Typography.bodyBold,
    color: Colors.premium,
  },
  fortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  premiumCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  premiumGradient: {
    padding: Spacing.lg,
  },
  premiumTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  premiumFeatures: {
    marginBottom: Spacing.lg,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  premiumFeatureIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  premiumFeatureText: {
    ...Typography.body,
    color: Colors.text,
  },
  premiumButton: {
    backgroundColor: Colors.premium,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  premiumButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.heading,
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  modalSectionTitle: {
    ...Typography.title,
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
});
