import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './locales/tr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
};

export const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) {
    const locales = Localization.getLocales();
    savedLanguage = locales[0]?.languageCode ?? 'tr';
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });
};

export default i18n;
