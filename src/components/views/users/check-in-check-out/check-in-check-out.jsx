import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { DateTime } from 'luxon';

import './check-in-check-out.scss';

import EventApi from 'src/apis/viviboom/EventApi';

import UserCheckInCheckOut from './user-check-in-check-out';
import VisitorCheckInCheckOut from './visitor-check-in-check-out';

function CheckInCheckOut() {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const history = useHistory();
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const { allowVisitorAttendance } = branch;

  const [identity, setIdentity] = useState(!allowVisitorAttendance);
  const [isVisitor, setIsVisitor] = useState(false);
  const [sessions, setSessions] = useState([]);

  const getEventSessions = useCallback(async () => {
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        branchId: branch.id,
        startDate: DateTime.local().startOf('day').toISO(),
        endDate: DateTime.local().endOf('day').toISO(),
      };
      const res = await EventApi.getList(requestParams);
      setSessions(res.data?.events);
    } catch (err) {
      toast.error(err);
    }
  }, [loggedInUser.authToken, branch.id]);

  function handleVivinaut() {
    setIdentity(true);
    setIsVisitor(false);
  }

  function handleVisitor() {
    setIsVisitor(true);
    setIdentity(true);
  }

  function resetIdentityState() {
    setIdentity(!allowVisitorAttendance);
  }

  useEffect(() => {
    getEventSessions();
  }, [getEventSessions]);

  return (
    <div className="check-in-check-out-global">
      <div className="check-in-forms">
        {allowVisitorAttendance && !identity && (
          <div className="sign-up-forms-container">
            <div className="title-container">
              <div className="info-title">{t('Welcome to the wonderful world of Vivistop!')}</div>
              <div className="info-subtitle">{t('Let us know who you are!')}</div>
            </div>
            <div className="info-text">{t('I am a ...')}</div>
            <div className="identity-buttons">
              <button className="identity-button vivinaut" onClick={handleVivinaut} type="submit">
                {t('Vivinaut')}
              </button>
              <button className="identity-button visitor" onClick={handleVisitor} type="submit">
                {t('Visitor')}
              </button>
            </div>
          </div>
        )}
        {identity && !isVisitor && (
          <UserCheckInCheckOut
            allowVisitorAttendance={allowVisitorAttendance}
            resetState={() => resetIdentityState()}
            authToken={loggedInUser.authToken}
            sessions={sessions}
          />
        )}
        {identity && isVisitor && (
          <VisitorCheckInCheckOut
            resetState={() => resetIdentityState()}
            authToken={loggedInUser.authToken}
            sessions={sessions}
          />
        )}
      </div>
      {loggedInUser.institutionId === 1 && (
        <button className="space-button" type="button" onClick={() => history.push('/kampongeunos')}>
          {t('Visualize yourself in the space!')}
        </button>
      )}
    </div>
  );
}

export default CheckInCheckOut;
