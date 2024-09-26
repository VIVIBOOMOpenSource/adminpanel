import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';

import './user-bulk-import-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';

import UserApi from 'src/apis/viviboom/UserApi';
import Loading from 'src/components/common/loading/loading';
import { ReactComponent as BackSVG } from 'src/css/imgs/icon-arrow-back.svg';

import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';

const placeholder = `
  (From Excel)
  Email... Given name... Family name...
  Email... Given name... Family name...
  Email... Given name... Family name...

  -- Or --

  (From Word)
  Email, Given name, Family name
  Email, Given name, Family name
  Email, Given name, Family name
`;

const MAX_ENTRIES = 1000;

function UserBulkImportModal({
  show,
  handleClose,
  onUserDataChanged,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const authToken = useSelector((state) => state.user.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);

  const [importInput, setImportInput] = useState('');

  const [isSamePassword, setIsSamePassword] = useState(false);
  const [password, setPassword] = useState('');

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [importedUsers, setImportedUsers] = useState([]);

  const [staffRoleId, setStaffRoleId] = useState();
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [isSendingPassword, setSendingPassword] = useState(false);

  const [importMessage, setImportMessage] = useState('');

  const isAdminUpdate = useMemo(
    () => branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] && branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] >= StaffRolePrivilegeLevel.UPDATE,
    [branch.userStaffRolePrivilegesHt],
  );

  const onContinue = () => {
    const inputTrimmed = importInput.trim();
    if (!inputTrimmed) return;
    if (isSamePassword) {
      if (!password) {
        toast.error(t('required', { name: t('password') }));
        return;
      }
      if (password?.length < 8) {
        toast.error(t('invalidPassword'));
        return;
      }
    }
    const rows = inputTrimmed.split('\n');
    const usersToCreate = rows.slice(0, MAX_ENTRIES).flatMap((v) => {
      const row = v.trim();
      if (!row) return [];
      let args = row.split(/[\t,]+/, 3);
      if (args.length === 1) {
        args = row.split(/[\s,]+/);
        if (args.length > 3) {
          args = [args[0], args[1], args.slice(2).join(' ')];
        }
      }
      if (!args?.[0] && !args?.[1] && !args?.[2]) return [];
      const guardianEmail = args?.[0];
      const givenName = args?.[1];
      const familyName = args?.[2];
      let username = guardianEmail?.split('@')?.[0]?.split(/[\s,\-~&.;/\\]+/)?.join('_')?.toLowerCase();
      if (username && username.length < 5) {
        username = `${username}${new Array(5 - username.length).fill(0).join('')}`;
      }

      return [{
        guardianEmail,
        givenName,
        familyName,
        username,
        newPassword: isSamePassword ? password : window.crypto.getRandomValues(new BigUint64Array(1))[0].toString(36),
      }];
    });
    setUsers(usersToCreate);
    setShowUsers(true);
  };

  const onImportList = useCallback(async () => {
    setLoading(true);
    setImportMessage('');
    try {
      const res = await UserApi.postBulk({
        authToken, users, isEmailVerified, staffRoleId: +staffRoleId || undefined, isSendingPassword,
      });
      onUserDataChanged();

      const newUsers = res.data.users;
      const newUsernameSet = new Set(newUsers.map((u) => u.username));
      const remainingUsers = [];
      const newImportedUsers = [];
      users.forEach((u) => {
        if (newUsernameSet.has(u.username)) {
          newUsernameSet.delete(u.username);
          newImportedUsers.push(u);
        } else {
          remainingUsers.push(u);
        }
      });

      setUsers(remainingUsers);
      setImportedUsers((prev) => [...prev, ...newImportedUsers]);

      if (remainingUsers.length > 0) {
        setImportMessage(t('duplicateImportMessage', { count: remainingUsers.length }));
      } else {
        setImportMessage(t('successImportMessage', { count: newImportedUsers.length }));
      }
      document.getElementById('bulk-import-top').scrollTo({ top: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  }, [authToken, isEmailVerified, isSendingPassword, onUserDataChanged, staffRoleId, t, users]);

  const onExportCsv = useCallback(async () => {
    if (!importedUsers.length) return;
    document.querySelector('.csv-download.user-bulk-import').click();
    toast.success(t('csvMessage'));
    setLoading(false);
  }, [importedUsers.length, t]);

  const onChangeCellValue = (rowIndex, type, value) => {
    const clonedUsers = [...users];
    const clonedRow = { ...clonedUsers[rowIndex] };
    clonedRow[type] = value;
    clonedUsers[rowIndex] = clonedRow;
    setUsers(clonedUsers);
  };

  const handleModalClose = () => {
    handleClose();
    setLoading(false);
    setImportInput('');
    setIsSamePassword(false);
    setPassword('');
    setShowUsers(false);
    setUsers([]);
    setImportedUsers([]);
    setImportMessage('');
    setEmailVerified(false);
    setSendingPassword(false);
  };

  return (
    <Modal className="user-bulk-import-modal" show={show} handleClose={handleModalClose}>
      <div className="user-bulk-import-modal-div" id="bulk-import-top">
        <h3>{t('Copy/Paste User List')}</h3>
        {!showUsers ? (
          <div className="import-input-container">
            <p>{t('importDescription')}</p>
            <div className="import">
              <textarea className="import-input" placeholder={placeholder} value={importInput} onChange={(e) => setImportInput(e.target.value)} />
              <div className="set-password">
                <div className="password-selects">
                  <input type="checkbox" checked={isSamePassword} onChange={(e) => setIsSamePassword(e.target.checked)} />
                  <div className="set-password-text">{t('use a default password for all imported users')}</div>
                </div>
                {isSamePassword && (
                  <div className="password-inputs">
                    <div className="set-password-text">
                      {t('Password')}
                      *:
                    </div>
                    <input className="password-input" value={password} disabled={loading} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            <Button status={loading ? 'loading' : 'continue'} disabled={!importInput || (isSamePassword && !password)} onClick={onContinue}>{t('Continue')}</Button>
          </div>
        ) : (
          <div className="import-input-container">
            <p>{t(users.length > 0 ? 'confirmDescription' : 'successImportDescription')}</p>
            {loading ? (
              <div className="loader">
                <Loading size="24px" show />
                <p>{t('Importing Users...')}</p>
              </div>
            ) : (
              <p className="message" style={importMessage ? { backgroundColor: users.length > 0 ? 'rgba(200, 0, 50, 0.3)' : 'rgba(0, 200, 50, 0.3)' } : {}}>{importMessage}</p>
            )}
            {users.length > 0 && (
              <>
                <p className="total-entries">{t('entryCount', { count: users.length })}</p>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr className="header">
                        <th>{t('Email')}</th>
                        <th>{t('Given Name')}</th>
                        <th>{t('Family Name')}</th>
                        <th>{t('Username')}</th>
                        <th>{t('Password')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((v, index) => (
                        <tr key={`import-user_${index}`}>
                          <td><input value={v.guardianEmail} disabled={loading} onChange={(e) => onChangeCellValue(index, 'guardianEmail', e.target.value)} /></td>
                          <td><input value={v.givenName} disabled={loading} onChange={(e) => onChangeCellValue(index, 'givenName', e.target.value)} /></td>
                          <td><input value={v.familyName} disabled={loading} onChange={(e) => onChangeCellValue(index, 'familyName', e.target.value)} /></td>
                          <td><input value={v.username} disabled={loading} onChange={(e) => onChangeCellValue(index, 'username', e.target.value)} /></td>
                          <td><input value={v.newPassword} disabled={loading} onChange={(e) => onChangeCellValue(index, 'newPassword', e.target.value)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="option-container">
                  {isAdminUpdate && (
                    <div className="select-staff">
                      <div className="staff-text">{t('Create As')}</div>
                      <select
                        className="bulk-staff-select"
                        disabled={loading || !isAdminUpdate}
                        onChange={(e) => setStaffRoleId(e.target.value)}
                        value={staffRoleId}
                      >
                        <option value="">{t('Users')}</option>
                        {branch.staffRoles?.map((s) => (
                          <option key={`bulk-staff-role_${s.id}`} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="email-verified">
                    <input type="checkbox" checked={isEmailVerified} onChange={(e) => { setEmailVerified(e.target.checked); if (!e.target.checked) setSendingPassword(false); }} />
                    <div className="skip-verify-text">{t('Skip Email Verification')}</div>
                  </div>
                  {isEmailVerified && (
                    <div className="email-verified">
                      <input type="checkbox" checked={isSendingPassword} onChange={(e) => setSendingPassword(e.target.checked)} />
                      <div className="skip-verify-text">{t('Send Username and Password to User Email')}</div>
                    </div>
                  )}
                </div>
                {isSendingPassword && (
                  <p className="password-warning">
                    *
                    {t('passwordWarning')}
                  </p>
                )}
                <Button parentClassName="import-button" status={loading ? 'loading' : 'add'} disabled={loading || !users.length} onClick={onImportList}>{t('Import List')}</Button>
              </>
            )}
            {importedUsers.length > 0 && (
              <div className="imported-user-container">
                <h3>{t('Imported User List')}</h3>
                <p className="total-entries">{t('entryCount', { count: importedUsers.length })}</p>
                <div className="table-container imported-user-table">
                  <table>
                    <thead>
                      <tr className="header">
                        <th>{t('Email')}</th>
                        <th>{t('Given Name')}</th>
                        <th>{t('Family Name')}</th>
                        <th>{t('Username')}</th>
                        <th>{t('Password')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedUsers?.map((v) => (
                        <tr key={`imported-user_${v.username}`}>
                          <td>{v.guardianEmail}</td>
                          <td>{v.givenName}</td>
                          <td>{v.familyName}</td>
                          <td>{v.username}</td>
                          <td>{v.newPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button status={loading ? 'loading' : 'save'} disabled={loading || !importedUsers.length} onClick={onExportCsv}>{t('Export As CSV')}</Button>
                <CSVLink
                  data={importedUsers}
                  className="csv-download user-bulk-import"
                  filename={`imported_user_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}.csv`}
                />
              </div>
            )}
            <div className="modal-back-button" onClick={() => { setShowUsers(false); setImportMessage(''); }}>
              <BackSVG />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default UserBulkImportModal;
