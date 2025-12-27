import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Alert } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/services/auth";
import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService } from "@/services/notifications";
import { revenueCatService } from "@/services/revenueCat";
import { configService } from "@/services/config";
import { initI18n } from '@/i18n/setup';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || !segments.length) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding';

    // Allow access to auth/callback even if not logged in (it handles the login)
    if (segments[0] === 'auth' && segments[1] === 'callback') return;

    // Allow access to reset-password even if not logged in
    if (segments[0] === 'auth' && segments[1] === 'reset-password') return;

    if (!user && !inAuthGroup) {
      router.replace('/onboarding' as any);
    } else if (user) {
      const isProfileComplete = !!user.birthDate;
      const inCompleteProfile = segments[0] === 'auth' && segments[1] === 'complete-profile';

      if (!isProfileComplete) {
        if (!inCompleteProfile) {
          router.replace('/auth/complete-profile' as any);
        }
      } else if (inAuthGroup) {
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, segments, router, navigationState?.key]);
}

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, setUser, completeOnboarding, setAppConfig } = useAppStore();

  useProtectedRoute(user);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 0. Initialize i18n
        await initI18n();

        // 1. Load App Config
        const config = await configService.getAppConfig();
        if (config) {
          setAppConfig(config);
          if (config.maintenance_mode) {
            Alert.alert(
              "Bakım Modu",
              "Uygulamamız şu anda bakım çalışması nedeniyle hizmet verememektedir. Lütfen daha sonra tekrar deneyiniz.",
              [{ text: "Tamam", onPress: () => { } }]
            );
            // Opsiyonel: Kullanıcıyı bakım ekranına yönlendir veya etkileşimi kısıtla
          }
        }

        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding) {
          completeOnboarding();
        }

        const currentUser = await authService.getUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('[RootLayout] Init auth error:', error);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [setUser, completeOnboarding, setAppConfig]);

  useEffect(() => {
    if (!user) return;

    // Register for push notifications
    notificationService.registerForPushNotifications(user.id).catch((err) =>
      console.warn('[Notifications] register error:', err)
    );

    // Initialize RevenueCat with user ID
    revenueCatService.login(user.id).catch((err) =>
      console.warn('[RevenueCat] login error:', err)
    );
  }, [user]);

  useEffect(() => {
    // Initialize RevenueCat on app launch (anonymous)
    revenueCatService.init().catch((err) =>
      console.warn('[RevenueCat] init error:', err)
    );
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0A1A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="fortune/[type]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="fortune/submit/[type]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="fortune/result/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="fortune/loading"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="fortune-tellers"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="content/privacy"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="content/terms"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://05f9ece7068e9c3b70e31102a419019f@o4510608881025024.ingest.de.sentry.io/4510608892035152',
  debug: false,
});

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
