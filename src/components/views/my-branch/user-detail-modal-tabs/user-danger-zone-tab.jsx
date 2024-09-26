import React, {
  useCallback,
} from 'react';
import './user-danger-zone-tab.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UserApi from 'src/apis/viviboom/UserApi';
import { UserAccountStatusType } from 'src/enums/UserAccountStatusType';
import Button from '../../../common/button/button';

function UserDangerZoneTab({
  handleModalClose, user, onUserDataChanged, authToUpdate, authToCreate, loading, setLoading, userEdit, setUserEdit,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const loggedInUser = useSelector((state) => state.user);

  const isCreateUser = !user;

  const deleteUser = useCallback(async () => {
    setLoading(true);
    try {
      await UserApi.deleteUser({ authToken: loggedInUser.authToken, userId: user.id });
      onUserDataChanged();
      handleModalClose();
    } catch (err) {
      toast.error(err.response?.message);
    }
    setLoading(false);
  }, [setLoading, loggedInUser, user, onUserDataChanged, handleModalClose]);

  const resetEmailVerified = useCallback(async (isEmailVerified) => {
    if (!window.confirm(t(isEmailVerified ? 'emailVerifySkipConfirm' : 'emailVerifyRerequestConfirm'))) return;

    setLoading(true);
    try {
      await UserApi.patch({ authToken: loggedInUser.authToken, userId: user.id, isEmailVerified });
      onUserDataChanged();
      handleModalClose();
      toast.success(t(isEmailVerified ? 'Email Verification Skipped' : 'Email Verification Reset'));
    } catch (err) {
      toast.error(err.response?.message);
    }
    setLoading(false);
  }, [t, setLoading, loggedInUser, user, onUserDataChanged, handleModalClose]);

  return (
    <div className="danger-zone">
      <h3>{t('Account')}</h3>
      <div className="account-status">
        <label>{t('Account Status')}</label>
        <select
          className="account-status-select"
          onChange={(e) => { setUserEdit({ ...userEdit, accountStatus: e.target.value }); }}
          value={userEdit?.accountStatus}
          disabled={loading || !authToUpdate}
          required
        >
          <option value="" disabled hidden>{t('Choose here')}</option>
          <option value={UserAccountStatusType.ACTIVE}>{t('ACTIVE')}</option>
          <option value={UserAccountStatusType.RESTRICTED}>{t('RESTRICTED')}</option>
          <option value={UserAccountStatusType.BANNED}>{t('BANNED')}</option>
        </select>
        {userEdit?.accountStatus !== UserAccountStatusType.ACTIVE && (
          <p className="status-description">
            *
            {t('Restricted and Banned users are unable to login')}
          </p>
        )}
      </div>
      {!isCreateUser && (
        <>
          <label>{t('Verify User Email')}</label>
          <div className="btns">
            <Button
              parentClassName="single-btn"
              status={loading ? 'loading' : ''}
              onClick={() => resetEmailVerified(true)}
              disabled={loading || !authToUpdate}
            >
              {t('Skip Verification')}
            </Button>
            <Button
              parentClassName="single-btn"
              status={loading ? 'loading' : ''}
              onClick={() => resetEmailVerified(false)}
              disabled={loading || !authToUpdate}
            >
              {t('Re-request Verification')}
            </Button>
          </div>
          <br />
          <label>{t('Delete User')}</label>
          <Button
            status={loading ? 'loading' : 'delete'}
            onClick={() => {
              if (user === null) {
                alert(t('This is a new user'));
              }
              const isConfirm = window.confirm(t('Are you sure you want to delete this user?'));
              if (isConfirm) {
                deleteUser();
              }
            }}
            disabled={loading || !authToCreate}
          >
            {t('Delete User')}
          </Button>
        </>
      )}
    </div>
  );
}

export default UserDangerZoneTab;
