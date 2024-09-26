import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './google-calendar.scss';

import Config from 'src/config';

import BranchApi from 'src/apis/viviboom/BranchApi';
import Button from 'src/components/common/button/button';

function GoogleCalendar() {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const { search } = useLocation();
  const history = useHistory();
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(branch.gcalClientId || '');
  const [googleClientSecret, setGoogleClientSecret] = useState('');

  // step 1: handle user submit client id, redirect to google oauth
  const handleSubmit = async () => {
    if (!googleClientId) return toast.error(t('Please fill up your Google client ID.'));

    if (!googleClientSecret.length) return toast.error(t('Please fill up your Google client secret.'));

    const redirectUri = `${Config.Common.AdminFrontEndUrl}/google-calendar`; // handle code exchange

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&scope=https://www.googleapis.com/auth/calendar`;

    const requestBody = {
      authToken,
      branchId: branch.id,
      gcalClientId: googleClientId,
      gcalClientSecret: googleClientSecret,
    };

    if (!window.confirm(t('Are you sure you want to change the Google client ID and client secret pair?'))) return toast.error(t('Update of Google credentials cancelled.'));

    setLoading(true);
    try {
      await BranchApi.patch(requestBody);
      setLoading(false);
      window.open(authUrl, '_self');
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    return setLoading(false);
  };

  // step 2: after oauth process parse code and send to server
  const sendCode = useCallback(async () => {
    const query = new URLSearchParams(search);
    // expect code or error post oauth
    const code = query.get('code');
    const error = query.get('error');
    if (error || !code) {
      if (error) toast.error(error);
      return history.replace('/my-branch');
    }
    setLoading(true);
    try {
      await BranchApi.patchGcalAuth({ authToken, branchId: branch.id, code });
      toast.success('Google calendar setting updated.');
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    // remove the code query params
    history.replace('/my-branch');
    return setLoading(false);
  }, [authToken, branch.id, history, search]);

  useEffect(() => {
    sendCode();
  }, [sendCode]);

  return (
    <div className="country-data-container">
      <h2>
        {t('Sync Google Calendar')}
        {' '}
        (
        <a
          href="https://vivitasg.notion.site/Setting-Up-Google-Calendar-Sync-with-VIVIBOOM-e55014ac6835498782db3976c7c7c5eb"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'blue' }}
        >
          {t('how-to guide')}
        </a>
        )
      </h2>

      {!!branch.gcalClientId && (
      <div className="gcal-warning">
        <h4>
          ⚠️
          {' '}
          {t('There is a set of credentials (client ID, client secret, OAuth refresh token) for this branch.')}
        </h4>
        <h4>
          ⚠️
          {' '}
          {t('Please note that if you try to submit a new pair of client ID and client secret, it will erase the existing pair!')}
        </h4>
      </div>
      )}
      <label>{t('Google Client ID')}</label>
      <input type="text" value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} />
      <label>{t('Google Client Secret')}</label>
      <input type="text" value={googleClientSecret} onChange={(e) => setGoogleClientSecret(e.target.value)} />

      <h5>{t("Note: if you are an Admin, you will make changes to your branch's google calender integration.")}</h5>
      <div className="gcal-btn-container">
        <Button
          status={loading ? 'loading' : 'save'}
          className="gcal-btn"
          onClick={handleSubmit}
          disabled={!googleClientSecret || !googleClientId}
        >
          {t('Sync Google Calendar Credentials')}
        </Button>
      </div>
    </div>
  );
}

export default GoogleCalendar;
