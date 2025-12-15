import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Upload } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFortuneTypeInfo, FortuneType } from '@/constants/fortuneTypes';
import { useMutation } from '@tanstack/react-query';
import { fortuneService } from '@/services/fortunes';
import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/services/wallet';
import { supabase } from '@/services/supabase';

export default function FortuneSubmitScreen() {
  const router = useRouter();
  const { type, tellerId } = useLocalSearchParams<{ type: string; tellerId?: string | string[] }>();
  const fortuneInfo = getFortuneTypeInfo(type as FortuneType);
  const user = useAppStore((state) => state.user);
  const appConfig = useAppStore((state) => state.appConfig);
  const updateUserCredits = useAppStore((state) => state.updateUserCredits);
  const selectedTellerId = Array.isArray(tellerId) ? tellerId[0] : tellerId;
  
  const [images, setImages] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Lütfen giriş yapın');
      }

      const requiredImages = type === 'coffee' ? 3 : type === 'palm' ? 1 : 0;
      if (requiredImages > 0 && images.length < requiredImages) {
        throw new Error('Gerekli tüm fotoğrafları ekleyin');
      }

      const creditCost = appConfig?.fortune_costs?.[type as FortuneType] ?? fortuneInfo.credit;
      let isFree = false;

      // Günlük Ücretsiz Fal Kontrolü
      if (appConfig?.daily_free_fortune_limit && appConfig.daily_free_fortune_limit > 0) {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
          .from('daily_free_usages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('usage_date', today);
        
        if (!error && count !== null && count < appConfig.daily_free_fortune_limit) {
          isFree = true;
        }
      }

      const wallet = await walletService.getWallet(user.id);
      if (!isFree && wallet.credits < creditCost) {
        throw new Error('Yeterli krediniz yok. Lütfen kredi satın alın.');
      }

      const metaDetails: string[] = [];
      const metadata: Record<string, any> = {};

      if (type === 'tarot' && selectedCards.length > 0) {
        metaDetails.push(`Seçilen kartlar: ${selectedCards.map((c) => c + 1).join(', ')}`);
        metadata.selected_cards = selectedCards.map((c) => c + 1);
      }
      if (type === 'color' && selectedColor) {
        metaDetails.push(`Seçilen renk: ${selectedColor}`);
        metadata.selected_color = selectedColor;
      }
      if (type === 'dream' && category) {
        metaDetails.push(`Kategori: ${category}`);
        metadata.category = category;
      }
      const composedNote = [note.trim(), ...metaDetails].filter(Boolean).join('\n');

      const fortune = await fortuneService.createFortune({
        userId: user.id,
        type: type as FortuneType,
        fortuneTellerId: selectedTellerId,
        images,
        note: composedNote,
        metadata,
      });

      if (isFree) {
        // Ücretsiz kullanım hakkını düş
        await supabase.from('daily_free_usages').insert({
          user_id: user.id,
          fortune_type: type,
          usage_date: new Date().toISOString().split('T')[0]
        });
      } else {
        // Krediden düş
        const newCredits = wallet.credits - creditCost;
        await walletService.updateCredits(user.id, -creditCost);
        updateUserCredits(newCredits);
      }

      return fortune;
    },
    onSuccess: (fortune) => {
      console.log('[FortuneSubmit] Success:', fortune.id);
      router.replace(`/fortune/result/${fortune.id}` as any);
    },
    onError: (error: Error) => {
      console.error('[FortuneSubmit] Error:', error);
      Alert.alert('Hata', error.message || 'Fal gönderilirken bir hata oluştu', [
        {
          text: 'Kapat',
          style: 'cancel',
        },
        {
          text: 'Kredi Satın Al',
          onPress: () => router.push('/credits' as any),
        },
      ]);
    },
  });

  const pickImage = async () => {
    const requiredImages = type === 'coffee' ? 3 : type === 'palm' ? 1 : 6;
    if (images.length >= requiredImages) {
      Alert.alert('Bilgi', 'Yeterli sayıda fotoğraf eklediniz.');
      return;
    }

    Alert.alert('Fotoğraf Yükle', 'Fotoğrafı nasıl yüklemek istersiniz?', [
      {
        text: 'Kamera',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== 'granted') {
            Alert.alert('Hata', 'Kamera izni gerekli.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setImages([...images, result.assets[0].uri]);
          }
        },
      },
      {
        text: 'Galeri',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setImages([...images, result.assets[0].uri]);
          }
        },
      },
      {
        text: 'İptal',
        style: 'cancel',
      },
    ]);
  };

  const renderImageUpload = () => {
    const imageCount = type === 'coffee' ? 3 : type === 'palm' ? 1 : 0;
    
    if (imageCount === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {type === 'coffee' ? 'Fotoğraflar' : 'Fotoğraf'}
        </Text>
        <View style={styles.imageGrid}>
          {Array.from({ length: imageCount }).map((_, index) => {
            const hasImage = images[index];
            return (
              <TouchableOpacity
                key={index}
                style={[styles.imageUploadBox, hasImage && styles.imageUploadBoxFilled]}
                onPress={pickImage}
              >
                {hasImage ? (
                  <Image source={{ uri: hasImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Upload size={32} color={Colors.textSecondary} />
                    <Text style={styles.imageUploadText}>
                      {type === 'coffee' && index === 0 && 'Fincan İçi'}
                      {type === 'coffee' && index === 1 && 'Fincan Tabağı'}
                      {type === 'coffee' && index === 2 && 'Genel Görünüm'}
                      {type === 'palm' && 'El Fotoğrafı'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );

  };

  const renderTarotCards = () => {
    if (type !== 'tarot') return null;

    const cards = Array.from({ length: 6 }, (_, i) => i);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kart Seç (3 Adet)</Text>
        <Text style={styles.description}>Kalbinizin sesini dinleyerek 3 kart seçin</Text>
        <View style={styles.cardGrid}>
          {cards.map((cardIndex) => (
            <TouchableOpacity
              key={cardIndex}
              style={[
                styles.tarotCard,
                selectedCards.includes(cardIndex) && styles.tarotCardSelected,
              ]}
              onPress={() => {
                if (selectedCards.includes(cardIndex)) {
                  setSelectedCards(selectedCards.filter(c => c !== cardIndex));
                } else if (selectedCards.length < 3) {
                  setSelectedCards([...selectedCards, cardIndex]);
                }
              }}
            >
              <Text style={styles.cardIcon}>🃏</Text>
              {selectedCards.includes(cardIndex) && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{selectedCards.indexOf(cardIndex) + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderColorPicker = () => {
    if (type !== 'color') return null;

    const colors = [
      { name: 'Kırmızı', value: '#FF0000' },
      { name: 'Turuncu', value: '#FF7F00' },
      { name: 'Sarı', value: '#FFFF00' },
      { name: 'Yeşil', value: '#00FF00' },
      { name: 'Mavi', value: '#0000FF' },
      { name: 'Lacivert', value: '#4B0082' },
      { name: 'Mor', value: '#9400D3' },
      { name: 'Pembe', value: '#FF69B4' },
      { name: 'Kahverengi', value: '#8B4513' },
      { name: 'Siyah', value: '#000000' },
      { name: 'Beyaz', value: '#FFFFFF' },
      { name: 'Gri', value: '#808080' },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Renk Seç</Text>
        <Text style={styles.description}>Size en yakın gelen rengi seçin</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorBox,
                { backgroundColor: color.value },
                selectedColor === color.value && styles.colorBoxSelected,
              ]}
              onPress={() => setSelectedColor(color.value)}
            >
              {color.value === '#FFFFFF' && <View style={styles.whiteBorder} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCategoryPicker = () => {
    if (type !== 'dream') return null;

    const categories = ['Aşk', 'Para', 'Aile', 'İş', 'Sağlık'];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategori Seç</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{fortuneInfo.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageUpload()}
        {renderTarotCards()}
        {renderColorPicker()}
        {renderCategoryPicker()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {type === 'dream' ? 'Rüyanı Anlat' : 'Not (Opsiyonel)'}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={
              type === 'dream'
                ? 'Rüyanızı detaylı bir şekilde anlatın...'
                : type === 'tarot'
                ? 'Niyetinizi veya sorunuzu yazın...'
                : 'Falınızla ilgili not ekleyebilirsiniz...'
            }
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.creditSection}>
          <View style={styles.creditInfo}>
            <Text style={styles.creditIcon}>💎</Text>
            <Text style={styles.creditText}>Gerekli Kredi: {fortuneInfo.credit}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMiddle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.submitButtonText}>
                {submitMutation.isPending ? 'Gönderiliyor...' : 'Falını Gönder'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  imageUploadBox: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    overflow: 'hidden',
  },
  imageUploadBoxFilled: {
    borderStyle: 'solid',
    padding: 0,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageUploadText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    minHeight: 120,
  },
  creditSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  creditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  creditIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  creditText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
  },
  submitButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tarotCard: {
    width: '30%',
    aspectRatio: 0.7,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  tarotCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardSecondary,
  },
  cardIcon: {
    fontSize: 48,
  },
  cardBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadgeText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: 'bold' as const,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorBox: {
    width: '21%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  colorBoxSelected: {
    borderColor: Colors.primary,
    ...Shadows.large,
  },
  whiteBorder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardSecondary,
  },
  categoryButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.primary,
  },
});
