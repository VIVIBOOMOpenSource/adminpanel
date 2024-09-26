import React, {
  useEffect, useState, useCallback,
} from 'react';
import './user-info-tab.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { userStatusTypes } from 'src/enums/UserStatusType';
import BranchApi from 'src/apis/viviboom/BranchApi';
import UserApi from 'src/apis/viviboom/UserApi';
import PasswordInput from '../../../common/password-input/password-input';

const secondGuardianCountryISO = ['EE', 'NZ', 'US'];

function UserInfoTab({
  user, branch, authToUpdate, authToCreate, userEdit, setUserEdit, loading, onBulkImportClick,
}) {
  const isCreateUser = !user;
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const loggedInUser = useSelector((state) => state.user);
  const [branches, setBranches] = useState();
  const [creatorUser, setCreatorUser] = useState();

  const fetchAllBranches = useCallback(async () => {
    if (!loggedInUser.authToken) return;
    const branchesRes = await BranchApi.getList({ authToken: loggedInUser.authToken });
    setBranches(branchesRes.data.branches);
  }, [loggedInUser.authToken]);

  useEffect(() => fetchAllBranches(), [fetchAllBranches]);

  const fetchUserCreator = useCallback(async () => {
    if (user && user.creatorUserId) {
      const creatorUserRes = await UserApi.get({ authToken: loggedInUser.authToken, userId: user.creatorUserId });
      setCreatorUser(creatorUserRes.data.user);
    }
  }, [loggedInUser.authToken, user]);

  useEffect(() => fetchUserCreator(), [fetchUserCreator]);

  return (
    <div className="user-info-tab">
      <div className="user-info-title">
        <h3>{t('User Info')}</h3>
        {isCreateUser && authToCreate && <p className="bulk-import" onClick={onBulkImportClick}>{t('Copy and paste list of users to bulk import')}</p>}
      </div>
      <label>
        {t('Given Name')}
        {isCreateUser && '*'}
      </label>
      <input
        type="text"
        placeholder={t('Given Name')}
        disabled={loading || !authToUpdate}
        onChange={(e) => { setUserEdit({ ...userEdit, givenName: e.target.value }); }}
        value={userEdit?.givenName || ''}
      />

      <label>
        {t('Family Name')}
        {isCreateUser && '*'}
      </label>
      <input
        type="text"
        placeholder={t('Family Name')}
        disabled={loading || !authToUpdate}
        onChange={(e) => { setUserEdit({ ...userEdit, familyName: e.target.value }); }}
        value={userEdit?.familyName || ''}
      />

      {branch.countryISO === 'US' && (
        <>
          <label>
            {t('Preferred Name')}
            {isCreateUser && '*'}
          </label>
          <input
            type="text"
            placeholder={t('Preferred Name')}
            disabled={loading || !authToUpdate}
            onChange={(e) => { setUserEdit({ ...userEdit, preferredName: e.target.value }); }}
            value={userEdit?.preferredName || ''}
          />

          <label>
            {t('Name of Siblings who are VIVINAUTs')}
            {isCreateUser && '*'}
            <div className="label-sub-text">{t('Please add a comma between each sibling')}</div>
          </label>
          <input
            type="text"
            placeholder={t('Name of Siblings who are VIVINAUTs')}
            disabled={loading || !authToUpdate}
            onChange={(e) => { setUserEdit({ ...userEdit, siblingMembers: e.target.value }); }}
            value={userEdit?.siblingMembers || ''}
          />
        </>
      )}

      {isCreateUser && (
        <>
          <label>{t('Gender')}</label>
          <select
            onChange={(e) => { setUserEdit({ ...userEdit, gender: e.target.value }); }}
            value={userEdit?.gender?.toLowerCase() || ''}
            disabled={loading || !authToUpdate}
          >
            <option value="" disabled hidden>{t('Choose here')}</option>
            <option value="male">{t('Male')}</option>
            <option value="female">{t('Female')}</option>
            <option value="other">{t('Other')}</option>
            {branch.countryISO === 'US' && (
            <>
              <option value="non_binary">{t('Non-binary')}</option>
              <option value="no_response">{t('Prefer not to respond')}</option>
            </>
            )}
          </select>

          <label>{t('Date of Birth')}</label>
          <input
            type="text"
            placeholder={`YYYY-MM-DD (${t("Please include the dash '-'")})`}
            onChange={(e) => { setUserEdit({ ...userEdit, dob: e.target.value }); }}
            value={userEdit?.dob || ''}
            disabled={loading || !authToUpdate}
          />
        </>
      )}

      <label>
        {t('Username')}
        {isCreateUser && '*'}
      </label>
      <input
        type="text"
        placeholder={t('Username')}
        disabled={loading || !authToUpdate}
        onChange={(e) => { setUserEdit({ ...userEdit, username: e.target.value }); }}
        value={userEdit?.username || ''}
      />

      <div className="email-row">
        <div>
          {t("Guardian's Email")}
          {isCreateUser && '*'}
        </div>
        {isCreateUser ? (
          <div className="email-verified">
            <input type="checkbox" checked={userEdit?.isEmailVerified} onChange={(e) => setUserEdit({ ...userEdit, isEmailVerified: e.target.checked })} />
            <div className="skip-verify-text">{t('Skip Verification')}</div>
          </div>
        ) : (
          <div className="email-verified">
            {userEdit?.isEmailVerified ? `✓ ${t('Email Verified')}` : `✗ ${t('Email Not Verified')}`}
          </div>
        )}
      </div>
      <input
        type="email"
        placeholder={t("Guardian's Email")}
        disabled={loading || !authToUpdate}
        onChange={(e) => { setUserEdit({ ...userEdit, guardianEmail: e.target.value }); }}
        value={userEdit?.guardianEmail || ''}
      />

      <label>{t("Guardian's Phone Number")}</label>
      <input
        type="text"
        placeholder={t("Guardian's Phone Number")}
        disabled={loading || !authToUpdate}
        onChange={(e) => { setUserEdit({ ...userEdit, guardianPhone: e.target.value }); }}
        value={userEdit?.guardianPhone || ''}
      />

      {secondGuardianCountryISO.includes(branch.countryISO) && (
        <>
          <label>{t("Second Guardian's Email")}</label>
          <input
            type="email"
            placeholder={t("Second Guardian's Email")}
            disabled={loading || !authToUpdate}
            onChange={(e) => { setUserEdit({ ...userEdit, guardianEmailTwo: e.target.value }); }}
            value={userEdit?.guardianEmailTwo || ''}
          />

          <label>{t("Second Guardian's Phone Number")}</label>
          <input
            type="text"
            placeholder={t("Second Guardian's Phone Number")}
            disabled={loading || !authToUpdate}
            onChange={(e) => { setUserEdit({ ...userEdit, guardianPhoneTwo: e.target.value }); }}
            value={userEdit?.guardianPhoneTwo || ''}
          />
        </>
      )}
      <label>
        {t(branch?.institutionId === 1 ? 'VIVISTOP Branch' : 'Branch')}
        {isCreateUser && '*'}
      </label>
      <select
        disabled={loading || !authToUpdate}
        onChange={(e) => {
          const newBranch = branches.find((b) => b.id === +e.target.value);
          setUserEdit({ ...userEdit, branchId: newBranch.id, branch: newBranch });
        }}
        value={userEdit?.branchId}
      >
        {branches?.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {!isCreateUser && (
        <>
          <label>{t('User Status')}</label>
          <select
            disabled={loading || !authToUpdate}
            onChange={(e) => {
              setUserEdit({ ...userEdit, status: e.target.value });
            }}
            value={userEdit?.status}
          >
            {userStatusTypes?.map((s) => (
              <option key={s} value={s}>
                {t(s.toLowerCase())}
              </option>
            ))}
          </select>
        </>
      )}
      <label>{isCreateUser ? `${t('Password')}*` : t('Change Password')}</label>
      <PasswordInput
        disabled={loading || !authToUpdate}
        placeholder={user === null ? t('Password') : t('Password (leave blank for no changes)')}
        onChange={(e) => { setUserEdit({ ...userEdit, password: e.target.value }); }}
        value={userEdit?.password || ''}
      />

      {!!user && (
        <div>
          <label>
            {t("Creator's Username")}
            :
            {' '}
            {!user.creatorUserId && 'Nil'}
            {user.creatorUserId && creatorUser === undefined && t('Loading...')}
            {user.creatorUserId && creatorUser && creatorUser?.username}
          </label>
        </div>
      )}
    </div>
  );
}

export default UserInfoTab;
