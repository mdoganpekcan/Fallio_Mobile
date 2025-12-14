import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, ChevronDown, X } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, UpdateProfileData } from '@/services/profiles';
import { calculateZodiacSign, zodiacSigns } from '@/types';

const RELATIONSHIP_STATUSES = [
  'İlişkisi Yok',
  'İlişkisi Var',
  'Nişanlı',
  'Evli',
  'Karmaşık',
  'Platonik',
  'Ayrılmış',
  'Dul',
];

const GENDERS = [
  { label: 'Kadın', value: 'female' },
  { label: 'Erkek', value: 'male' },
  { label: 'Diğer', value: 'other' },
];

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: string[] | { label: string; value: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SelectionModal = ({ visible, title, options, onSelect, onClose }: SelectionModalProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => (typeof item === 'string' ? item : item.value)}
          renderItem={({ item }) => {
            const label = typeof item === 'string' ? item : item.label;
            const value = typeof item === 'string' ? item : item.value;
            return (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(value);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  </Modal>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);

  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: any[];
    field: keyof UpdateProfileData | null;
  }>({
    visible: false,
    title: '',
    options: [],
    field: null,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? profileService.getProfile(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        bio: profile.bio,
        job: profile.job,
        relationshipStatus: profile.relationshipStatus,
        zodiacSign: profile.zodiacSign,
        birthDate: profile.birthDate,
        gender: profile.gender,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => {
      if (!user) throw new Error('User not found');
      return profileService.updateProfile(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      Alert.alert('Başarılı', 'Profiliniz güncellendi.');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
      console.error(error);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleBirthDateChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4, 8);
    }

    const newData = { ...formData, birthDate: cleaned };
    
    // Auto-calculate zodiac if date is valid
    if (cleaned.length === 10) {
      const [day, month, year] = cleaned.split('.');
      const isoDate = `${year}-${month}-${day}`;
      const zodiac = calculateZodiacSign(isoDate);
      newData.zodiacSign = zodiac;
    }

    setFormData(newData);
  };

  const openModal = (field: keyof UpdateProfileData, title: string, options: any[]) => {
    setModalConfig({ visible: true, title, options, field });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Save size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={styles.label}>Doğum Tarihi</Text>
              <TextInput
                style={styles.input}
                value={formData.birthDate}
                onChangeText={handleBirthDateChange}
                placeholder="GG.AA.YYYY"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
              <Text style={styles.label}>Cinsiyet</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => openModal('gender', 'Cinsiyet Seçin', GENDERS)}
              >
                <Text style={[styles.selectText, !formData.gender && styles.placeholderText]}>
                  {GENDERS.find(g => g.value === formData.gender)?.label || 'Seçiniz'}
                </Text>
                <ChevronDown size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meslek</Text>
            <TextInput
              style={styles.input}
              value={formData.job}
              onChangeText={(text) => setFormData({ ...formData, job: text })}
              placeholder="Mesleğiniz"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İlişki Durumu</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => openModal('relationshipStatus', 'İlişki Durumu Seçin', RELATIONSHIP_STATUSES)}
            >
              <Text style={[styles.selectText, !formData.relationshipStatus && styles.placeholderText]}>
                {formData.relationshipStatus || 'Seçiniz'}
              </Text>
              <ChevronDown size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Burç</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => openModal('zodiacSign', 'Burç Seçin', zodiacSigns.map(z => z.name))}
            >
              <Text style={[styles.selectText, !formData.zodiacSign && styles.placeholderText]}>
                {formData.zodiacSign || 'Seçiniz'}
              </Text>
              <ChevronDown size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hakkımda</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <SelectionModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        options={modalConfig.options}
        onSelect={(value) => {
          if (modalConfig.field) {
            setFormData({ ...formData, [modalConfig.field]: value });
          }
        }}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 18,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: Colors.text,
    ...Typography.body,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.title,
    fontSize: 18,
    color: Colors.text,
  },
  modalItem: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  },
});
