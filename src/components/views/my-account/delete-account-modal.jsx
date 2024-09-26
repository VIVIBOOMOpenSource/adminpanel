import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from 'src/components/common/button/button';
import PasswordInput from 'src/components/common/password-input/password-input';
import Modal from 'src/components/common/modal/modal';

import UserApi from 'src/apis/viviboom/UserApi';
import UserReduxActions from 'src/redux/user/UserReduxActions';

function DeleteAccountModal({ show, handleClose }) {
  const user = useSelector((state) => state?.user);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const passwordInputRef = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    setStatus((loading) ? 'loading' : 'delete');
  }, [loading]);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    try {
      await UserApi.deleteUser({ authToken: user.authToken, userId: user.id, password });
      toast.success(t('accountDeleted'));
      await UserReduxActions.clearUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      console.log(err);
    }
    setLoading(false);
  }, [password, user.authToken, user.id, t]);

  const formHandler = async (e) => {
    e.preventDefault();

    await deleteAccount();
  };

  const handleModalClose = () => {
    // do other stuff
    setPassword('');
    handleClose();
  };

  return (
    <Modal className="delete-account-modal" show={show} handleClose={handleModalClose}>
      <div className="change-info">
        <form onSubmit={formHandler}>
          <h3>{t('myAccount.deleteAccount')}</h3>
          <p>{t('myAccount.deleteAccountText')}</p>

          <label>
            {t('myAccount.password')}
            <span className="forgot-password"><Link tabIndex="-1" to="/reset-password">{t('myAccount.forgotPassword')}</Link></span>
          </label>
          <PasswordInput
            onChange={(e) => { setPassword(e.target.value); }}
            disabled={loading}
            value={password}
            placeholder={t('myAccount.password')}
            passRef={passwordInputRef}
          />

          <Button type="submit" parentClassName="delete" status={status} value={t('myAccount.deleteAccountForever')} />
        </form>
      </div>
    </Modal>
  );
}

export default DeleteAccountModal;
