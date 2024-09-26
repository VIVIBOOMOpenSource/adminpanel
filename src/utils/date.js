import { DateTime } from 'luxon';

export const dateTimeSince = (dateObj, t) => {
  if (dateObj === null || dateObj === undefined || dateObj === '') {
    return '---';
  }

  const d = new Date(dateObj);
  const time = new Date();
  const dateDiff = time.getTime() - d.getTime();

  const secondsFromD2T = dateDiff / 1000;
  const secondsBetweenDates = Math.abs(secondsFromD2T);

  if (secondsBetweenDates <= 5) {
    return t('Now');
  } if (secondsBetweenDates <= 60) {
    const seconds = Math.floor(secondsBetweenDates);
    return `${(seconds !== 1) ? `${seconds} ${t('Seconds')}` : `${seconds} ${t('Second')}`} ${t('Ago')}`;
  } if (secondsBetweenDates < 3600) {
    const minutes = Math.floor(secondsBetweenDates / 60);
    return `${(minutes > 1) ? `${minutes} ${t('Minutes')}` : `${minutes} ${t('Minute')}`} ${t('Ago')}`;
  } if (secondsBetweenDates < 86400) {
    const hours = Math.floor(secondsBetweenDates / 60 / 60);
    return `${(hours > 1) ? `${hours} ${t('Hours')}` : `${hours} ${t('Hour')}`} ${t('Ago')}`;
  } if (secondsBetweenDates < 604800) { // 7 days
    const days = Math.floor(secondsBetweenDates / 60 / 60 / 24);
    return `${(days > 1) ? `${days} ${t('Days')}` : `${days} ${t('Day')}`} ${t('Ago')}`;
  }

  return DateTime.fromJSDate(d).toLocaleString(DateTime.DATETIME_MED);
};

export const prettifyDate = (dateObj) => {
  if (dateObj === null || dateObj === undefined || dateObj === '') {
    return '---';
  }

  const d = new Date(dateObj);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
    'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
  return formattedDate;
};
