import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  english,
  japanese,
  estonian,
  lithuanian,
  chinese,
  tagalog,
} from './all';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: english },
      ja: { translation: japanese },
      et: { translation: estonian },
      lt: { translation: lithuanian },
      ch: { translation: chinese },
      ph: { translation: tagalog },
    },
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    nsSeparator: false,
  });

export default i18n;
