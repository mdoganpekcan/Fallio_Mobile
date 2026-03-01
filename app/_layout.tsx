// ─── SENTRY: Must be initialized before any other import ───────────────────
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://05f9ece7068e9c3b70e31102a419019f@o4510608881025024.ingest.de.sentry.io/4510608892035152',

  // Tag environment so dev/prod issues are clearly separated in the dashboard
  environment: __DEV__ ? 'development' : 'production',

  // Sample 100% of traces in dev, 20% in production to stay within quotas
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  // Automatically track user sessions (crash-free sessions metric)
  enableAutoSessionTracking: true,

  // Attach JS stack trace to every message-level event
  attachStacktrace: true,

  debug: false,
});
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState, useRef } from "react";
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
import { AppState } from 'react-native';
import { adService } from '@/services/ads';
import * as Linking from 'expo-linking';
import { logger } from "@/services/logger";
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Verileri 5 dakika boyunca "taze" kabul et — gereksiz refetch önlenir
      staleTime: 1000 * 60 * 5,
    },
  },
});

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || !segments.length) return;

    logger.info('[Nav] Check', { segments, user: !!user });
    console.log('[Nav] Segments:', segments, 'User:', !!user);

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding';

    // Allow access to auth/callback even if not logged in (it handles the login)
    if (segments[0] === 'auth' && segments[1] === 'callback') return;

    // Allow access to reset-password even if not logged in
    if (segments[0] === 'auth' && segments[1] === 'reset-password') return;

    if (!user && !inAuthGroup) {
      console.log('[Nav] Redirecting to Onboarding (No User)');
      router.replace('/onboarding' as any);
    } else if (user) {
      const isProfileComplete = !!user.birthDate && !!user.gender;
      const inCompleteProfile = segments[0] === 'auth' && segments[1] === 'complete-profile';

      if (!isProfileComplete) {
        if (!inCompleteProfile) {
          console.log('[Nav] Redirecting to Complete Profile');
          router.replace('/auth/complete-profile' as any);
        }
      } else if (inAuthGroup) {
        console.log('[Nav] Redirecting to Tabs (User Logged In)');
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, segments, router, navigationState?.key]);
}

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user, setUser, completeOnboarding, setAppConfig } = useAppStore();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const processedNotificationIds = useRef<Set<string>>(new Set());

  useProtectedRoute(user);

  useEffect(() => {
    const initAuth = async () => {
      // Safety Timeout to ensure Splash Screen doesn't hang forever
      const safetyTimeout = setTimeout(() => {
        console.warn('[RootLayout] InitAuth timed out - Forcing Splash Hide');
        setIsLoading(false);
        SplashScreen.hideAsync();
      }, 8000); // 8 seconds max wait

      try {
        logger.info('[RootLayout] Starting initAuth...');
        
        // 0. Initialize i18n (Must happen first for UI translations)
        await initI18n();

        // [OPTIMIZATION]: Parallelize AppConfig (Network), Onboarding (Disk), and User Auth (Network)
        const [config, hasSeenOnboarding, currentUser] = await Promise.all([
          configService.getAppConfig(),
          AsyncStorage.getItem('hasSeenOnboarding'),
          authService.getUser()
        ]);

        // 1. Process App Config
        if (config) {
          setAppConfig(config);
          if (config.maintenance_mode) {
            Alert.alert(
              "Bakım Modu",
              "Uygulamamız şu anda bakım çalışması nedeniyle hizmet verememektedir. Lütfen daha sonra tekrar deneyiniz.",
              [{ text: "Tamam", onPress: () => { } }]
            );
          }
        }

        // 2. Process Onboarding State
        if (hasSeenOnboarding) {
          completeOnboarding();
        }

        // 3. Process Authentication State
        if (currentUser) {
          setUser(currentUser);
          // Bind user identity to Sentry so every subsequent event is tagged
          Sentry.setUser({ id: currentUser.id, email: currentUser.email });
        }
        
        logger.info('[RootLayout] initAuth completed successfully (Parallelized)');
      } catch (error) {
        console.error('[RootLayout] Init auth error:', error);
        logger.error('Init Auth Failed', { error });
      } finally {
        clearTimeout(safetyTimeout);
        setIsLoading(false);
        // Ensure this runs
        setTimeout(() => SplashScreen.hideAsync(), 100); 
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        // Keep Sentry user context in sync with auth state changes
        Sentry.setUser({ id: user.id, email: user.email });
      } else {
        // Clear user context on logout — no PII leak after sign-out
        Sentry.setUser(null);
      }
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
    if (isLoading) return;

    const handleNotificationPayload = (response: Notifications.NotificationResponse) => {
      const notificationId = response.notification.request.identifier;
      if (processedNotificationIds.current.has(notificationId)) {
        console.log('[Notifications] Already processed notification:', notificationId);
        return;
      }

      processedNotificationIds.current.add(notificationId);
      const data = response.notification.request.content.data;
      if (data?.url) {
        console.log('[Notifications] Deep linking to:', data.url);
        router.push(data.url as any);
      }
    };

    // 1. Check for cold-start notification (app was killed)
    if (lastNotificationResponse) {
      handleNotificationPayload(lastNotificationResponse);
    }

    // 2. Listen for push notification clicks while app is in background/foreground
    const responseListener = notificationService.addNotificationResponseReceivedListener(handleNotificationPayload);

    return () => {
      responseListener.remove();
    };
  }, [isLoading, lastNotificationResponse, router]);

  useEffect(() => {
    // Initialize RevenueCat on app launch (anonymous)
    revenueCatService.init().catch((err) =>
      console.warn('[RevenueCat] init error:', err)
    );

     // App Resume Ad Logic
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
         // App came to foreground - Trigger Ad asynchronously without blocking
         console.log('[Ad] App resumed, attempting to show interstitial...');
         adService.showInterstitial().catch(e => {
             console.warn('[Ad] Resume Ad failed:', e);
         });
      }
    });

    // ULTRATHINK GLOBAL DEEP LINK LISTENER
    // This ensures we catch the Auth redirect even if WebBrowser doesn't resolve immediately
    logger.info('[RootLayout] Mounting Global Deep Link Listener');
    const linkingSubscription = Linking.addEventListener('url', (event) => {
        console.log('[RootLayout] Deep Link received:', event.url);
        logger.info('[RootLayout] Deep Link received', { url: event.url });
        if (event.url.includes('auth/callback')) {
            authService.handleAuthUrl(event.url);
        }
    });

    return () => {
      subscription.remove();
      linkingSubscription.remove();
    };
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
