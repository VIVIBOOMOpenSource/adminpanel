import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import './user-modal.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UserApi from 'src/apis/viviboom/UserApi';
import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import ReactSelect from 'react-select';
import StaffRoleApi from 'src/apis/viviboom/StaffRoleApi';
import { UserStatusType } from 'src/enums/UserStatusType';
import { UserAccountStatusType } from 'src/enums/UserAccountStatusType';
import Modal from 'src/components/common/modal/modal';
import Button from 'src/components/common/button/button';

import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';
import UserBadge from './user-badge';
import UserInfoTab from './user-tabs/user-info-tab';
import UserProfileDetailsTab from './user-tabs/user-profile-details-tab';
import UserOthersTab from './user-tabs/user-others-tab';
import UserDangerZoneTab from './user-tabs/user-danger-zone-tab';
import UserChallenge from './user-challenge';

function UserModal({
  show, handleClose, user, onUserDataChanged, onBulkImportClick, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);

  const [userEdit, setUserEdit] = useState();

  const [profileImageToUpload, setProfileImageToUpload] = useState(null);
  const [coverImageToUpload, setCoverImageToUpload] = useState(null);

  const [slide, setSlide] = useState(1);

  const isAdminUpdate = useMemo(
    () => branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] && branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] >= StaffRolePrivilegeLevel.UPDATE,
    [branch.userStaffRolePrivilegesHt],
  );

  useEffect(() => {
    if (user) {
      setUserEdit(structuredClone(user));
    } else {
      setUserEdit({
        branchId: branch.id,
        status: UserStatusType.EXPLORER,
        accountStatus: UserAccountStatusType.ACTIVE,
        isEmailVerified: branch.institutionId > 1,
      });
    }
  }, [branch?.id, branch?.institutionId, user]);

  const handleModalClose = useCallback(() => {
    // do other stuff
    setLoading(false);
    setSlide(1);
    setUserEdit({
      branchId: branch.id,
      status: UserStatusType.EXPLORER,
      accountStatus: UserAccountStatusType.ACTIVE,
    });
    setProfileImageToUpload(null);
    setCoverImageToUpload(null);
    handleClose();
  }, [branch.id, handleClose]);

  const postPatchUserDetails = useCallback(async () => {
    let userId;
    const requestParams = {};
    if (user) {
      userId = user.id;
      requestParams.userId = user.id;
    }
    if (userEdit.givenName !== user?.givenName) {
      requestParams.givenName = userEdit.givenName;
    }
    if (userEdit.familyName !== user?.familyName) {
      requestParams.familyName = userEdit.familyName;
    }
    if (userEdit.preferredName !== user?.preferredName) {
      requestParams.preferredName = userEdit.preferredName;
    }
    if (userEdit.gender !== user?.gender) {
      requestParams.gender = userEdit.gender.toUpperCase();
    }
    if (userEdit.username !== user?.username) {
      requestParams.username = userEdit.username;
    }
    if (userEdit.guardianEmail !== user?.guardianEmail) {
      requestParams.guardianEmail = userEdit.guardianEmail;
    }
    if (userEdit.guardianPhone !== user?.guardianPhone) {
      requestParams.guardianPhone = userEdit.guardianPhone;
    }
    if (userEdit.guardianEmailTwo !== user?.guardianEmailTwo) {
      requestParams.guardianEmailTwo = userEdit.guardianEmailTwo;
    }
    if (userEdit.guardianPhoneTwo !== user?.guardianPhoneTwo) {
      requestParams.guardianPhoneTwo = userEdit.guardianPhoneTwo;
    }
    if (userEdit.dob !== user?.dob) {
      requestParams.dob = userEdit.dob;
    }
    if (userEdit.branchId !== user?.branchId) {
      requestParams.branchId = userEdit.branchId;
    }
    if (userEdit.password !== user?.password) {
      requestParams.newPassword = userEdit.password;
    }
    if (userEdit.description !== user?.description) {
      requestParams.description = userEdit.description;
    }
    if (userEdit.adminNotes !== user?.adminNotes) {
      requestParams.adminNotes = userEdit.adminNotes;
    }
    if (userEdit.isEmailVerified !== user?.isEmailVerified) {
      requestParams.isEmailVerified = userEdit.isEmailVerified;
    }
    if (userEdit.status !== user?.status) {
      requestParams.status = userEdit.status;
    }
    if (userEdit.accountStatus !== user?.accountStatus) {
      requestParams.accountStatus = userEdit.accountStatus;
    }
    if (userEdit.siblingMembers !== user?.siblingMembers) {
      requestParams.siblingMembers = userEdit.siblingMembers;
    }

    if (userEdit.guardianEmail && userEdit.guardianEmailTwo && userEdit.guardianEmail === userEdit.guardianEmailTwo) {
      toast('Both guardians cannot have the same email address');
      return;
    }

    setLoading(true);
    if (Object.keys(requestParams).length > 0) {
      try {
        if (!user) {
          const res = await UserApi.post({ authToken: loggedInUser.authToken, ...requestParams });
          ({ id: userId } = res.data.user);
        } else {
          await UserApi.patch({ authToken: loggedInUser.authToken, ...requestParams });
        }
      } catch (err) {
        toast(err?.response?.data?.message || err.message);
        setLoading(false);
        return;
      }
    }

    if (profileImageToUpload) {
      await UserApi.putImage({
        authToken: loggedInUser.authToken, userId, imageType: 'profile-image', file: profileImageToUpload,
      });
      setProfileImageToUpload(null);
    }
    if (coverImageToUpload) {
      await UserApi.putImage({
        authToken: loggedInUser.authToken, userId, imageType: 'cover-image', file: coverImageToUpload,
      });
      setCoverImageToUpload(null);
    }

    // Find dirty staff role
    if (userEdit.staffRolesDirty) {
      const requestedStaffRoles = userEdit.staffRoles;
      const staffRolesToAdd = [];
      const staffRolesToRemove = [];

      if (user) {
        requestedStaffRoles.forEach((requestedSr) => {
          if (!user.staffRoles.find((userSr) => userSr.id === requestedSr.id)) staffRolesToAdd.push(requestedSr);
        });
        user.staffRoles.forEach((userSr) => {
          if (!requestedStaffRoles.find((requestedSr) => userSr.id === requestedSr.id)) staffRolesToRemove.push(userSr);
        });
      } else {
        staffRolesToAdd.push(...requestedStaffRoles);
      }

      const promises = staffRolesToAdd.map((srToAdd) => StaffRoleApi.postUser({ authToken: loggedInUser.authToken, staffRoleId: srToAdd.id, userId }));
      const promises2 = staffRolesToRemove.map((srToRemove) => StaffRoleApi.deleteUser({ authToken: loggedInUser.authToken, staffRoleId: srToRemove.id, userId }));
      const allPromises = promises.concat(promises2);

      try {
        await Promise.all(allPromises);
      } catch (err) {
        toast(err?.response?.data?.message || err.message);
        setLoading(false);
        return;
      }
    }

    onUserDataChanged();
    setLoading(false);
  }, [loggedInUser, user, userEdit, coverImageToUpload, profileImageToUpload, onUserDataChanged]);

  const onSubmitForm = useCallback(async (evt) => {
    evt.preventDefault();
    await postPatchUserDetails();
    handleModalClose();
    toast.success(t('Profile saved!'));
  }, [postPatchUserDetails, handleModalClose, t]);

  return (
    <Modal
      className="user-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div className="form-container">
        <form onSubmit={onSubmitForm}>
          <CarouselHeader className="entry-options hlo" slideTo={slide}>
            <div onClick={() => { setSlide(1); }}>
              {t('User Info')}
            </div>
            <div onClick={() => { setSlide(2); }}>
              {t('Profile')}
            </div>
            <div onClick={() => { setSlide(3); }}>
              {t('Admin Notes')}
            </div>
            <div onClick={() => { setSlide(4); }}>
              {t('Award')}
            </div>
            <div onClick={() => { setSlide(5); }}>
              {t('Others')}
            </div>
            <div onClick={() => { setSlide(6); }}>
              {t('Staff Roles')}
            </div>
            <div onClick={() => { setSlide(7); }}>
              {t('Account')}
            </div>
          </CarouselHeader>
          <Carousel slideTo={slide}>
            <div>
              <UserInfoTab user={user} branch={branch} authToUpdate={authToUpdate} authToCreate={authToCreate} userEdit={userEdit} setUserEdit={setUserEdit} loading={loading} onBulkImportClick={onBulkImportClick} />
            </div>
            <div>
              <UserProfileDetailsTab user={user} authToUpdate={authToUpdate} loading={loading} userEdit={userEdit} setUserEdit={setUserEdit} profileImageToUpload={profileImageToUpload} setProfileImageToUpload={setProfileImageToUpload} coverImageToUpload={coverImageToUpload} setCoverImageToUpload={setCoverImageToUpload} />
            </div>
            <div className="notes">
              <h3>{t('Admin Notes')}</h3>
              <textarea
                onChange={(e) => { setUserEdit({ ...userEdit, adminNotes: e.target.value }); }}
                value={userEdit?.adminNotes || ''}
                disabled={loading || !authToUpdate}
              />
            </div>
            <div>
              <UserBadge userId={user?.id || 0} authToUpdate={authToUpdate} />
              <UserChallenge userId={user?.id || 0} authToUpdate={authToUpdate} />
            </div>
            <div>
              <UserOthersTab user={user} onUserDataChanged={onUserDataChanged} />
            </div>
            <div>
              <h3>{t('Staff Roles')}</h3>
              <ReactSelect
                className="staff-select"
                menuShouldScrollIntoView={false}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={branch.staffRoles}
                isMulti
                isDisabled={loading || !isAdminUpdate}
                onChange={(e) => { setUserEdit({ ...userEdit, staffRoles: e, staffRolesDirty: true }); }}
                value={userEdit?.staffRoles?.filter((sr) => sr.branchId === branch.id) || []}
              />
            </div>
            <div>
              <UserDangerZoneTab handleModalClose={handleModalClose} user={user} onUserDataChanged={onUserDataChanged} authToUpdate={authToUpdate} authToCreate={authToCreate} loading={loading} setLoading={setLoading} userEdit={userEdit} setUserEdit={setUserEdit} />
            </div>
          </Carousel>

          <div className={slide === 4 || slide === 5 ? 'hide-save-button' : ''}>
            <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default UserModal;
