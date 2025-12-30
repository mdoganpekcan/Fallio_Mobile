import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { earningService, EarningRule } from '@/services/earning';
import { useTranslation } from 'react-i18next';
import { Gift, X, Sparkles } from 'lucide-react-native';

interface DailyRewardModalProps {
  userId: string;
  onClaimed: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ userId, onClaimed }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [rule, setRule] = useState<EarningRule | null>(null);
  const [claiming, setClaiming] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const checkEligibility = async () => {
      const isEligible = await earningService.checkDailyRewardEligibility(userId);
      if (isEligible) {
        const rules = await earningService.getEarningRules();
        const dailyRule = rules.find(r => r.type === 'daily_login');
        if (dailyRule) {
          setRule(dailyRule);
          setVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      }
    };

    checkEligibility();
  }, [userId]);

  const handleClaim = async () => {
    if (!rule) return;
    setClaiming(true);
    try {
      await earningService.claimReward(userId, 'daily_login');
      onClaimed();
      setVisible(false);
    } catch (error) {
      console.error('[DailyReward] Claim failed:', error);
    } finally {
      setClaiming(false);
    }
  };

  if (!visible || !rule) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
            <X size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Gift size={48} color={Colors.primary} />
            <Sparkles size={24} color={Colors.premium} style={styles.sparkle} />
          </View>

          <Text style={styles.title}>{t('rewards.daily_title') || 'Günlük Giriş Ödülü!'}</Text>
          <Text style={styles.description}>
            {t('rewards.daily_desc') || 'Yıldızlar bugün senin için parlıyor. Giriş yaptığın için ödülünü al!'}
          </Text>

          <View style={styles.rewardBox}>
            <Text style={styles.diamondIcon}>💎</Text>
            <Text style={styles.amount}>+{rule.diamonds}</Text>
            <Text style={styles.currency}>Elmas</Text>
          </View>

          <TouchableOpacity 
            style={styles.claimButton} 
            onPress={handleClaim}
            disabled={claiming}
          >
            <Text style={styles.claimButtonText}>
              {claiming ? t('common.loading') : t('rewards.claim_now') || 'Ödülümü Al'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    ...Typography.heading,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  diamondIcon: {
    fontSize: 24,
  },
  amount: {
    ...Typography.heading,
    fontSize: 32,
    color: Colors.primary,
  },
  currency: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  claimButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  claimButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
});
