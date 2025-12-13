import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { User } from 'lucide-react-native';

interface FortuneTellerCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  expertise: string[];
  rating: number;
  views?: number;
  price: number;
  isOnline: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  testID?: string;
}

export default function FortuneTellerCard({
  name,
  avatarUrl,
  expertise,
  rating,
  views,
  price,
  isOnline,
  onPress,
  testID,
}: FortuneTellerCardProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={32} color={Colors.text} />
            )}
          </View>
          <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]} />
        </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{expertise.join(', ')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.star}>⭐</Text>
          </View>
          {typeof views === 'number' && (
            <Text style={styles.views}>
              {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views} Görüntülenme
            </Text>
          )}
          <Text style={styles.price}>• {price} Kredi/Fal</Text>
        </View>
      </View>
    </View>

      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Fal Baktır</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  onlineBadge: {
    backgroundColor: Colors.online,
  },
  offlineBadge: {
    backgroundColor: Colors.offline,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...Typography.subheading,
    color: Colors.text,
    marginBottom: 4,
  },
  specialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  rating: {
    ...Typography.bodyBold,
    color: Colors.premium,
    marginRight: 4,
  },
  star: {
    fontSize: 16,
  },
  views: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  price: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
});
