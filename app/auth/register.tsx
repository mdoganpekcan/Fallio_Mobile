import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Mail, Lock, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateZodiacSign } from '@/types';
import { authService } from '@/services/auth';
import { profileService } from '@/services/profiles';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation, Trans } from 'react-i18next';
import { imageService } from '@/services/image';

type Gender = 'male' | 'female' | 'other';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [birth_date, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [zodiac, setZodiac] = useState<string>('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!fullName || !email || !password || !birth_date || !gender) {
        throw new Error(t('auth.errors.fill_all_fields'));
      }

      const [day, month, year] = birth_date.split('.');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // 1. Önce avatar olmadan kayıt ol
      const authResponse = await authService.signUp({
        email,
        password,
        fullName,
        birth_date: isoDate,
        gender,
        avatarUrl: undefined, // Yerel dosya yolunu gönderme
      });

      // 2. Eğer avatar seçildiyse ve kullanıcı oluştuysa yükle
      // Not: authResponse.user.id Supabase Auth ID'sidir.
      const userId = authResponse?.user?.id;
      
      if (avatarUri && userId) {
        try {
          console.log('[Register] Uploading avatar for user:', userId);
          await profileService.uploadAvatar(userId, avatarUri);
          // uploadAvatar zaten profili güncelliyor
        } catch (uploadError) {
          console.error('[Register] Avatar upload failed:', uploadError);
          // Avatar yüklenemese bile kayıt başarılı sayılır, kullanıcıya devam etmesi için izin ver
        }
      }

      return authResponse;
    },
    onSuccess: async () => {
      console.log('[Register] Success');
      const currentUser = await authService.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
      router.replace('/(tabs)' as any);
    },
    onError: (error: Error) => {
      console.error('[Register] Error:', error);
      let message = error.message || t('auth.errors.register_error');
      
      if (message.includes('duplicate key') || message.includes('users_email_key')) {
        message = t('auth.errors.email_in_use');
      }

      Alert.alert(t('auth.errors.register_error_title'), message);
    },
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          const compressed = await imageService.compressImage(result.assets[0].uri, { maxWidth: 500 });
          setAvatarUri(compressed.uri);
        } catch (error) {
          console.error('Compression error:', error);
          setAvatarUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert(t('auth.errors.error_title'), t('auth.errors.gallery_error'));
    }
  };

  const handleBirthDateChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4, 8);
    }
    
    setBirthDate(cleaned);

    if (cleaned.length === 10) {
      const [day, month, year] = cleaned.split('.');
      if (day && month && year && year.length === 4) {
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const calculatedZodiac = calculateZodiacSign(isoDate);
        setZodiac(calculatedZodiac);
      }
    } else {
      setZodiac('');
    }
  };

  const genders: { value: Gender; label: string }[] = [
    { value: 'female', label: t('auth.genders.female') },
    { value: 'male', label: t('auth.genders.male') },
    { value: 'other', label: t('auth.genders.other') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.create_account')}</Text>
            <Text style={styles.subtitle}>{t('auth.welcome_family')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                {avatarUri ? (
                  <View style={styles.avatar}>
                    <View style={styles.avatarImageContainer}>
                      {/* Use a simple Image component here, make sure to import Image from react-native */}
                      <Image 
                        source={{ uri: avatarUri }} 
                        style={{ width: '100%', height: '100%', borderRadius: BorderRadius.full }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.avatar}>
                    <User size={48} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Camera size={20} color={Colors.text} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarText}>{t('auth.add_profile_photo')}</Text>
            </View>

            <Text style={styles.label}>{t('auth.full_name')}</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.enter_full_name')}
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>{t('common.email')}</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.enter_email')}
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>{t('common.password')}</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.create_password')}
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>{t('auth.birth_date')}</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.date_format')}
                placeholderTextColor={Colors.textMuted}
                value={birth_date}
                onChangeText={handleBirthDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {zodiac ? (
              <View style={styles.zodiacContainer}>
                <Text style={styles.zodiacLabel}>{t('auth.zodiac_sign')}</Text>
                <View style={styles.zodiacBadge}>
                  <Text style={styles.zodiacText}>{zodiac}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>{t('auth.gender')}</Text>
            <View style={styles.genderContainer}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.genderButton,
                    gender === g.value && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender(g.value)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === g.value && styles.genderButtonTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => registerMutation.mutate()}
              disabled={registerMutation.isPending}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>
                  {registerMutation.isPending ? t('auth.registering') : t('auth.continue')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.legal}>
              <Trans i18nKey="auth.legal_text">
                Devam ederek <Text style={styles.legalLink}>Kullanım Koşulları</Text> ve{' '}
                <Text style={styles.legalLink}>Gizlilik Politikası</Text>&apos;nı kabul etmiş olursunuz.
              </Trans>
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.have_account_question')} </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>{t('auth.login_action')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  avatarImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    fontSize: 64,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  avatarText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    height: '100%',
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  zodiacLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  zodiacBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.full,
  },
  zodiacText: {
    ...Typography.bodyBold,
    color: Colors.premium,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardSecondary,
  },
  genderButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  genderButtonTextActive: {
    color: Colors.primary,
  },
  registerButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
  legal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  legalLink: {
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
