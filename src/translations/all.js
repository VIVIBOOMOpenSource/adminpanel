import common from './views/common';
import entry from './views/entry';
import email from './views/email';
import navi from './views/navi';
import documents from './views/documents';
import myAccount from './views/my-account';
import payment from './views/payment';
import badge from './views/badge';
import booking from './views/booking';
import comment from './views/comment';
import myBranch from './views/my-branch';
import project from './views/project';
import quota from './views/quota';
import userBooking from './views/user-booking';
import userRegistration from './views/user-registration';
import publicPortfolio from './views/public-portfolio';
import user from './views/user';
import vivicoin from './views/vivicoin';
import vivivault from './views/vivivault';
import branch from './views/branch';
import spaceModel from './views/space-model';

// TODO @Trevor
// In the event a translation is not there, it will display nothing. Implement a fallback language feature.
const convertToSingularLocale = (messages, locale) => {
  const singleLocale = { ...messages };

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const property in singleLocale) {
    if (property === locale) return singleLocale[property];

    if (typeof singleLocale[property] === 'object') {
      singleLocale[property] = convertToSingularLocale(
        singleLocale[property],
        locale,
      );
    }
  }

  return singleLocale;
};

const translations = {
  general: {
    languageAbbreviation: {
      de: 'de',
      es: 'es',
      en: 'en',
      et: 'et',
      lt: 'lt',
      ja: 'ja',
      fr: 'fr',
      zh: 'zh',
      ph: 'ph',
      ch: 'ch',
    },
  },

  common,
  navi,
  entry,
  email,
  documents,
  myAccount,
  payment,
  badge,
  booking,
  comment,
  myBranch,
  project,
  publicPortfolio,
  quota,
  userBooking,
  user,
  userRegistration,
  vivicoin,
  vivivault,
  branch,
  spaceModel,
};

export const english = convertToSingularLocale(translations, 'en');
export const japanese = convertToSingularLocale(translations, 'ja');
export const estonian = convertToSingularLocale(translations, 'et');
export const lithuanian = convertToSingularLocale(translations, 'lt');
export const chinese = convertToSingularLocale(translations, 'ch');
export const tagalog = convertToSingularLocale(translations, 'ph');

export const availableLanguages = [
  { name: 'English', nativeName: 'English', code: 'en' },
  { name: 'Japanese', nativeName: '日本語', code: 'ja' },
  { name: 'Estonian', nativeName: 'Eesti', code: 'et' },
  { name: 'Lithuanian', nativeName: 'Lietuvių', code: 'lt' },
  // { name: 'Tagalog', nativeName: 'Tagalog', code: 'ph' },
  // { name: 'Chinese', nativeName: '华语', code: 'ch' },
];
