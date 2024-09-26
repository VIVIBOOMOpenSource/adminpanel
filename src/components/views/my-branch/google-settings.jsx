import React from 'react';
import { useTranslation } from 'react-i18next';
import './google-settings.scss';

import GoogleCalendar from './google-calendar';
import GoogleAdminOnly from './google-admin-only'

function GoogleSettings({ authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });

  return (
    <div className="google-settings-container">
      {authToUpdate ? (
        <div className="google-container">
          <h2>{t('Google Calendar Settings')}</h2>
          <GoogleCalendar />
          <h2>{t('Google Admin Settings')}</h2>
          <GoogleAdminOnly />
        </div>
      ) : (
        <div>
          <h1>{t('Your account status is insufficient to view this page. Please contact a local admin.')}</h1>
        </div>
      )}
    </div>
  );
}

export default GoogleSettings;
