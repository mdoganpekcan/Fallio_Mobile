import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, User as UserIcon, Bell, Shield, LogOut, ChevronRight, Camera, Edit2 } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/useAppStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profiles';
import { authService } from '@/services/auth';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? profileService.getProfile(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (uri: string) => {
      if (!user) throw new Error(t('auth.errors.user_not_found'));
      return profileService.uploadAvatar(user.id, uri);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      // Global store'u da güncelle ki diğer ekranlarda (örn. tab bar) avatar güncellensin
      const updatedUser = await authService.getUser();
      if (updatedUser) {
        useAppStore.getState().setUser(updatedUser);
      }
    },
  });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(t('auth.errors.error_title'), t('profile.alerts.gallery_permission_error'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        await uploadAvatarMutation.mutateAsync(result.assets[0].uri);
        Alert.alert(t('common.success'), t('profile.alerts.avatar_success'));
      } catch {
        Alert.alert(t('auth.errors.error_title'), t('profile.alerts.avatar_error'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('profile.alerts.logout_title'),
      t('profile.alerts.logout_message'),
      [
        { text: t('profile.alerts.logout_cancel'), style: 'cancel' },
        {
          text: t('profile.alerts.logout_confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              logout();
              router.replace('/auth/login' as any);
            } catch {
              Alert.alert(t('auth.errors.error_title'), t('profile.alerts.logout_error'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t('profile.alerts.delete_account_title'),
      t('profile.alerts.delete_account_message'),
      [
        { text: t('profile.alerts.logout_cancel'), style: 'cancel' },
        {
          text: t('profile.alerts.delete_account_confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              logout();
              router.replace('/auth/login' as any);
            } catch (error) {
              console.error(error);
              Alert.alert(t('auth.errors.error_title'), t('profile.alerts.delete_account_error'));
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Edit2,
      title: t('profile.menu.edit_profile'),
      onPress: () => router.push('/profile/edit' as any),
    },
    {
      icon: UserIcon,
      title: t('profile.menu.account_settings'),
      onPress: () => router.push('/settings' as any),
    },
    {
      icon: Bell,
      title: t('profile.menu.notification_settings'),
      onPress: () => router.push('/notifications' as any),
    },
    {
      icon: Shield,
      title: t('profile.menu.privacy_policy'),
      onPress: () => router.push('/content/privacy' as any),
    },
    {
      icon: Shield,
      title: t('profile.menu.terms_of_use'),
      onPress: () => router.push('/content/terms' as any),
    },
  ];

  const socialLinks = [
    { icon: '📷', label: 'Instagram' },
    { icon: '📘', label: 'Facebook' },
    { icon: '🐦', label: 'Twitter' },
  ];

  if (!user || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const formatBirthDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('profile.common.unspecified');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('profile.common.invalid_date');
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings' as any)}
        >
          <Settings size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <View style={styles.avatar}>
                  {profile.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <UserIcon size={48} color={Colors.text} />
                  )}
                </View>
              </LinearGradient>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <Camera size={20} color={Colors.text} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{profile.fullName}</Text>
            {profile.job ? <Text style={styles.userJob}>{profile.job}</Text> : null}
            {profile.relationshipStatus ? <Text style={styles.userRelation}>{profile.relationshipStatus}</Text> : null}
            <Text style={styles.userBirthDate}>{formatBirthDate(profile.birthDate)}</Text>
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacText}>{t('profile.common.zodiac_sign', { sign: profile.zodiacSign })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <item.icon size={24} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>{t('profile.social.follow_us')}</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { backgroundColor: Colors.card }]}
              >
                <Text style={styles.socialIcon}>{social.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.premium} />
          <Text style={styles.logoutButtonText}>{t('profile.actions.logout')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountText}>{t('profile.actions.delete_account')}</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  },
  userName: {
    ...Typography.title,
    color: Colors.text,
    marginBottom: 4,
  },
  userJob: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 2,
  },
  userRelation: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userBirthDate: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
  menuSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    ...Typography.bodyBold,
    color: Colors.text,
    flex: 1,
  },
  socialSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  socialTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 28,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  logoutButtonText: {
    ...Typography.bodyBold,
    color: Colors.premium,
  },
  deleteAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  deleteAccountText: {
    ...Typography.caption,
    color: Colors.error,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
