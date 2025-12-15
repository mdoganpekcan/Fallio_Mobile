import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFortuneTypeInfo, FortuneType } from '@/constants/fortuneTypes';
import { useAppStore } from '@/store/useAppStore';

const { width } = Dimensions.get('window');

export default function FortuneTypeScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const fortuneInfo = getFortuneTypeInfo(type as FortuneType);
  const appConfig = useAppStore((state) => state.appConfig);
  const creditCost = appConfig?.fortune_costs?.[type as FortuneType] ?? fortuneInfo.credit;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(106, 61, 248, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.icon}>{fortuneInfo.icon}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{fortuneInfo.name}</Text>
        <Text style={styles.description}>{fortuneInfo.detailedDescription}</Text>

        <View style={styles.creditInfo}>
          <Text style={styles.creditIcon}>💎</Text>
          <Text style={styles.creditText}>Gerekli Kredi: {creditCost}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push(`/fortune/submit/${type}` as any)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMiddle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Hemen Fal Bak</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push(`/fortune-tellers?fortuneType=${type}` as any)}
          >
            <Text style={styles.secondaryButtonText}>Falcı Seç</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  icon: {
    fontSize: 120,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 32,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  creditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  creditIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  creditText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 18,
  },
});
