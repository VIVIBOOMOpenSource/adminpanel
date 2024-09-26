import React from 'react';
import { useTranslation } from 'react-i18next';
import './survey-title.scss';

export default function SurveyTitle({ title }) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  return (
    <div className="title">
      <h3 className="heading">{t('Event Title: {{wsTitle}}', { wsTitle: title || '-' })}</h3>
    </div>
  );
}
