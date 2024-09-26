import React from 'react';

import { useTranslation } from 'react-i18next';
import SnsButton from '../../common/sns-button/sns-button';

function LinkSnsAccounts() {
  const { t } = useTranslation();

  return (
    <div className="link-sns-accounts">
      <h3>{t('myAccount.linkSnsAccountsHeader')}</h3>
      <p>{t('myAccount.linkSnsAccountsText')}</p>
      <SnsButton action="link" snsType="google" />
      <SnsButton action="link" snsType="facebook" />
    </div>
  );
}

export default LinkSnsAccounts;
