import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Clock, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';
import { fortuneService } from '@/services/fortunes';
import { useAppStore } from '@/store/useAppStore';
import { getFortuneTypeInfo } from '@/constants/fortuneTypes';
import { useTranslation } from 'react-i18next';

type FortuneFilter = 'all' | 'unread';

export default function FortunesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [filter, setFilter] = useState<FortuneFilter>('all');

  const { data: fortunes = [], isLoading, refetch } = useQuery({
    queryKey: ['fortunes', user?.id],
    queryFn: () => user ? fortuneService.getUserFortunes(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  const filters: FortuneFilter[] = ['all', 'unread'];

  const filteredFortunes = filter === 'all' 
    ? fortunes
    : fortunes.filter(f => f.status === 'pending');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const getFortuneTellerName = (fortune: typeof fortunes[0]) => {
    return fortune.fortuneTellerName || t('fortunes.teller');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('fortunes.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {t(`fortunes.filters.${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredFortunes.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Clock size={64} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>{t('fortunes.empty.title')}</Text>
              <Text style={styles.emptyText}>
                {t('fortunes.empty.description')}
              </Text>
            </View>
          ) : (
            filteredFortunes.map((fortune) => {
              const fortuneInfo = getFortuneTypeInfo(fortune.type as any);
              return (
                <TouchableOpacity
                  key={fortune.id}
                  style={styles.fortuneItem}
                  onPress={() => {
                    if (fortune.status === 'completed') {
                      router.push(`/fortune/result/${fortune.id}` as any);
                    }
                  }}
                >
                  <View style={styles.fortuneIconContainer}>
                    <Text style={styles.fortuneIcon}>{fortuneInfo.icon}</Text>
                  </View>

                  <View style={styles.fortuneInfo}>
                    <Text style={styles.fortuneName}>{getFortuneTellerName(fortune)}</Text>
                    <Text style={styles.fortuneDate}>{formatDate(fortune.createdAt)}</Text>
                    {fortune.status === 'pending' && (
                      <Text style={styles.statusText}>{t('fortunes.status.pending')}</Text>
                    )}
                  </View>

                  <View style={styles.fortuneActions}>
                    {!fortune.isRead && fortune.status === 'completed' && (
                      <View style={styles.unreadBadge} />
                    )}
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  fortuneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  fortuneIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  fortuneIcon: {
    fontSize: 28,
  },
  fortuneInfo: {
    flex: 1,
  },
  fortuneName: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  fortuneDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.premium,
    marginTop: 2,
  },
  fortuneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.premium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
