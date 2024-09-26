import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './sign-in.scss';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import UserReduxActions from 'src/redux/user/UserReduxActions';
import Button from 'src/components/common/button/button';
import PasswordInput from 'src/components/common/password-input/password-input';

function SignIn() {
  const { t } = useTranslation('translation', { keyPrefix: 'entry' });
  const user = useSelector((state) => state.user);
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (username !== '' && password !== '') {
      setLoading(true);
      setErrorMessage('');

      try {
        await UserReduxActions.login({ username, password });
      } catch (err) {
        if (err.response?.message?.contains?.('email')) {
          setErrorMessage(
            <span>
              {t('pleaseVerifyYourEmail')}
              {' '}
              <Link to="/verify-email">
                {t('pleaseVerifyYourEmailLinkText')}
              </Link>
            </span>,
          );
        } else {
          toast.error(err.response?.data?.message ?? err.message);
        }
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.authToken) {
      history.push('/');
    }
  }, [user, t, history]);

  return (
    <div className="sign-in">
      {(errorMessage !== '') ? <ul className="errors"><li>{errorMessage}</li></ul> : ''}

      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <p className="signin-info-text">
            {t('Admin Portal Login')}
          </p>
          <div className="input-container">
            <label>{t('username')}</label>
            <input disabled={loading} type="text" placeholder={t('username')} defaultValue={username} onChange={(e) => { setUsername(e.target.value); }} />
          </div>

          <div className="input-container">
            <label>{t('password')}</label>
            <PasswordInput disabled={loading} placeholder={t('password')} defaultValue={password} onChange={(e) => { setPassword(e.target.value); }} />
          </div>
          <Button parentClassName="login-button" disabled={loading} type="submit" status={loading ? 'loading' : ''} value={t('login')} />
        </form>
        <Link className="reset-password" to="/reset-password">{t('troubleLoggingIn')}</Link>
      </div>
    </div>
  );
}

export default SignIn;
