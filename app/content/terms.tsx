import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const sections = [
  {
    title: '1. Taraflar ve Konu',
    body:
      'İşbu Kullanım Koşulları ("Sözleşme"), Falio mobil uygulaması ("Uygulama") ile Uygulama\'ya üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir. Uygulama\'yı indirerek veya kullanarak bu koşulları kabul etmiş sayılırsınız.',
  },
  {
    title: '2. Hizmetin Kapsamı',
    body:
      'Uygulama, kullanıcıların gönderdiği fotoğraflar ve bilgiler doğrultusunda eğlence amaçlı fal yorumları sunar. Sunulan içerikler tamamen eğlence amaçlıdır; tıbbi, hukuki, finansal veya psikolojik tavsiye niteliği taşımaz. Kullanıcı, yorumlara dayanarak hayatıyla ilgili kararlar almamalıdır.',
  },
  {
    title: '3. Üyelik ve Hesap Güvenliği',
    body:
      'Kullanıcı, üyelik oluştururken verdiği bilgilerin doğru ve güncel olduğunu beyan eder. Hesap güvenliğinden (şifre vb.) kullanıcı sorumludur. Başkasına ait hesap bilgileri kullanılamaz. Uygulama, şüpheli durumlarda hesabı askıya alma veya kapatma hakkını saklı tutar.',
  },
  {
    title: '4. Kullanım Kuralları ve Yasaklar',
    body:
      'Kullanıcı, Uygulama\'yı hukuka ve ahlaka aykırı amaçlarla kullanamaz. Aşağıdaki eylemler yasaktır:\n\n• Başkalarını rahatsız edici, hakaret içeren veya tehditkar içerik göndermek.\n• Uygulama\'nın teknik yapısına zarar verecek yazılım veya kod kullanmak.\n• Telif haklarını ihlal eden içerik paylaşmak.\n• Yanıltıcı veya sahte bilgilerle işlem yapmak.',
  },
  {
    title: '5. Ücretli Hizmetler ve İadeler',
    body:
      'Uygulama içindeki bazı hizmetler (kredi satın alma, premium üyelik vb.) ücretli olabilir. Satın alma işlemleri App Store / Google Play üzerinden gerçekleştirilir. Dijital içerik niteliğinde olduğundan, hizmet ifa edildikten sonra cayma hakkı ve iade mümkün değildir. Ancak teknik bir hata durumunda platform kuralları geçerlidir.',
  },
  {
    title: '6. Fikri Mülkiyet Hakları',
    body:
      'Uygulama\'nın tasarımı, yazılımı, logosu ve içeriği Falio\'ya aittir. Kullanıcılar, bu materyalleri izinsiz kopyalayamaz, dağıtamaz veya ticari amaçla kullanamaz.',
  },
  {
    title: '7. Sorumluluk Reddi',
    body:
      'Uygulama, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Teknik sorunlar, bakım çalışmaları veya mücbir sebeplerden kaynaklanan kesintilerden sorumlu tutulamaz. Fal yorumları subjektiftir ve kesinlik vaat etmez.',
  },
  {
    title: '8. Sözleşmenin Feshi',
    body:
      'Kullanıcı, dilediği zaman hesabını silerek sözleşmeyi feshedebilir. Uygulama, kurallara aykırı davranış tespit etmesi halinde kullanıcı hesabını tek taraflı olarak kapatabilir.',
  },
  {
    title: '9. Uyuşmazlık Çözümü',
    body:
      'İşbu Sözleşme\'den doğacak uyuşmazlıklarda Türk Hukuku uygulanır ve İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kullanım Koşulları</Text>
        {sections.map((section, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.text}>{section.body}</Text>
          </View>
        ))}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  text: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
