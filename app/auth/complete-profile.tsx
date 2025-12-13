import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, User as UserIcon } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { calculateZodiacSign } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/auth';

type Gender = 'male' | 'female' | 'other';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBirthDateChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4, 8);
    }
    
    setBirthDate(cleaned);
  };

  const handleSave = async () => {
    if (!birthDate || birthDate.length !== 10 || !gender) {
      Alert.alert('Hata', 'Lütfen geçerli bir doğum tarihi ve cinsiyet giriniz.');
      return;
    }

    setLoading(true);
    try {
      const [day, month, year] = birthDate.split('.');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const zodiacSign = calculateZodiacSign(isoDate);

      if (!user?.id) throw new Error('Kullanıcı bulunamadı');

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          birthdate: isoDate,
          gender: gender
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update users table for zodiac
      const { error: userError } = await supabase
        .from('users')
        .update({
          zodiac_sign: zodiacSign
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Refresh user data in store
      const updatedUser = await authService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#1A1625']}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Profilini Tamamla</Text>
            <Text style={styles.subtitle}>
              Size özel fal yorumları yapabilmemiz için doğum tarihi ve cinsiyet bilgilerinize ihtiyacımız var.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doğum Tarihi (GG.AA.YYYY)</Text>
              <View style={styles.inputContainer}>
                <Calendar color={Colors.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="01.01.1990"
                  placeholderTextColor={Colors.textSecondary}
                  value={birthDate}
                  onChangeText={handleBirthDateChange}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cinsiyet</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'female' && styles.genderTextActive,
                    ]}
                  >
                    Kadın
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'male' && styles.genderTextActive,
                    ]}
                  >
                    Erkek
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'other' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('other')}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'other' && styles.genderTextActive,
                    ]}
                  >
                    Diğer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  form: {
    gap: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...Typography.body,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
  },
  genderText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.text,
    ...Typography.h3,
    fontWeight: '600',
  },
});
