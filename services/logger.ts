import { supabase } from './supabase';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type LogLevel = 'info' | 'warn' | 'error' | 'critical';

class LoggerService {
  private async log(level: LogLevel, message: string, details?: any) {
    // Console log for local debugging
    console.log(`[Logger][${level.toUpperCase()}] ${message}`, details);
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const payload = {
            level,
            message,
            details: details ? JSON.stringify(details) : null,
            user_id: session?.user?.id || null,
            platform: Platform.OS,
            version: Constants.expoConfig?.version || '1.0.0',
            // Add device model for better debugging
            metadata: {
                modelName: Device.modelName,
                osVersion: Device.osVersion,
            }
        };

        // Fire and forget - don't await strictly unless critical
        supabase
            .from('app_logs' as any)
            .insert(payload)
            .then(({ error }) => {
                if (error) console.error('[Logger] Failed to upload log:', error);
            });

    } catch (e) {
        console.error('[Logger] Failed to log:', e);
    }
  }

  info(message: string, details?: any) {
    this.log('info', message, details);
  }

  warn(message: string, details?: any) {
    this.log('warn', message, details);
  }

  error(message: string, details?: any) {
    this.log('error', message, details);
  }
  
  critical(message: string, details?: any) {
     this.log('critical', message, details);
  }
}

export const logger = new LoggerService();
