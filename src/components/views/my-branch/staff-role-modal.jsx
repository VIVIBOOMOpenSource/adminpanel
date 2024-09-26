import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './staff-role-modal.scss';

import Button from 'src/components/common/button/button';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';

import { staffRolePrivilegeFeatureTypes } from 'src/enums/StaffRolePrivilegeFeatureType';
import { staffRolePrivilegeLevelsString } from 'src/enums/StaffRolePrivilegeLevel';
import { toast } from 'react-toastify';
import Modal from 'src/components/common/modal/modal';
import StaffRoleApi from 'src/apis/viviboom/StaffRoleApi';
import AssignStaffRole from './assign-staff-role';

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

function StaffRoleModal({
  show, handleClose, onDataChanged, staffRole, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);

  const [tab, setTab] = useState(1);

  const [staffRoleEdit, setStaffRoleEdit] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffRole) {
      setStaffRoleEdit(structuredClone(staffRole));
    } else {
      setStaffRoleEdit({
        staffRolePrivileges: [],
      });
    }
  }, [branch.id, staffRole]);

  const handleModalClose = () => {
    handleClose();
    setTab(1);
    setLoading(false);
    setStaffRoleEdit({
      staffRolePrivileges: [],
    });
  };

  const onDeleteStaffRoleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await StaffRoleApi.deleteStaffRole({ authToken, staffRoleId: staffRole?.id });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
    onDataChanged();
    setLoading(false);
    toast.success(t('Delete success'));
  }, [authToken, onDataChanged, staffRole?.id, t]);

  const onSubmitForm = useCallback(async () => {
    try {
      const patchParams = { staffRolePrivileges: staffRoleEdit.staffRolePrivileges };
      if (!staffRole) {
        await StaffRoleApi.post({
          authToken, name: staffRoleEdit.name, branchId: branch.id, ...patchParams,
        });
      } else {
        if (staffRoleEdit.name !== staffRole.name) patchParams.name = staffRoleEdit.name;
        await StaffRoleApi.patch({ authToken, staffRoleId: staffRole?.id, ...patchParams });
      }
      onDataChanged();
      setLoading(false);
      toast.success(t('Saved!'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  }, [authToken, branch.id, onDataChanged, staffRole, staffRoleEdit, t]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!authToUpdate) {
      window.alert(t('Insufficient permission level'));
      return;
    }
    await onSubmitForm();
    handleModalClose();
  };

  const handleDeleteStaffRole = () => {
    if (!authToCreate) {
      window.alert(t('Insufficient permission level'));
      return;
    }

    if (!staffRole) {
      window.alert(t('This is a new staff role'));
      return;
    }
    const isConfirm = window.confirm(t('Are you sure you want to delete this role?'));
    if (isConfirm) {
      onDeleteStaffRoleConfirm();
      handleModalClose();
    }
  };

  if (!staffRoleEdit) return null;

  return (
    <Modal
      className="role-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <CarouselHeader className="entry-options hlo" slideTo={tab}>
        <div onClick={() => setTab(1)}>{t('Staff Role')}</div>
        <div onClick={() => setTab(2)}>{t('Assign Users')}</div>
        <div onClick={() => setTab(3)}>{t('Danger Zone')}</div>
      </CarouselHeader>
      <Carousel slideTo={tab}>
        {/* first page: staff role form */}
        <div className="staff-role-ctn">
          <label>{t('Staff Role Name')}</label>
          <input
            type="text"
            placeholder={t('Staff Role Name')}
            disabled={loading}
            onChange={(e) => { setStaffRoleEdit({ ...staffRoleEdit, name: e.target.value }); }}
            value={staffRoleEdit?.name || ''}
          />
          <h2>{t('Privilege Levels')}:</h2>
          {
            staffRolePrivilegeFeatureTypes.map((featureType) => {
              const privilege = staffRoleEdit.staffRolePrivileges?.find((_priv) => _priv.featureType === featureType);

              return (
                <div key={featureType}>
                  <label>{t(toPascalCase(featureType))}</label>
                  <select
                    onChange={(e) => {
                      if (!staffRoleEdit.staffRolePrivileges) staffRoleEdit.staffRolePrivileges = [];

                      if (privilege) privilege.privilegeLevel = e.target.value;
                      else staffRoleEdit.staffRolePrivileges.push({ featureType, privilegeLevel: e.target.value });
                      setStaffRoleEdit({ ...staffRoleEdit });
                    }}
                    value={privilege?.privilegeLevel || 0}
                  >
                    {staffRolePrivilegeLevelsString.map((privLevel, idx) => <option key={privLevel} value={idx}>{`${t(toPascalCase(privLevel))}(${idx})`}</option>)}
                  </select>
                </div>
              );
            })
          }
        </div>
        {/* second page: assign users staff roles */}
        <div className="assign-user">
          <AssignStaffRole staffRoleId={staffRole?.id} />
        </div>
        {/* third page: delete */}
        <div className="danger-zone">
          <h3>{t('Danger Zone')}</h3>

          <label>
            {t('Deleting this staff role will remove')}
            {' '}
            <strong style={{ color: 'red' }}>{t("all crews' access granted by this staff role!")}</strong>
          </label>
          <br />
        </div>
      </Carousel>
      {tab === 3 ? (
        <Button
          status={loading ? 'loading' : 'delete'}
          disabled={!authToCreate}
          onClick={handleDeleteStaffRole}
        >
          {t('Delete Staff Role')}
        </Button>
      ) : (
        <Button
          type="submit"
          status={loading ? 'loading' : 'save'}
          disabled={!authToCreate}
          value={t('Save')}
          onClick={handleSubmit}
        />
      )}
    </Modal>
  );
}

export default StaffRoleModal;
