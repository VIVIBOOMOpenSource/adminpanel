import React, { useState, useCallback } from 'react';
import './check-in-check-out.scss';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import AttendanceApi from 'src/apis/viviboom/AttendanceApi';

import Checkmark from 'src/css/imgs/checked.png';
import Loading from 'src/components/common/loading/loading';
import { useSelector } from 'react-redux';
import Modal from '../../../common/modal/modal';
import PersonSvg from '../../../../css/imgs/icon-person-grey.svg';
import WelcomeModalContent from './welcome-modal-content';

function VisitorCheckInModal({
  show, handleClose, handleSuccess, visitorDetails, selectedEventSession, sessions,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const branch = useSelector((state) => state.branch);
  const user = useSelector((state) => state.user);
  const [success, setSuccess] = useState(false);
  const [selectedEventSessionId, setSelectedEventSessionId] = useState();
  const [loading, setLoading] = useState(false);

  const handleSessionChange = (event) => {
    const sessionId = event.target.value;
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedEventSessionId(sessionId);
    } else {
      setSelectedEventSessionId();
    }
  };

  const createAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: user?.authToken,
        branchId: branch?.id,
        checkInAt: new Date().toISOString(),
        ...visitorDetails,
      };

      if (selectedEventSessionId !== 'Crew Invite') {
        requestParams.eventId = selectedEventSessionId || selectedEventSession?.id;
      }

      await AttendanceApi.post(requestParams);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [user?.authToken, branch?.id, visitorDetails, selectedEventSessionId, selectedEventSession?.id]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    await createAttendance();
  };

  const closeModal = (e) => {
    e?.preventDefault();
    setSelectedEventSessionId();
    setSuccess(false);
    handleClose();
  };

  const closeSuccessModal = () => {
    setSelectedEventSessionId();
    setSuccess(false);
    handleSuccess();
  };

  return (
    <Modal
      className="check-in-modal"
      show={show}
      handleClose={success ? closeSuccessModal : closeModal}
    >
      {!success && (
        <div className="checkin-popup">
          <form>
            <h1>
              {t('Check In')}
            </h1>
            <div className="profile">
              <img src={PersonSvg} alt="profile" />
              <div className="text">
                {visitorDetails?.visitorName}
              </div>
            </div>
            {!!selectedEventSession && (
              <div className="visitor-info">
                <h3>Booking Info (Please check if this is accurate)</h3>
                <div className="visitor-info-text">
                  Name:
                  {' '}
                  {visitorDetails?.visitorName}
                </div>
                <div className="visitor-info-text">
                  Email:
                  {' '}
                  {visitorDetails?.visitorEmail}
                </div>
                <div className="visitor-info-text">
                  Phone:
                  {' '}
                  {visitorDetails?.visitorPhone}
                </div>
                <div className="visitor-info-text">
                  Event:
                  {' '}
                  {selectedEventSession?.title}
                </div>
              </div>
            )}
            {!selectedEventSession && (
              <div className="sessions">
                <h3>
                  {t('Which session are you attending today?')}
                </h3>
                {sessions.map((v) => (
                  <label key={v.id}>
                    <input
                      type="radio"
                      value={v.id}
                      onChange={handleSessionChange}
                      checked={selectedEventSessionId === v.id.toString()}
                    />
                    {' '}
                    {v.title}
                  </label>
                ))}
                <label key="Crew Invite">
                  <input
                    type="radio"
                    value="Crew Invite"
                    onChange={handleSessionChange}
                    checked={selectedEventSessionId === 'Crew Invite'}
                  />
                  {' '}
                  {t('Crew Invite')}
                </label>
              </div>
            )}
            <div className="button-container">
              <button className="modal-btn-back" onClick={closeModal} type="submit">
                {t('This is not me')}
              </button>
              <button disabled={loading} className={`modal-btn ${loading ? 'disabled' : ''}`} onClick={handleCheckIn} type="submit">
                {loading ? <Loading show size="24px" /> : t('Check In')}
              </button>
            </div>
          </form>
        </div>
      )}
      {success && (
        <div className="success-popup">
          <div>
            <img src={Checkmark} alt="" width="200" height="200" />
            <h3>
              {t('You are checked in! Have fun!')}
            </h3>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default VisitorCheckInModal;
