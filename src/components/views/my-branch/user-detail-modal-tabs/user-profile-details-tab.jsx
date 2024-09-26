import React from 'react';
import './user-profile-details-tab.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import MyImage from 'src/components/common/MyImage';
import { getBase64 } from '../../../../utils/object';

const MAX_IMAGE_SIZE = 1024 * 1024;

function UserProfileDetailsTab({
  user, authToUpdate, loading, userEdit, setUserEdit, profileImageToUpload, setProfileImageToUpload, coverImageToUpload, setCoverImageToUpload,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });

  return (
    <div className="profile-details">
      <h3>{t('Profile Details')}</h3>
      <p>Keep the images under 1MB in size.</p>
      <div>
        <div className="image">
          <MyImage src={profileImageToUpload || user?.profileImageUri} />
          <label className="button">
            {t('Upload Profile Picture')}
            <input
              type="file"
              accept="image/x-png,image/gif,image/jpeg"
              onChange={(e) => {
                const file = e.currentTarget.files.length >= 1 ? e.currentTarget.files[0] : null;
                if (file.size > MAX_IMAGE_SIZE) {
                  toast.error(t('File is too large. Max File size: 1MB'));
                } else {
                  getBase64(file, (base64) => {
                    if (base64) setProfileImageToUpload(base64);
                  });
                }
              }}
              disabled={loading || !authToUpdate}
            />
          </label>
        </div>

        <div className="image">
          <MyImage src={coverImageToUpload || user?.coverImageUri} />
          <label className="button">
            {t('Upload Cover Picture')}
            <input
              type="file"
              accept="image/x-png,image/gif,image/jpeg"
              onChange={(e) => {
                const file = e.currentTarget.files.length >= 1 ? e.currentTarget.files[0] : null;
                if (file.size > MAX_IMAGE_SIZE) {
                  toast.error(t('File is too large. Max File size: 1MB'));
                } else {
                  getBase64(file, (base64) => {
                    if (base64) setCoverImageToUpload(base64);
                  });
                }
              }}
              disabled={loading || !authToUpdate}
            />
          </label>
        </div>

        <label>{t('Profile Description')}</label>
        <textarea
          onChange={(e) => { setUserEdit({ ...userEdit, description: e.target.value }); }}
          value={userEdit?.description || ''}
          disabled={loading || !authToUpdate}
        />
      </div>
    </div>
  );
}

export default UserProfileDetailsTab;
