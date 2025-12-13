import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, Filter, X, Search } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import FortuneTellerCard from '@/components/FortuneTellerCard';
import { useQuery } from '@tanstack/react-query';
import { fortuneTellerService, FortuneTellerFilters } from '@/services/fortuneTellers';

export default function FortuneTellersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fortuneType?: string; selectedTellerId?: string }>();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FortuneTellerFilters>({
    specialty: params.fortuneType,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: fortuneTellers = [], isLoading, refetch } = useQuery({
    queryKey: ['fortuneTellers', filters, searchQuery],
    queryFn: () => fortuneTellerService.getFortuneTellers({ ...filters, searchQuery }),
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSelectTeller = (tellerId: string) => {
    if (params.fortuneType) {
      router.push(`/fortune/submit/${params.fortuneType}?tellerId=${tellerId}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Falcılar</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Filter size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Falcı ara..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {fortuneTellers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Falcı bulunamadı</Text>
              </View>
            ) : (
              fortuneTellers.map((teller) => (
                <FortuneTellerCard
                  key={teller.id}
                  {...teller}
                  onPress={() => handleSelectTeller(teller.id)}
                />
              ))
            )}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtreler</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sırala</Text>
              <View style={styles.filterOptions}>
                {(['rating', 'price', 'views'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.filterOption,
                      filters.sortBy === sort && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: sort })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.sortBy === sort && styles.filterOptionTextActive,
                      ]}
                    >
                      {sort === 'rating' ? 'Puan' : sort === 'price' ? 'Fiyat' : 'Görüntülenme'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Puan</Text>
              <View style={styles.filterOptions}>
                {[4.5, 4.7, 4.9].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.filterOption,
                      filters.minRating === rating && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, minRating: rating })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.minRating === rating && styles.filterOptionTextActive,
                      ]}
                    >
                      {rating}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterButton: {
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.heading,
    color: Colors.text,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  applyButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
});
