import { supabase } from './supabase';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (isExpoGo) {
      console.log('[Notifications] Expo Go detected, skipping permission request to avoid crash');
      return false;
    }

    console.log('[Notifications] Requesting permissions');
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission denied');
        return false;
      }

      console.log('[Notifications] Permission granted');
      return true;
    } catch (error) {
      console.warn('[Notifications] Permission request failed:', error);
      return false;
    }
  },

  async getPushToken(): Promise<string | null> {
    if (isExpoGo) {
      console.log('[Notifications] Expo Go detected, skipping push token');
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      if (Platform.OS === 'web') {
        console.log('[Notifications] Web platform, skipping token');
        return null;
      }

      // Get the project ID from app config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.manifest?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn('[Notifications] Project ID not found in app config');
      }

      let token;
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId
        })).data;
      } catch (error) {
        console.warn('[Notifications] Failed to get push token:', error);
        return null;
      }
      
      console.log('[Notifications] Push token:', token);
      return token;
    } catch (error) {
      console.error('[Notifications] Get push token error:', error);
      return null;
    }
  },

  async saveDeviceToken(userId: string, token: string): Promise<void> {
    console.log('[Notifications] Saving device token for user:', userId);
    try {
      const { error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'push_token',
        });

      if (error) {
        console.error('[Notifications] Save device token error:', error);
        // Don't throw, just log
      } else {
        console.log('[Notifications] Device token saved successfully');
      }
    } catch (e) {
      console.error('[Notifications] Save device token exception:', e);
    }
  },

  async registerForPushNotifications(userId: string): Promise<void> {
    const token = await this.getPushToken();
    if (token) {
      await this.saveDeviceToken(userId, token);
    }
  },

  async scheduleLocalNotification(title: string, body: string, data?: any): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null,
      });
      return id;
    } catch (e) {
      console.warn('[Notifications] Schedule local notification failed:', e);
      return "";
    }
  },

  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(handler);
  },

  addNotificationResponseReceivedListener(
    handler: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },
};
