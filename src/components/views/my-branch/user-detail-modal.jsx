import React, { useState, useEffect, useCallback } from 'react';
import './user-detail-modal.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UserApi from 'src/apis/viviboom/UserApi';
import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import ReactSelect from 'react-select';
import StaffRoleApi from 'src/apis/viviboom/StaffRoleApi';
import { UserAccountStatusType } from 'src/enums/UserAccountStatusType';
import { UserStatusType } from 'src/enums/UserStatusType';
import Button from '../../common/button/button';
import Modal from '../../common/modal/modal';
import CarouselHeader from '../../common/carousel/carousel-header';
import Carousel from '../../common/carousel/carousel';

import UserInfoTab from './user-detail-modal-tabs/user-info-tab';
import UserGuardianInfoTab from './user-detail-modal-tabs/user-guardian-info-tab';
import UserProfileDetailsTab from './user-detail-modal-tabs/user-profile-details-tab';
import UserDangerZoneTab from './user-detail-modal-tabs/user-danger-zone-tab';

function UserDetailModal({
  show, handleClose, user, onUserDataChanged, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);

  const [userEdit, setUserEdit] = useState();

  const [profileImageToUpload, setProfileImageToUpload] = useState(null);
  const [coverImageToUpload, setCoverImageToUpload] = useState(null);

  const [slide, setSlide] = useState(1);

  useEffect(() => {
    if (user) {
      setUserEdit(structuredClone(user));
    } else {
      setUserEdit({
        branchId: branch.id,
        status: UserStatusType.EXPLORER,
        accountStatus: UserAccountStatusType.ACTIVE,
        mediaReleaseConsent: true,
      });
    }
  }, [branch.id, user]);

  const handleModalClose = useCallback(() => {
    // do other stuff
    setLoading(false);
    setSlide(1);
    setUserEdit({
      branchId: branch.id,
      status: UserStatusType.EXPLORER,
      accountStatus: UserAccountStatusType.ACTIVE,
      mediaReleaseConsent: true,
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
    // vivinaut
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
    if (userEdit.dob !== user?.dob) {
      requestParams.dob = userEdit.dob;
    }
    if (userEdit.school !== user?.school) {
      requestParams.school = userEdit.school;
    }
    if (userEdit.educationLevel !== user?.educationLevel) {
      requestParams.educationLevel = userEdit.educationLevel;
    }
    if (userEdit.email !== user?.email) {
      requestParams.email = userEdit.email;
    }
    if (userEdit.phone !== user?.phone) {
      requestParams.phone = userEdit.phone;
    }
    if (userEdit.username !== user?.username) {
      requestParams.username = userEdit.username;
    }
    if (userEdit.branchId !== user?.branchId) {
      requestParams.branchId = userEdit.branchId;
    }
    if (userEdit.password !== user?.password) {
      requestParams.newPassword = userEdit.password;
    }
    // guardian
    if (userEdit.guardianName !== user?.guardianName) {
      requestParams.guardianName = userEdit.guardianName;
    }
    if (userEdit.guardianRelationship !== user?.guardianRelationship) {
      requestParams.guardianRelationship = userEdit.guardianRelationship.toUpperCase();
    }
    if (userEdit.address !== user?.address) {
      requestParams.address = userEdit.address;
    }
    if (userEdit.guardianEmail !== user?.guardianEmail) {
      requestParams.guardianEmail = userEdit.guardianEmail;
    }
    if (userEdit.guardianPhone !== user?.guardianPhone) {
      requestParams.guardianPhone = userEdit.guardianPhone;
    }
    if (userEdit.guardianNameTwo !== user?.guardianNameTwo) {
      requestParams.guardianNameTwo = userEdit.guardianNameTwo;
    }
    if (userEdit.guardianRelationshipTwo !== user?.guardianRelationshipTwo) {
      requestParams.guardianRelationshipTwo = userEdit.guardianRelationshipTwo.toUpperCase();
    }
    if (userEdit.guardianEmailTwo !== user?.guardianEmailTwo) {
      requestParams.guardianEmailTwo = userEdit.guardianEmailTwo;
    }
    if (userEdit.guardianPhoneTwo !== user?.guardianPhoneTwo) {
      requestParams.guardianPhoneTwo = userEdit.guardianPhoneTwo;
    }
    // account
    if (userEdit.accountStatus !== user?.accountStatus) {
      requestParams.accountStatus = userEdit.accountStatus;
    }
    // others
    if (userEdit.description !== user?.description) {
      requestParams.description = userEdit.description;
    }
    if (userEdit.adminNotes !== user?.adminNotes) {
      requestParams.adminNotes = userEdit.adminNotes;
    }
    if (userEdit.status !== user?.status) {
      requestParams.status = userEdit.status;
    }
    if (userEdit.isEmailVerified !== user?.isEmailVerified) {
      requestParams.isEmailVerified = userEdit.isEmailVerified;
    }
    if (userEdit.mediaReleaseConsent !== user?.mediaReleaseConsent) {
      requestParams.mediaReleaseConsent = userEdit.mediaReleaseConsent;
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
  }, [coverImageToUpload, loggedInUser.authToken, onUserDataChanged, profileImageToUpload, user, userEdit]);

  const onSubmitForm = useCallback(async (evt) => {
    evt.preventDefault();
    postPatchUserDetails();
    handleModalClose();
    toast.success(t('Profile saved!'));
  }, [handleModalClose, postPatchUserDetails, t]);

  return (
    <Modal
      className="user-detail-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <form onSubmit={onSubmitForm}>
          <CarouselHeader className="entry-options hlo" slideTo={slide}>
            <div onClick={() => { setSlide(1); }}>
              {t('VIVINAUT Info')}
            </div>
            <div onClick={() => { setSlide(2); }}>
              {t('Guardian Info')}
            </div>
            <div onClick={() => { setSlide(3); }}>
              {t('Profile')}
            </div>
            <div onClick={() => { setSlide(4); }}>
              {t('Admin Notes')}
            </div>
            <div onClick={() => { setSlide(5); }}>
              {t('Staff Roles')}
            </div>
            <div onClick={() => { setSlide(6); }}>
              {t('Account')}
            </div>
          </CarouselHeader>
          <Carousel slideTo={slide}>
            <div>
              <UserInfoTab user={user} branch={branch} authToUpdate={authToUpdate} userEdit={userEdit} setUserEdit={setUserEdit} loading={loading} />
            </div>
            <div>
              <UserGuardianInfoTab branch={branch} authToUpdate={authToUpdate} userEdit={userEdit} setUserEdit={setUserEdit} loading={loading} />
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
              <h3>{t('Staff Roles')}</h3>
              <ReactSelect
                className="staff-select"
                menuShouldScrollIntoView={false}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={branch.staffRoles}
                isMulti
                isDisabled={loading || branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.STAFF_ROLE] < StaffRolePrivilegeLevel.UPDATE}
                onChange={(e) => { setUserEdit({ ...userEdit, staffRoles: e, staffRolesDirty: true }); }}
                value={userEdit?.staffRoles || []}
              />
            </div>
            <div>
              <UserDangerZoneTab handleModalClose={handleModalClose} user={user} onUserDataChanged={onUserDataChanged} authToUpdate={authToUpdate} authToCreate={authToCreate} loading={loading} setLoading={setLoading} userEdit={userEdit} setUserEdit={setUserEdit} />
            </div>
          </Carousel>

          <div>
            <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default UserDetailModal;
