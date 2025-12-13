import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const sections = [
  {
    title: '1. Veri Sorumlusu ve Toplanan Veriler',
    body:
      'Falio ("Uygulama") olarak, veri sorumlusu sıfatıyla kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuata uygun olarak işlemekteyiz. Toplanan veriler şunlardır:\n\n• Kimlik Bilgileri: Ad, soyad, doğum tarihi, cinsiyet.\n• İletişim Bilgileri: E-posta adresi.\n• Görsel ve İşitsel Kayıtlar: Fal yorumu için yüklenen fotoğraflar.\n• İşlem Güvenliği Bilgileri: IP adresi, cihaz bilgileri, log kayıtları.\n• Pazarlama Bilgileri: Çerez kayıtları, kullanım alışkanlıkları.',
  },
  {
    title: '2. Kişisel Verilerin İşlenme Amaçları',
    body:
      'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:\n\n• Üyelik işlemlerinin gerçekleştirilmesi ve kullanıcı girişinin sağlanması.\n• Fal yorumlama hizmetinin sunulması ve sonuçların iletilmesi.\n• Uygulama içi satın alma ve abonelik işlemlerinin yürütülmesi.\n• Müşteri destek taleplerinin karşılanması.\n• Yasal yükümlülüklerin yerine getirilmesi ve yetkili makamlara bilgi verilmesi.\n• Uygulama güvenliğinin sağlanması ve hileli işlemlerin önlenmesi.',
  },
  {
    title: '3. Kişisel Verilerin Aktarılması',
    body:
      'Verileriniz, hizmetin sağlanması amacıyla iş ortaklarımızla (ödeme kuruluşları, sunucu hizmeti sağlayıcıları) ve yasal zorunluluk durumunda yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir. Verileriniz, güvenli sunucularda (Supabase vb.) saklanmaktadır.',
  },
  {
    title: '4. Veri Saklama ve İmha',
    body:
      'Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal zamanaşımı süreleri dikkate alınarak saklanır. Süre sonunda veya talebiniz üzerine verileriniz silinir, yok edilir veya anonim hale getirilir. Fal fotoğrafları, yorumlama işlemi tamamlandıktan sonra belirli bir süre içinde sistemden otomatik olarak silinebilir.',
  },
  {
    title: '5. İlgili Kişinin Hakları',
    body:
      'KVKK’nın 11. maddesi uyarınca;\n\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme,\n• İşlenmişse buna ilişkin bilgi talep etme,\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,\n• Eksik veya yanlış işlenmişse düzeltilmesini isteme,\n• Silinmesini veya yok edilmesini talep etme haklarına sahipsiniz.\n\nBu haklarınızı kullanmak için uygulama içindeki "Bize Ulaşın" bölümünden veya destek e-posta adresimizden talepte bulunabilirsiniz.',
  },
  {
    title: '6. Çerezler (Cookies)',
    body:
      'Uygulama deneyimini iyileştirmek ve analitik veriler toplamak amacıyla çerezler ve benzeri teknolojiler kullanılabilir. Çerez tercihlerinizi cihaz ayarlarınızdan yönetebilirsiniz.',
  },
  {
    title: '7. Değişiklikler',
    body:
      'Bu Gizlilik Politikası, yasal düzenlemelere veya hizmet değişikliklerine bağlı olarak güncellenebilir. Güncel metin uygulama üzerinden yayınlandığı tarihte yürürlüğe girer.',
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Gizlilik Sözleşmesi</Text>
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
