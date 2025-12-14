import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Globe, Bell, Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
  ];

  const handleLanguageChange = (langCode: 'tr' | 'en' | 'es' | 'pt') => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    setLanguageModalVisible(false);
  };

  const getLanguageLabel = (code: string) => {
    return languages.find(l => l.code === code)?.label || code.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.accountSettings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.theme')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                {theme === 'dark' ? (
                  <Moon size={24} color={Colors.primary} />
                ) : (
                  <Sun size={24} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.settingLabel}>{t('profile.theme')}</Text>
            </View>
            <Text style={styles.settingValue}>
              {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Globe size={24} color={Colors.primary} />
              </View>
              <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            </View>
            <Text style={styles.settingValue}>
              {getLanguageLabel(language)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.notifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Bell size={24} color={Colors.primary} />
              </View>
              <Text style={styles.settingLabel}>{t('notifications.title')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.cardSecondary, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('profile.language')}</Text>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={styles.languageOption}
                    onPress={() => handleLanguageChange(lang.code as any)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      language === lang.code && styles.selectedLanguageText
                    ]}>
                      {lang.label}
                    </Text>
                    {language === lang.code && (
                      <Check size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  settingValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardSecondary,
  },
  languageOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectedLanguageText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
