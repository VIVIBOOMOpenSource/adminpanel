import React, { useState } from 'react';
import './reset-password.scss';

import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import CenterDiv from 'src/components/common/center-div/center-div';
import PasswordInput from 'src/components/common/password-input/password-input';
import Button from 'src/components/common/button/button';

import UserApi from 'src/apis/viviboom/UserApi';

// Mostly the same as verify-email - separate to keep me sane
function ResetPassword() {
  const params = useParams();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [token] = useState(params.token);
  const { t } = useTranslation();

  const handleRequestEmailSubmit = async (e) => {
    e.preventDefault();
    if (email === '') {
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setEmailSent(false);
    try {
      await UserApi.passwordResetToken({ email });
      setEmailSent(true);
      toast(t('email.resetTokenSent'));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword === '') {
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await UserApi.passwordReset({ token, password: newPassword });
      history.push('/welcome');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  if (token) {
    return (
      <CenterDiv>
        <div className="verify-email">
          <h1>{t('email.setNewPassword')}</h1>
          {(errorMessage !== '') ? (
            <ul className="errors">
              <li>{errorMessage}</li>
            </ul>
          ) : ''}
          <form onSubmit={handleSetNewPassword}>
            <label>{t('email.newPassword')}</label>
            <PasswordInput disabled={loading} value={newPassword} placeholder={t('email.newPassword')} onChange={(e) => { setNewPassword(e.target.value); }} />
            <Button disabled={loading} type="submit" status={(loading) ? 'loading' : ''} value={t('email.setPasswordButton')} />
          </form>
        </div>
      </CenterDiv>
    );
  }

  return (
    <CenterDiv>
      <div className="reset-password">
        <h1>{t('email.resetPassword')}</h1>
        {(emailSent) ? (
          <ul className="success">
            <li>{t('email.sentResetPasswordLink')}</li>
          </ul>
        ) : ''}
        {(errorMessage !== '') ? (
          <ul className="errors">
            <li>{errorMessage}</li>
          </ul>
        ) : ''}
        <p>{t('email.resetPasswordText')}</p>
        <form onSubmit={handleRequestEmailSubmit}>
          <label>{t('email.email')}</label>
          <input disabled={loading} type="email" placeholder={t('email.email')} value={email} onChange={(e) => { setEmail(e.target.value); }} />
          <Button disabled={loading} type="submit" status={(loading) ? 'loading' : ''} value={t('email.sendResetPasswordLinkButton')} />
        </form>
      </div>
    </CenterDiv>
  );
}

export default ResetPassword;
