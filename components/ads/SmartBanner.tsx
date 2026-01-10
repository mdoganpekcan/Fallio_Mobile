import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Colors } from '@/constants/theme';

interface SmartBannerProps {
  unitId?: string;
  size?: BannerAdSize;
  style?: any;
}

export function SmartBanner({ unitId, size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, style }: SmartBannerProps) {
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Use Test ID if no specific unit ID is provided (for safety/development)
  // In production, this falls back to provided ID
  const adUnitId = unitId || TestIds.BANNER;

  const handleAdFailedToLoad = (err: any) => {
    console.log('[SmartBanner] Failed to load:', err);
    setError(true);
  };

  const handleAdLoaded = () => {
    setLoaded(true);
    setError(false);
  };

  if (error) return null; // Hide if error specifically

  return (
      <View style={[styles.container, style, !loaded && { minHeight: 0 }]}>
        <BannerAd
          unitId={adUnitId}
          size={size}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={handleAdFailedToLoad}
          onAdLoaded={handleAdLoaded}
        />
        {/* Placeholder or padding logic could go here if needed to prevent layout shifts, 
            but standard usually recommends starting with 0 height or specific height */}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    overflow: 'hidden',
  },
});
