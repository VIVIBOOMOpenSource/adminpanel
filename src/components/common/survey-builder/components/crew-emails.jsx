import React from 'react';
import { useTranslation } from 'react-i18next';
import './crew-emails.css';

export default function CrewEmails({ crewEmails, handleChangeCrewEmails, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  return (
    <div className="template-title">
      <h3>{t('Notify the crew below upon event registration and cancellation (optional)')}</h3>
      <input type="text" value={crewEmails} onChange={handleChangeCrewEmails} placeholder={t('Enter emails separated by a comma')} disabled={!authToUpdate} />
    </div>
  );
}
