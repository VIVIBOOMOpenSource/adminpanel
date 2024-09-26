import React from 'react';
import './my-account.scss';

import { useTranslation } from 'react-i18next';
import ProfileDetails from './profile-details';
import LinkSnsAccounts from './link-sns-accounts';
import DangerZone from './danger-zone';

function MyAccount() {
  const { t } = useTranslation();

  return (
    <div className="my-account">
      <h1>{t('myAccount.myAccount')}</h1>

      <ProfileDetails />
      {/* <LinkSnsAccounts /> */}
      <DangerZone />

    </div>
  );
}

export default MyAccount;
