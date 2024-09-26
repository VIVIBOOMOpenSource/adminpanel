import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import DeleteAccountModal from './delete-account-modal';
import Button from '../../common/button/button';

function DangerZone() {
  const [deleteAccountShow, setDeleteAccountShow] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="danger-zone">
      <h3>
        {t('myAccount.dangerZone')}
        {' '}
        <span role="img" aria-label="caution">⚠️</span>
      </h3>

      <div className="danger-items">
        <div className="delete-account">
          <div>
            <label>
              <h4>{t('myAccount.deleteAccount')}</h4>
              <p>{t('myAccount.deleteAccountWarning')}</p>
            </label>

          </div>
          <Button
            onClick={() => { setDeleteAccountShow(true); }}
            status="delete"
            parentClassName="delete"
            type="button"
          >
            {t('myAccount.deleteAccount')}
          </Button>
        </div>
      </div>

      <DeleteAccountModal
        show={deleteAccountShow}
        handleClose={() => setDeleteAccountShow(false)}
      />
    </div>
  );
}

export default DangerZone;
