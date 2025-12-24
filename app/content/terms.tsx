import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
  const { t } = useTranslation();
  const sections = t('legal.terms.sections', { returnObjects: true }) as Array<{ title: string; body: string }>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('legal.terms.title')}</Text>
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
