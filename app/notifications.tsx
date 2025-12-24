import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { notificationService } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [fortuneEnabled, setFortuneEnabled] = React.useState(true);
  const [promoEnabled, setPromoEnabled] = React.useState(false);

  const handleRegisterPush = async () => {
    if (!user) {
      Alert.alert(t('notifications_screen.alerts.error_title'), t('notifications_screen.alerts.login_required'));
      return;
    }
    const token = await notificationService.getPushToken();
    if (token) {
      await notificationService.saveDeviceToken(user.id, token);
      Alert.alert(t('notifications_screen.alerts.info_title'), t('notifications_screen.alerts.register_success'));
    } else {
      Alert.alert(t('notifications_screen.alerts.error_title'), t('notifications_screen.alerts.permission_error'));
    }
  };

  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      await handleRegisterPush();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications_screen.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.title}>{t('notifications_screen.push.title')}</Text>
              <Text style={styles.subtitle}>{t('notifications_screen.push.subtitle')}</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: Colors.cardSecondary, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.title}>{t('notifications_screen.fortune.title')}</Text>
              <Text style={styles.subtitle}>{t('notifications_screen.fortune.subtitle')}</Text>
            </View>
            <Switch
              value={fortuneEnabled}
              onValueChange={setFortuneEnabled}
              trackColor={{ false: Colors.cardSecondary, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.textGroup}>
              <Text style={styles.title}>{t('notifications_screen.promo.title')}</Text>
              <Text style={styles.subtitle}>{t('notifications_screen.promo.subtitle')}</Text>
            </View>
            <Switch
              value={promoEnabled}
              onValueChange={setPromoEnabled}
              trackColor={{ false: Colors.cardSecondary, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  textGroup: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
