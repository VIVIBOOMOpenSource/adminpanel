import React, {
  useEffect, useState, useCallback, useMemo,
} from 'react';
import './user-info-tab.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { userStatusTypes } from 'src/enums/UserStatusType';
import BranchApi from 'src/apis/viviboom/BranchApi';
import UserApi from 'src/apis/viviboom/UserApi';
import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import PasswordInput from '../../../common/password-input/password-input';

function UserInfoTab({
  user, branch, authToUpdate, userEdit, setUserEdit, loading,
}) {
  const isCreateUser = !userEdit;
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const loggedInUser = useSelector((state) => state.user);
  const [branches, setBranches] = useState();
  const [creatorUser, setCreatorUser] = useState();

  const isAdminUpdate = useMemo(
    () => branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] && branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] >= StaffRolePrivilegeLevel.UPDATE,
    [branch.userStaffRolePrivilegesHt],
  );

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
    <div>
      <div>
        <h3>{t(branch?.institutionId === 1 ? 'VIVINAUT Info' : 'User Info')}</h3>
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

        <label>
          {t('School')}
          {isCreateUser && '*'}
        </label>
        <input
          type="text"
          placeholder={t("VIVINAUT's School")}
          disabled={loading || !authToUpdate}
          onChange={(e) => { setUserEdit({ ...userEdit, school: e.target.value }); }}
          value={userEdit?.school || ''}
        />

        <label>{t('Education Level')}</label>
        <select
          onChange={(e) => { setUserEdit({ ...userEdit, educationLevel: e.target.value }); }}
          value={userEdit?.educationLevel || ''}
          disabled={loading || !authToUpdate}
        >
          <option value="" disabled hidden>Choose here</option>
          <option value="primary 1">Primary 1</option>
          <option value="primary 2">Primary 2</option>
          <option value="primary 3">Primary 3</option>
          <option value="primary 4">Primary 4</option>
          <option value="primary 5">Primary 5</option>
          <option value="primary 6">Primary 6</option>
          <option value="secondary 1">Secondary 1</option>
          <option value="secondary 2">Secondary 2</option>
          <option value="secondary 3">Secondary 3</option>
          <option value="secondary 4">Secondary 4</option>
          <option value="secondary 5">Secondary 5</option>
          <option value="grade 1">Grade 1</option>
          <option value="grade 2">Grade 2</option>
          <option value="grade 3">Grade 3</option>
          <option value="grade 4">Grade 4</option>
          <option value="grade 5">Grade 5</option>
          <option value="grade 6">Grade 6</option>
          <option value="grade 7">Grade 7</option>
          <option value="grade 8">Grade 8</option>
          <option value="grade 9">Grade 9</option>
          <option value="grade 10">Grade 10</option>
          <option value="grade 11">Grade 11</option>
          <option value="grade 12">Grade 12</option>
        </select>

        <label>
          {t("VIVINAUT's Email")}
          {isCreateUser && '*'}
        </label>
        <input
          type="email"
          placeholder={t("VIVINAUT's Email")}
          disabled={loading || !authToUpdate}
          onChange={(e) => { setUserEdit({ ...userEdit, email: e.target.value }); }}
          value={userEdit?.email || ''}
        />

        <label>{t("VIVINAUT's Phone Number")}</label>
        <input
          type="text"
          placeholder={t("VIVINAUT's Phone Number")}
          disabled={loading || !authToUpdate}
          onChange={(e) => { setUserEdit({ ...userEdit, phone: e.target.value }); }}
          value={userEdit?.phone || ''}
        />

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
        {isAdminUpdate && (
        <>
          <label>{t('User Consent to Media Release')}</label>
          <select
            disabled={loading || !authToUpdate}
            onChange={(e) => {
              setUserEdit({ ...userEdit, mediaReleaseConsent: e.target.value });
            }}
            value={userEdit?.mediaReleaseConsent}
          >
            <option value>Agree</option>
            <option value={false}>Disagree</option>
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

        {
                !!user && (
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
                )
              }

      </div>
    </div>
  );
}

export default UserInfoTab;
