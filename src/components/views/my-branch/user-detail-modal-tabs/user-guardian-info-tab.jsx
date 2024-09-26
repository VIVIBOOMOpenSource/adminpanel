import React from 'react';
import './user-guardian-info-tab.scss';
import { useTranslation } from 'react-i18next';

const secondGuardianCountryISO = ['EE', 'NZ', 'US'];

function UserGuardianInfoTab({
  branch, authToUpdate, userEdit, setUserEdit, loading,
}) {
  const isCreateUser = !userEdit;
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });

  return (
    <div>
      <div>
        <h3>{t('Guardian Info')}</h3>
        <label>
          {t("Guardian's Name")}
          {isCreateUser && '*'}
        </label>
        <input
          type="text"
          placeholder={t('Name')}
          disabled={loading || !authToUpdate}
          onChange={(e) => { setUserEdit({ ...userEdit, guardianName: e.target.value }); }}
          value={userEdit?.guardianName || ''}
        />

        <label>{t("Guardian's Relationship")}</label>
        <select
          onChange={(e) => { setUserEdit({ ...userEdit, guardianRelationship: e.target.value }); }}
          value={userEdit?.guardianRelationship?.toLowerCase() || ''}
          disabled={loading || !authToUpdate}
        >
          <option value="" disabled hidden>Choose here</option>
          {branch.countryISO === 'US' ? (
            <>
              <option value="parent">{t('Parent')}</option>
              <option value="grandparent">{t('Grandparent')}</option>
            </>
          ) : (
            <>
              <option value="father">{t('Father')}</option>
              <option value="mother">{t('Mother')}</option>
            </>
          )}
          <option value="legal_guardian">{t('Legal guardian')}</option>
        </select>

        <label>
          {t('Address')}
          {isCreateUser && '*'}
        </label>
        <input
          type="text"
          placeholder={t('Address')}
          disabled={loading || !authToUpdate}
          onChange={(e) => { setUserEdit({ ...userEdit, address: e.target.value }); }}
          value={userEdit?.address || ''}
        />

        <div className="email-row">
          <div>
            {t("Guardian's Email")}
            {isCreateUser && '*'}
          </div>
          {isCreateUser ? (
            <div className="email-verified">
              <input type="checkbox" value={userEdit?.isEmailVerified} onChange={(e) => setUserEdit({ ...userEdit, isEmailVerified: e.target.checked })} />
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
          <label>{t("Second Guardian's Name")}</label>
          <input
            type="text"
            placeholder={t("Second Guardian's Name")}
            disabled={loading || !authToUpdate}
            onChange={(e) => { setUserEdit({ ...userEdit, guardianNameTwo: e.target.value }); }}
            value={userEdit?.guardianNameTwo || ''}
          />

          <label>{t("Second Guardian's Relationship")}</label>
          <select
            onChange={(e) => { setUserEdit({ ...userEdit, guardianRelationshipTwo: e.target.value }); }}
            value={userEdit?.guardianRelationshipTwo?.toLowerCase() || ''}
            disabled={loading || !authToUpdate}
          >
            <option value="" disabled hidden>Choose here</option>
            {branch.countryISO === 'US' ? (
              <>
                <option value="parent">{t('Parent')}</option>
                <option value="grandparent">{t('Grandparent')}</option>
              </>
            ) : (
              <>
                <option value="father">{t('Father')}</option>
                <option value="mother">{t('Mother')}</option>
              </>
            )}
            <option value="legal_guardian">{t('Legal guardian')}</option>
          </select>
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
      </div>
    </div>
  );
}

export default UserGuardianInfoTab;
