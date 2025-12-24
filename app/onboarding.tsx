import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: t('onboarding.slide1_title'),
      description: t('onboarding.slide1_desc'),
      image: '🔮',
    },
    {
      id: '2',
      title: t('onboarding.slide2_title'),
      description: t('onboarding.slide2_desc'),
      image: '✨',
    },
    {
      id: '3',
      title: t('onboarding.slide3_title'),
      description: t('onboarding.slide3_desc'),
      image: '🌟',
    },
  ];

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login' as any);
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/login' as any);
  };

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={['rgba(106, 61, 248, 0.2)', 'rgba(236, 72, 153, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imageGradient}
        >
          <Text style={styles.emoji}>{item.image}</Text>
        </LinearGradient>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={skip} style={styles.skipButton}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace('/auth/login' as any)} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              {t('auth.have_account_question')} <Text style={styles.loginLinkBold}>{t('auth.login_action')}</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 60,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    width: width * 0.7,
    aspectRatio: 1,
    marginBottom: Spacing.xxl,
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 120,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 32,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardSecondary,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
