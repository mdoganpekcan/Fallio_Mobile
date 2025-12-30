import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Moon, Star } from 'lucide-react-native';

interface FortuneShareCardProps {
  userName?: string;
  fortuneType: string;
  fortuneResult: string;
  fortuneTeller: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;
const CARD_HEIGHT = (width * 16) / 9; // 9:16 aspect ratio for Stories

export const FortuneShareCard: React.FC<FortuneShareCardProps> = ({
  userName = 'Gezgin',
  fortuneType,
  fortuneResult,
  fortuneTeller,
}) => {
  // Truncate result for preview if it's too long
  const previewText = fortuneResult.length > 300 
    ? fortuneResult.substring(0, 300) + '...' 
    : fortuneResult;

  return (
    <View style={styles.captureContainer}>
      <LinearGradient
        colors={[Colors.background, '#1A1629', Colors.background]}
        style={styles.container}
      >
        {/* Background Decorative Elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🔮</Text>
            </View>
            <Text style={styles.appName}>FALLIO</Text>
          </View>

          <View style={styles.mainCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.glassEffect}
            >
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{fortuneType.toUpperCase()}</Text>
              </View>

              <Text style={styles.greeting}>
                Sevgili <Text style={styles.userName}>{userName}</Text>,
              </Text>
              
              <Text style={styles.resultText}>{previewText}</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.footerInfo}>
                <View>
                  <Text style={styles.tellerLabel}>Yorumlayan</Text>
                  <Text style={styles.tellerName}>{fortuneTeller}</Text>
                </View>
                <Sparkles size={24} color={Colors.premium} />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.appFooter}>
            <Text style={styles.footerTagline}>Geleceğin Yıldızlarda Saklı...</Text>
            <View style={styles.downloadBadge}>
              <Text style={styles.downloadText}>Uygulamayı İndir</Text>
            </View>
          </View>
        </View>

        {/* Floating Icons */}
        <Moon size={32} color="rgba(255,255,255,0.1)" style={styles.moonIcon} />
        <Star size={16} color="rgba(255,255,255,0.2)" style={styles.starIcon1} />
        <Star size={20} color="rgba(255,255,255,0.1)" style={styles.starIcon2} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  captureContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.premium,
    opacity: 0.05,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 24,
  },
  appName: {
    ...Typography.heading,
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 4,
  },
  mainCard: {
    flex: 1,
    marginVertical: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glassEffect: {
    flex: 1,
    padding: Spacing.xl,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  typeText: {
    ...Typography.captionBold,
    color: Colors.text,
    letterSpacing: 1,
  },
  greeting: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  userName: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  resultText: {
    ...Typography.body,
    color: Colors.text,
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: Spacing.xl,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tellerLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  tellerName: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  appFooter: {
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footerTagline: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  downloadBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  downloadText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
  },
  moonIcon: {
    position: 'absolute',
    top: 60,
    right: 40,
  },
  starIcon1: {
    position: 'absolute',
    bottom: 200,
    left: 30,
  },
  starIcon2: {
    position: 'absolute',
    top: 250,
    right: 20,
  },
});
