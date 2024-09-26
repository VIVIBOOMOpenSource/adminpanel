import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import './my-branch.scss';

import Button from 'src/components/common/button/button';

import BranchApi from 'src/apis/viviboom/BranchApi';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';
import UserDetails from './user-details';
import StaffRoles from './staff-roles';
import InstitutionSettings from './institution-settings';
import BranchSettings from './branch-settings';
import GoogleSettings from './google-settings';
import StarterCriteria from './starter-criteria';

const internalFilterTabs = ['VIVINAUT Details', 'Membership Criteria', 'Staff Roles', 'Google Settings', 'Branch Settings', 'Institution Settings'];
const externalFilterTabs = ['Staff Roles', 'Institution Settings'];

function MyBranch({ authToUpdate, authToCreate }) {
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const projectApprovalEmailArray = branch.projectApprovalEmail?.split(', ');
  const [approvalEmails, setApprovalEmails] = useState(projectApprovalEmailArray || ['']);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation('translation', [{ keyPrefix: 'myBranch' }, { keyPrefix: 'navi' }]);

  const [filterTab, setFilterTab] = useState(branch?.id);

  const [name, setName] = useState(branch?.name);
  const [code, setCode] = useState(branch?.code);
  const [editMode, setEditMode] = useState('');

  const [filterTabs, setFilterTabs] = useState(loggedInUser?.institutionId !== 1 ? externalFilterTabs : internalFilterTabs);

  const fields = [
    {
      key: 'Branch Name', isEditable: true, value: name, setState: setName,
    },
    {
      key: 'Branch Sign-Up Code', isEditable: true, value: code, setState: setCode,
    },
    { key: 'Country ISO', value: branch?.countryISO },
    { key: 'IANA Timezone', value: branch?.tzIANA },
    { key: 'Google Calendar Client ID', value: branch?.gcalClientId },
    { key: 'Google Admin Client ID', value: branch?.adminGoogleClientId },
  ];

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser?.authToken,
        name,
        code,
        projectApprovalEmail: approvalEmails.filter(Boolean).join(', '),
        branchId: branch?.id,
      };
      await BranchApi.patch(requestParams);
      await BranchReduxActions.fetch();
      toast.success('Branch Saved!');
      setEditMode('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log(err);
    }
    setLoading(false);
  }, [approvalEmails, loggedInUser?.authToken, branch?.id, code, name]);

  const handleEmailAdd = () => {
    const approvalEmailsCopy = approvalEmails.slice();
    approvalEmailsCopy.push('');
    setApprovalEmails(approvalEmailsCopy);
  };

  const handleEmailDelete = (index) => {
    const approvalEmailsCopy = approvalEmails.slice();
    if (approvalEmailsCopy.length <= 1) {
      setApprovalEmails(['']);
    } else {
      approvalEmailsCopy.splice(index, 1);
      setApprovalEmails(approvalEmailsCopy);
    }
  };

  return (
    <div className="branch">
      <div className="branch-container">
        <div className="branch-category-content">
          <h1>{t('My Branch')}</h1>
          <ul className="user-sort hlo">
            <li
              className={branch && branch.id === filterTab ? 'active' : ''}
              value={branch?.id}
              onClick={() => setFilterTab(branch?.id)}
            >
              {branch.name}
            </li>
            {filterTabs.map((v) => {
              if ((!branch?.AllowVivicoinRewards || !loggedInUser?.institution?.isRewardEnabled) && v === 'Rewards Settings') return null;
              return (
                <li
                  key={v}
                  className={v === filterTab ? 'active' : ''}
                  value={v}
                  onClick={() => setFilterTab(v)}
                >
                  {t(`${v}`)}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="branch-content">
          {filterTab === branch?.id && (
            <div className="branch-details">
              <h2>{t('Branch Details')}</h2>
              <div className="branch-ctn">
                {fields.map(({
                  key, isEditable, value, setState,
                }) => (
                  <div key={key} className="branch-detail">
                    <label>{t(`myBranch.${key}`)}</label>
                    <div className="input-item">
                      <input type="text" disabled={!isEditable || editMode !== key} value={value} onChange={(e) => setState(e.target.value)} />
                      <Button
                        type="button"
                        status={editMode !== key ? 'edit' : 'add'}
                        disabled={!isEditable}
                        onClick={() => setEditMode((prevKey) => (prevKey === key ? '' : key))}
                      >
                        {t('common.edit')}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="branch-detail">
                  <label>{t('Project Approval Emails')}</label>
                  <div className="emails-container">
                    {approvalEmails.map((email, index) => (
                      <div className="email-input-item" key={`email-${index}`}>
                        <input
                          type="text"
                          value={email || ''}
                          onChange={(e) => {
                            const approvalEmailsCopy = approvalEmails.slice();
                            approvalEmailsCopy[index] = e.target.value;
                            setApprovalEmails(approvalEmailsCopy);
                          }}
                        />
                        <Button
                          parentClassName="delete"
                          type="button"
                          status="delete"
                          onClick={() => handleEmailDelete(index)}
                        >
                          {t('Delete')}
                        </Button>
                      </div>
                    ))}
                    <Button
                      parentClassName="add-button"
                      type="button"
                      status="add"
                      onClick={handleEmailAdd}
                    >
                      {t('Add')}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    status={loading ? 'loading' : 'save'}
                    onClick={handleSave}
                  >
                    {t('Save')}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {filterTab === 'VIVINAUT Details' && <UserDetails authToUpdate={authToUpdate} authToCreate={authToCreate} />}
          {filterTab === 'Staff Roles' && <StaffRoles authToUpdate={authToUpdate} authToCreate={authToCreate} />}
          {filterTab === 'Membership Criteria' && <StarterCriteria authToUpdate={authToUpdate} authToCreate={authToCreate} />}
          {filterTab === 'Google Settings' && <GoogleSettings authToUpdate={authToUpdate} />}
          {filterTab === 'Branch Settings' && <BranchSettings authToUpdate={authToUpdate} />}
          {filterTab === 'Institution Settings' && <InstitutionSettings authToUpdate={authToUpdate} />}
        </div>

      </div>
    </div>
  );
}

export default MyBranch;
