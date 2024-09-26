import React from 'react';
import { useTranslation } from 'react-i18next';
import './survey-description.scss';

export default function SurveyDescription({ description, handleChangeDescription, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  return (
    <div className="booking-description">
      <h3 className="heading">{t('Event Description (optional)')}</h3>
      <textarea type="text" value={description} onChange={handleChangeDescription} placeholder={t('description')} disabled={!authToUpdate} />
    </div>
  );
}
