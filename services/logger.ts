import { supabase } from './supabase';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

type LogLevel = 'info' | 'warn' | 'error' | 'critical';

class LoggerService {
  private async log(level: LogLevel, message: string, details?: unknown) {
    // Console log for local debugging
    console.log(`[Logger][${level.toUpperCase()}] ${message}`, details);

    // ─── Sentry Forwarding ──────────────────────────────────────────────────
    // 'error' and 'critical' go to Sentry as exceptions so they appear in Issues
    // 'warn' goes as a message-level warning so it's searchable but less noisy
    if (level === 'error' || level === 'critical') {
      const sentryError =
        details instanceof Error ? details : new Error(message);
      Sentry.captureException(sentryError, {
        level: level === 'critical' ? 'fatal' : 'error',
        extra: typeof details === 'object' && details !== null ? (details as Record<string, unknown>) : { raw: details },
        tags: { log_level: level },
      });
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: typeof details === 'object' && details !== null ? (details as Record<string, unknown>) : { raw: details },
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const payload = {
        level,
        message,
        details: details ? JSON.stringify(details) : null,
        user_id: session?.user?.id || null,
        platform: Platform.OS,
        version: Constants.expoConfig?.version || '1.0.0',
        metadata: {
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      };

      // Fire and forget — don't await strictly to avoid blocking
      supabase
        .from('app_logs')
        .insert(payload)
        .then(({ error }) => {
          if (error && __DEV__) {
            console.warn('[Logger] Upload skipped:', error.message);
          }
        });

    } catch (e) {
      console.error('[Logger] Failed to log:', e);
    }
  }

  info(message: string, details?: unknown) {
    this.log('info', message, details);
  }

  warn(message: string, details?: unknown) {
    this.log('warn', message, details);
  }

  error(message: string, details?: unknown) {
    this.log('error', message, details);
  }

  critical(message: string, details?: unknown) {
    this.log('critical', message, details);
  }
}

export const logger = new LoggerService();
