import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, UpdateProfileData } from '@/services/profiles';

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);

  const [formData, setFormData] = useState<UpdateProfileData>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? profileService.getProfile(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        bio: profile.bio,
        job: profile.job,
        relationshipStatus: profile.relationshipStatus,
        zodiacSign: profile.zodiacSign,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => {
      if (!user) throw new Error('User not found');
      return profileService.updateProfile(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      Alert.alert('Başarılı', 'Profiliniz güncellendi.');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
      console.error(error);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Save size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meslek</Text>
            <TextInput
              style={styles.input}
              value={formData.job}
              onChangeText={(text) => setFormData({ ...formData, job: text })}
              placeholder="Mesleğiniz"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İlişki Durumu</Text>
            <TextInput
              style={styles.input}
              value={formData.relationshipStatus}
              onChangeText={(text) => setFormData({ ...formData, relationshipStatus: text })}
              placeholder="İlişki Durumunuz (Evli, Bekar, İlişkisi Var...)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Burç</Text>
            <TextInput
              style={styles.input}
              value={formData.zodiacSign}
              onChangeText={(text) => setFormData({ ...formData, zodiacSign: text })}
              placeholder="Burcunuz"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hakkımda</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
