import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fortuneService } from '@/services/fortunes';
import { fortuneTellerService } from '@/services/fortuneTellers';
import { getFortuneTypeInfo } from '@/constants/fortuneTypes';

import Markdown from 'react-native-markdown-display';

export default function FortuneResultScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userRating, setUserRating] = useState<1 | -1 | null>(null);

  const { data: fortune, isLoading } = useQuery({
    queryKey: ['fortune', id],
    queryFn: () => fortuneService.getFortuneById(id!),
    enabled: !!id,
  });

  const { data: fortuneTeller } = useQuery({
    queryKey: ['fortuneTeller', fortune?.fortuneTellerId],
    queryFn: () => fortuneTellerService.getFortuneTellerById(fortune!.fortuneTellerId!),
    enabled: !!fortune?.fortuneTellerId,
  });

  const rateMutation = useMutation({
    mutationFn: (rating: 1 | -1) => fortuneService.rateFortuneResponse(id!, rating),
    onSuccess: (_, rating) => {
      setUserRating(rating);
      queryClient.invalidateQueries({ queryKey: ['fortune', id] });
    },
  });

  useEffect(() => {
    if (fortune && !fortune.isRead) {
      fortuneService.markAsRead(id!);
      queryClient.invalidateQueries({ queryKey: ['fortunes'] });
    }
  }, [fortune, id, queryClient]);

  if (isLoading || !fortune) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const fortuneInfo = getFortuneTypeInfo(fortune.type as any);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Falio - ${fortuneInfo.name}\n\n${fortune.result}`,
      });
    } catch {
      return;
    }
  };

  const handleRate = (rating: 1 | -1) => {
    if (fortune.status !== 'completed') {
      Alert.alert('Bilgi', 'Fal sonucu tamamlandığında oylama yapabilirsiniz.');
      return;
    }
    rateMutation.mutate(rating);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fal Sonucu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.fortuneTellerSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🔮</Text>
          </View>
          <Text style={styles.fortuneTellerName}>
            {fortuneTeller?.name || 'Falcı'}
          </Text>
          <Text style={styles.fortuneType}>{fortuneInfo.name}</Text>
          <Text style={styles.fortuneDate}>{formatDate(fortune.createdAt)}</Text>
          <Text style={styles.fortuneStatus}>
            {fortune.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
          </Text>
        </View>

        <View style={styles.resultCard}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <Markdown
            style={{
              body: { color: Colors.text, fontSize: 16, lineHeight: 24 },
              heading1: { color: Colors.primary, marginVertical: 10 },
              heading2: { color: Colors.text, marginVertical: 8 },
              strong: { color: Colors.primary, fontWeight: 'bold' },
            }}
          >
            {fortune.result || 'Fal yorumu bekleniyor...'}
          </Markdown>
        </View>

        {fortune.result && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Yorumu nasıl buldun?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  userRating === 1 && styles.ratingButtonActive,
                ]}
                onPress={() => handleRate(1)}
                disabled={rateMutation.isPending || fortune.status !== 'completed'}
              >
                <ThumbsUp size={24} color={Colors.success} />
                <Text style={[styles.ratingButtonText, { color: Colors.success }]}>Beğendim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  userRating === -1 && styles.ratingButtonActive,
                ]}
                onPress={() => handleRate(-1)}
                disabled={rateMutation.isPending || fortune.status !== 'completed'}
              >
                <ThumbsDown size={24} color={Colors.error} />
                <Text style={[styles.ratingButtonText, { color: Colors.error }]}>Beğenmedim</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.push(`/fortune/${fortune.type}` as any)}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryButtonGradient}
          >
            <Text style={styles.retryButtonText}>Yeniden Fal Baktır</Text>
          </LinearGradient>
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
  scrollView: {
    flex: 1,
  },
  fortuneTellerSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  avatarText: {
    fontSize: 40,
  },
  fortuneTellerName: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: 4,
  },
  fortuneType: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fortuneStatus: {
    ...Typography.caption,
    color: Colors.premium,
    marginTop: 4,
  },
  fortuneDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  resultCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  shareButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    paddingRight: Spacing.xl,
  },
  ratingSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  ratingTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  ratingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonActive: {
    borderColor: Colors.primary,
  },
  ratingButtonText: {
    ...Typography.bodyBold,
  },
  retryButton: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  retryButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
