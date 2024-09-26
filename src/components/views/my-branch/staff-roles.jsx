import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './staff-roles.scss';

import Button from 'src/components/common/button/button';

import { staffRolePrivilegeFeatureTypes } from 'src/enums/StaffRolePrivilegeFeatureType';
import { staffRolePrivilegeLevelsString } from 'src/enums/StaffRolePrivilegeLevel';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';

import StaffRoleModal from './staff-role-modal';

function toPascalCase(string) {
  return `${string}`
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(
      /\s+(.)(\w*)/g,
      ($1, $2, $3) => `${$2.toUpperCase() + $3}`,
    )
    .replace(/\w/, (s) => s.toUpperCase());
}

function StaffRoles({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const branch = useSelector((state) => state.branch);

  const [selectedStaffRole, setSelectedStaffRole] = useState();
  const [showModal, setShowModal] = useState();

  useEffect(() => {
    BranchReduxActions.fetchAllStaffRoleInBranch();
  }, []);

  const onAddStaffRoleClick = useCallback(() => {
    if (!authToCreate) {
      toast.error(t('No permission to modify staff role'));
      return;
    }
    setSelectedStaffRole(null);
    setShowModal(true);
  }, [authToCreate, t]);

  const onStaffRoleClick = useCallback((staffRole) => {
    if (!authToUpdate) {
      toast.error(t('No permission to modify staff role'));
      return;
    }
    setSelectedStaffRole(staffRole);
    setShowModal(true);
  }, [authToUpdate, t]);

  const onDataChanged = () => {
    BranchReduxActions.fetchAllStaffRoleInBranch();
  };

  return (
    <div>
      <div className="branch-list">
        <h2>{t('Branch Staff Roles')}</h2>
        <table>
          <thead>
            <tr className="header">
              <th>{t('Name')}</th>
              {staffRolePrivilegeFeatureTypes.map((featureType) => <th key={featureType}>{t(toPascalCase(featureType))}</th>)}
            </tr>
          </thead>
          <tbody>
            {branch?.staffRoles?.map((v) => (
              <tr
                key={`branch-staff-role_${v.id}`}
                onClick={() => onStaffRoleClick(v)}
              >
                <td>{v.name}</td>
                {
                staffRolePrivilegeFeatureTypes.map((featureType) => {
                  const priv = (v.staffRolePrivileges || []).find((_priv) => _priv.featureType === featureType);
                  return <td key={featureType}>{`${t(toPascalCase(staffRolePrivilegeLevelsString[priv?.privilegeLevel || 0]))}(${priv?.privilegeLevel || 0})`}</td>;
                })
              }
              </tr>
            ))}
          </tbody>
        </table>
        {!branch?.staffRoles?.length && <div className="no-results">{t('No Results')}</div>}
        <br />
        <div className="branch-add">
          <Button
            status="add"
            className="button"
            onClick={onAddStaffRoleClick}
          >
            {t('New Staff Role')}
          </Button>
        </div>
      </div>
      <StaffRoleModal
        show={showModal}
        handleClose={() => {
          setSelectedStaffRole(null);
          setShowModal(false);
        }}
        onDataChanged={onDataChanged}
        staffRole={selectedStaffRole}
        {...{ authToUpdate, authToCreate }}
      />
    </div>
  );
}

export default StaffRoles;
