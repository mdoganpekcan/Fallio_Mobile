import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Clock, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fortuneService } from '@/services/fortunes';
import { useAppStore } from '@/store/useAppStore';
import { getFortuneTypeInfo } from '@/constants/fortuneTypes';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/Skeleton';
import { Fortune } from '@/types';

const PAGE_SIZE = 15;

type FortuneFilter = 'all' | 'unread';

export default function FortunesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [filter, setFilter] = useState<FortuneFilter>('all');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['fortunes', user?.id],
    queryFn: ({ pageParam = 0 }) =>
      user
        ? fortuneService.getUserFortunes(user.id, pageParam as number, PAGE_SIZE)
        : Promise.resolve([]),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // No more pages when the returned array is smaller than PAGE_SIZE
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled: !!user,
  });

  // Flatten all pages into a single array
  const allFortunes: Fortune[] = data?.pages.flat() ?? [];

  const filteredFortunes =
    filter === 'all'
      ? allFortunes
      : allFortunes.filter((f) => f.status === 'pending');

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  const filters: FortuneFilter[] = ['all', 'unread'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const getFortuneTellerName = (fortune: Fortune) => {
    return fortune.fortuneTellerName || t('fortunes.teller');
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item: fortune }: { item: Fortune }) => {
    const fortuneInfo = getFortuneTypeInfo(fortune.type as Parameters<typeof getFortuneTypeInfo>[0]);
    return (
      <TouchableOpacity
        style={styles.fortuneItem}
        onPress={() => {
          if (fortune.status === 'completed') {
            router.push(`/fortune/result/${fortune.id}` as Parameters<typeof router.push>[0]);
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
  };

  const renderSkeletonLoader = () => (
    <View style={styles.scrollView}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.fortuneItem}>
          <Skeleton width={56} height={56} borderRadius={BorderRadius.md} style={{ marginRight: Spacing.md }} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="50%" height={18} />
            <Skeleton width="30%" height={14} />
          </View>
          <Skeleton width={20} height={20} borderRadius={10} />
        </View>
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Clock size={64} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t('fortunes.empty.title')}</Text>
      <Text style={styles.emptyText}>{t('fortunes.empty.description')}</Text>
    </View>
  );

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
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={filteredFortunes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredFortunes.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
        />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  listContentEmpty: {
    flex: 1,
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
    flex: 1,
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
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
