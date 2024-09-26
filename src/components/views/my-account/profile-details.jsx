import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserApi from 'src/apis/viviboom/UserApi';
import UserReduxActions from 'src/redux/user/UserReduxActions';
import Button from '../../common/button/button';
import PasswordInput from '../../common/password-input/password-input';
import Modal from '../../common/modal/modal';

function ProfileDetails() {
  const user = useSelector((state) => state?.user);

  const { t } = useTranslation();

  const changeInfoTypes = {
    username: { display: 'Username' },
    email: { display: 'Email' },
    password: { display: 'Password' },
  };

  const [lastOpenType, setLastOpenType] = useState(changeInfoTypes.username.display);

  const changeInfoInputRef = useRef(null);
  const changeInfoPasswordInputRef = useRef(null);

  const [changeInfoValue, setChangeInfoValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [edittingUsername, setEdittingUsername] = useState(false);
  const [edittingEmail, setEdittingEmail] = useState(false);
  const [edittingPassword, setEdittingPassword] = useState(false);
  const [changeInfoLoading, setChangeInfoLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [changeInfoButtonStatus, setChangeInfoButtonStatus] = useState('save');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setShowModal((edittingUsername || edittingEmail || edittingPassword));
  }, [edittingUsername, edittingEmail, edittingPassword]);

  useEffect(() => {
    setChangeInfoButtonStatus((changeInfoLoading) ? 'loading' : 'save');
  }, [changeInfoLoading]);

  const handleModalClose = () => {
    setErrorMessage('');
    setChangeInfoLoading(false);
    setChangeInfoValue('');
    setConfirmPassword('');
    setEdittingUsername(false);
    setEdittingEmail(false);
    setEdittingPassword(false);
    setShowModal(false);
  };

  const formHandler = async (e) => {
    e.preventDefault();
    if (changeInfoValue === '') return false;
    if (confirmPassword === '' && user.passSet) return false;

    const { authToken, id: userId } = user;
    const data = { authToken, userId, curPassword: confirmPassword };

    if (edittingUsername) {
      data.username = changeInfoValue;
    } else if (edittingEmail) {
      data.guardianEmail = changeInfoValue;
    } else if (edittingPassword) {
      data.newPassword = changeInfoValue;
    }

    setErrorMessage('');
    try {
      await UserApi.patch(data);

      let message = 'Success!';
      if (edittingUsername) {
        message = t('myAccount.successUsername');
      }
      if (edittingPassword) {
        message = t('myAccount.successPassword');
      }
      if (edittingEmail) {
        message = t('myAccount.successEmail', { email: data.guardianEmail });
      }
      toast.success(message);
      handleModalClose();
    } catch (err) {
      toast.error(err.message);
    }

    await UserReduxActions.fetch();
    return setChangeInfoLoading(false);
  };

  return (
    <div className="profile-details">
      <h3>{t('myAccount.profile')}</h3>
      <div>
        <div className="profile-detail">
          <label>{t('myAccount.username')}</label>
          <div>
            <input type="text" disabled value={user.username} />
            <Button
              type="button"
              status="edit"
              disabled
              onClick={() => {
                setEdittingUsername(true);
                setLastOpenType(changeInfoTypes.username.display);
              }}
            >
              {t('common.edit')}
            </Button>
          </div>
        </div>
        <div className="profile-detail">
          <label>{t('myAccount.email')}</label>
          <div>
            <input type="text" disabled value={user.guardianEmail} />
            <Button
              type="button"
              status="edit"
              onClick={() => {
                setEdittingEmail(true);
                setLastOpenType(changeInfoTypes.email.display);
              }}
            >
              {t('common.edit')}
            </Button>
          </div>
        </div>
        <div className="profile-detail">
          <label>{t('myAccount.password')}</label>
          <div>
            <input type="text" disabled value="••••••••" />
            <Button
              type="button"
              status="edit"
              onClick={() => {
                setEdittingPassword(true);
                setLastOpenType(changeInfoTypes.password.display);
              }}
            >
              {t('common.edit')}
            </Button>
          </div>
        </div>
      </div>

      <Modal className="change-info-modal" show={showModal} handleClose={handleModalClose}>
        <div className="change-info">
          <form onSubmit={formHandler}>
            <h3>{(lastOpenType === changeInfoTypes.password.display) ? t(`myAccount.setNew${lastOpenType}`) : t(`myAccount.change${lastOpenType}`)}</h3>
            {(errorMessage !== '')
              ? (
                <ul className="errors">
                  <li>{errorMessage}</li>
                </ul>
              )
              : ''}

            {(lastOpenType !== changeInfoTypes.password.display)
              ? (
                <div>
                  <label>{t(`myAccount.new${lastOpenType}`)}</label>
                  <input
                    type={(edittingEmail) ? 'email' : 'text'}
                    placeholder={t(`myAccount.new${lastOpenType}`)}
                    disabled={changeInfoLoading}
                    ref={changeInfoInputRef}
                    onChange={(e) => { setChangeInfoValue(e.target.value); }}
                    value={changeInfoValue}
                  />
                </div>
              )
              : ''}

            <div>
              <label>
                {(lastOpenType === changeInfoTypes.password.display) ? t('myAccount.currentPassword') : t('myAccount.password')}
                <span className="forgot-password"><Link tabIndex="-1" to="/reset-password">{t('myAccount.forgotPassword')}</Link></span>
              </label>
              <PasswordInput
                onChange={(e) => { setConfirmPassword(e.target.value); }}
                disabled={changeInfoLoading}
                value={confirmPassword}
                placeholder={((lastOpenType === changeInfoTypes.password.display) ? t('myAccount.currentPassword') : t('myAccount.password'))}
                passRef={changeInfoPasswordInputRef}
              />
            </div>

            {(lastOpenType === changeInfoTypes.password.display)
              ? (
                <div>
                  <label>{t('myAccount.newPassword')}</label>
                  <PasswordInput
                    disabled={changeInfoLoading}
                    onChange={(e) => { setChangeInfoValue(e.target.value); }}
                    placeholder={t('myAccount.newPassword')}
                    value={changeInfoValue}
                  />
                </div>
              )
              : ''}
            <Button type="submit" status={changeInfoButtonStatus} value={t(`myAccount.setNew${lastOpenType}`)} />
          </form>
        </div>
      </Modal>

    </div>
  );
}

export default ProfileDetails;
