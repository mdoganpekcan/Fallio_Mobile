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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Mail, Lock, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateZodiacSign } from '@/types';
import { authService } from '@/services/auth';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';

type Gender = 'male' | 'female' | 'other';

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [zodiac, setZodiac] = useState<string>('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!fullName || !email || !password || !birthDate || !gender) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      const [day, month, year] = birthDate.split('.');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      return authService.signUp({
        email,
        password,
        fullName,
        birthDate: isoDate,
        gender,
        avatarUrl: avatarUri || undefined,
      });
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
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt sırasında bir hata oluştu');
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
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
    { value: 'female', label: 'Kadın' },
    { value: 'male', label: 'Erkek' },
    { value: 'other', label: 'Diğer' },
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
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Falio ailesine hoş geldin</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                {avatarUri ? (
                  <View style={styles.avatar}>
                    <View style={styles.avatarImageContainer}>
                      <Text style={styles.avatarPlaceholder}>👤</Text>
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
              <Text style={styles.avatarText}>Profil Fotoğrafı Ekle</Text>
            </View>

            <Text style={styles.label}>Ad Soyad</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad ve soyadını gir"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>E-posta</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresini gir"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre oluştur"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Doğum Tarihi</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="GG.AA.YYYY"
                placeholderTextColor={Colors.textMuted}
                value={birthDate}
                onChangeText={handleBirthDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {zodiac ? (
              <View style={styles.zodiacContainer}>
                <Text style={styles.zodiacLabel}>Burcunuz:</Text>
                <View style={styles.zodiacBadge}>
                  <Text style={styles.zodiacText}>{zodiac}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>Cinsiyet</Text>
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
                  {registerMutation.isPending ? 'Kaydediliyor...' : 'Devam Et'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.legal}>
              Devam ederek <Text style={styles.legalLink}>Kullanım Koşulları</Text> ve{' '}
              <Text style={styles.legalLink}>Gizlilik Politikası</Text>&apos;nı kabul etmiş olursunuz.
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Giriş Yap</Text>
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
