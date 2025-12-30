import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { Play, Square, Volume2, VolumeX } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface FortuneAudioPlayerProps {
  text: string;
  language?: string;
}

export const FortuneAudioPlayer: React.FC<FortuneAudioPlayerProps> = ({ text, language = 'tr' }) => {
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Stop speaking on unmount
      Speech.stop();
    };
  }, []);

  const handleTogglePlay = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    setLoading(true);
    try {
      // Clean up markdown/extra characters before speaking
      const cleanText = text.replace(/[*_#]/g, '').substring(0, 4000); // Limit length for TTS

      Speech.speak(cleanText, {
        language: language === 'tr' ? 'tr-TR' : 'en-US',
        pitch: 0.9, // Slightly deeper for mystical feel
        rate: 0.9,  // Slightly slower for better understanding
        onStart: () => {
          setLoading(false);
          setSpeaking(true);
        },
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: (error) => {
          console.error('[TTS] Error:', error);
          setSpeaking(false);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('[TTS] Exception:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Volume2 size={20} color={Colors.primary} />
        <Text style={styles.title}>{t('fortune.result.listen_fortune') || 'Falı Sesli Dinle'}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.playerButton, speaking && styles.playerButtonActive]} 
        onPress={handleTogglePlay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.text} />
        ) : speaking ? (
          <>
            <Square size={20} color={Colors.text} fill={Colors.text} />
            <Text style={styles.buttonText}>{t('common.stop') || 'Durdur'}</Text>
          </>
        ) : (
          <>
            <Play size={20} color={Colors.text} fill={Colors.text} />
            <Text style={styles.buttonText}>{t('common.play') || 'Dinle'}</Text>
          </>
        )}
      </TouchableOpacity>
      
      {speaking && (
        <Text style={styles.statusText}>
          {t('fortune.result.speaking') || 'Falcı yorumunu seslendiriyor...'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)', // Suble primary border
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  playerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 140,
    justifyContent: 'center',
  },
  playerButtonActive: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.premium,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
