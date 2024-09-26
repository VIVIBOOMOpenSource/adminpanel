import React, {
  useState, useCallback, useEffect,
} from 'react';
import './check-in-check-out.scss';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import AttendanceApi from 'src/apis/viviboom/AttendanceApi';

import Checkmark from 'src/css/imgs/checked.png';
import MyImage from 'src/components/common/MyImage';
import Loading from 'src/components/common/loading/loading';
import BookingApi from 'src/apis/viviboom/BookingApi';
import { DateTime } from 'luxon';
import { BookingStatusType } from 'src/enums/BookingStatusType';
import Modal from '../../../common/modal/modal';
import PersonSvg from '../../../../css/imgs/icon-person-grey.svg';
import WelcomeModalContent from './welcome-modal-content';

function UserCheckInModal({
  show, handleClick, handleClose, user, authToken, branchId, sessions,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const [success, setSuccess] = useState(false);
  const [selectedEventSessionId, setSelectedEventSessionId] = useState();
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState([]);

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
        authToken,
        userId: user?.id,
        branchId,
        checkInAt: new Date().toISOString(),
      };

      if (selectedEventSessionId !== 'Crew Invite') {
        requestParams.eventId = selectedEventSessionId;
      }

      await AttendanceApi.post(requestParams);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [user?.id, selectedEventSessionId, branchId, authToken]);

  const fetchUserBookings = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        userId: user?.id,
        eventBranchId: branchId,
        startDate: DateTime.local().startOf('day').toISO(),
        endDate: DateTime.local().endOf('day').toISO(),
        status: BookingStatusType.APPROVED,
      };

      const res = await BookingApi.getList(requestParams);
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [authToken, branchId, user?.id]);

  const buttonClicked = async (e) => {
    e.preventDefault();
    await createAttendance();
  };

  const closeModal = (e) => {
    e.preventDefault();
    setSelectedEventSessionId();
    setSuccess(false);
    handleClick();
  };

  const closeSuccessModal = () => {
    setSuccess(false);
    handleClose();
  };

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

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
            <div>
              <MyImage
                src={user?.profileImageUri}
                preloadImage={PersonSvg}
                defaultImage={PersonSvg}
                width={64}
              />
            </div>
            <div className="text">
              {`${user?.givenName} ${user?.familyName}`}
            </div>
          </div>
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
                {bookings.find((b) => b.eventId === v.id) ? ` (${t('You booked this session')})` : ''}
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
            <div className="button-container">
              <button className="modal-btn-back" onClick={closeModal} type="submit">
                {t('This is not me')}
              </button>
              <button disabled={loading} className={`modal-btn ${loading ? 'disabled' : ''}`} onClick={buttonClicked} type="submit">
                {loading ? <Loading show size="24px" /> : t('Check In')}
              </button>
            </div>
          </div>
        </form>
      </div>
      )}
      {success && (
        <div className="success-popup">
          <img src={Checkmark} alt="" width="200" height="200" />
          <h3>
            {t('You are checked in! Have fun!')}
          </h3>
        </div>
      )}
    </Modal>
  );
}

export default UserCheckInModal;
