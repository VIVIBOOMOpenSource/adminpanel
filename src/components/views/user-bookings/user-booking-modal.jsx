import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import './user-booking-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';

import BranchApi from 'src/apis/viviboom/BranchApi';
import BookingApi from 'src/apis/viviboom/BookingApi';
import EventApi from 'src/apis/viviboom/EventApi';
import UserApi from 'src/apis/viviboom/UserApi';

import { BookingStatusType } from 'src/enums/BookingStatusType';
import { EventType } from 'src/enums/EventType';
import { PublicAccessType } from 'src/enums/PublicAccessType';
import UserQuestionResponses from './user-question-responses';

const status2Text = {
  [BookingStatusType.SUBMITTED]: 'Submitted',
  [BookingStatusType.APPROVED]: 'Approved',
  [BookingStatusType.REJECTED]: 'Rejected',
  [BookingStatusType.CANCELLED]: 'Cancelled',
};

const nextStatus = {
  [BookingStatusType.SUBMITTED]: [BookingStatusType.SUBMITTED, BookingStatusType.APPROVED, BookingStatusType.REJECTED, BookingStatusType.CANCELLED],
  [BookingStatusType.APPROVED]: [BookingStatusType.APPROVED, BookingStatusType.CANCELLED],
  [BookingStatusType.REJECTED]: [BookingStatusType.REJECTED, BookingStatusType.APPROVED, BookingStatusType.CANCELLED],
  [BookingStatusType.CANCELLED]: [BookingStatusType.CANCELLED, BookingStatusType.APPROVED],
};

const DEFAULT_LIMIT = 20;

function UserBookingModal({
  show, handleClose, refreshBookings, booking, authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'userBooking' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(BookingStatusType.SUBMITTED);
  const [statusMessage, setStatusMessage] = useState('');

  // for create booking
  const [branches, setBranches] = useState([]);
  const [selectedBranchOption, setSelectedBranchOption] = useState(null); // branchId
  const [selectedUserOption, setSelectedUserOption] = useState(null); // user
  const [selectedEventOption, setSelectedEventOption] = useState(null); // event

  const [userQuota, setUserQuota] = useState(null);
  const [bookingResponses, setBookingResponses] = useState([]);
  const [checkoutResponses, setCheckoutResponses] = useState([]);

  const fetchBookingResponses = useCallback(async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const res = await EventApi.getResponse({ authToken: user.authToken, eventId: booking.eventId, bookingId: booking.id });
      const bookingResponsesRaw = res.data?.responses[0]?.userResponses;
      // group by event question id
      const bookingResponsesByQuestionId = {};
      bookingResponsesRaw?.forEach((resp) => {
        if (!(resp.eventQuestionId in bookingResponsesByQuestionId)) bookingResponsesByQuestionId[resp.eventQuestionId] = [];
        bookingResponsesByQuestionId[resp.eventQuestionId].push(resp);
      });
      setBookingResponses(bookingResponsesByQuestionId);
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  }, [booking, user.authToken]);

  const fetchCheckoutResponses = useCallback(async () => {
    if (!booking.attendance) return;
    if (!booking.attendance.checkOutAt) return;
    setLoading(true);
    try {
      const res = await EventApi.getAttendanceResponse({
        authToken: user.authToken,
        eventId: booking.eventId,
        attendanceId: booking.attendance.id,
      });

      const { responses } = res.data;
      // group by event question id
      const checkoutResponsesByQuestionId = {};
      responses?.forEach((resp) => {
        const { userResponse } = resp;
        if (!(userResponse.eventQuestionId in checkoutResponsesByQuestionId)) checkoutResponsesByQuestionId[userResponse.eventQuestionId] = [];
        checkoutResponsesByQuestionId[userResponse.eventQuestionId].push(userResponse);
      });

      setCheckoutResponses(checkoutResponsesByQuestionId);
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  }, [booking, user.authToken]);

  const fetchBranches = useCallback(async (event) => {
    if (booking || !event) return;
    setLoading(true);
    try {
      // TO-DO: load branches based on the branches that the event is open to
      const res = await BranchApi.getList({ authToken: user.authToken, countryISO: event.branch.countryISO });
      setBranches(res.data?.branches?.map((b) => ({ value: b.id, label: b.name })));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  }, [booking, user.authToken]);

  const fetchUserQuota = useCallback(async () => {
    if (!booking && (!selectedUserOption || !selectedEventOption)) return;
    setLoading(true);
    try {
      const event = booking ? booking.event : selectedEventOption.value;
      const curUser = booking ? booking.user : selectedUserOption.value;
      const eventDate = DateTime.fromJSDate(new Date(event.startAt), { zone: curUser.branch.tzIANA });

      const res = await UserApi.getQuota({
        authToken: user.authToken,
        userId: curUser.id,
        month: eventDate.month,
        year: eventDate.year,
      });

      setUserQuota(res.data?.userBookingQuota);
    } catch (err) {
      // toast.error(err.message);
      // console.log(err);
    }
    setLoading(false);
  }, [booking, selectedEventOption, selectedUserOption, user.authToken]);

  // load data and responses if exists
  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      if (booking.statusMessage) setStatusMessage(booking.statusMessage);
      fetchBookingResponses();
      fetchCheckoutResponses();
    }
    fetchUserQuota();
  }, [booking, fetchBookingResponses, fetchUserQuota]);

  const handleModalClose = () => {
    // do other stuff
    setTab(1);
    setStatus(BookingStatusType.SUBMITTED);
    setStatusMessage('');
    setBookingResponses([]);
    setCheckoutResponses([]);
    setSelectedEventOption(null);
    setSelectedBranchOption(null);
    setSelectedUserOption(null);
    setUserQuota(null);
    handleClose();
  };

  const saveBooking = async () => {
    if (!booking) {
      // create booking
      if (!selectedUserOption) {
        toast.error(t('Please select user'));
        return;
      }
      if (!selectedEventOption) {
        toast.error(t('Please select event'));
        return;
      }

      const requestBody = {
        authToken: user.authToken,
        userId: selectedUserOption.value.id,
        eventId: selectedEventOption.value.id,
        statusMessage,
      };
      setLoading(true);
      try {
        await BookingApi.post(requestBody);
        await refreshBookings();
        handleModalClose();
        toast.success(t('User booking added'));
      } catch (err) {
        // if unsuccessful, ask if want to ignore quota limit
        // toast.error(err.response.data.message);
        console.log(err.response?.data?.message);
        if (err.response.data.message === 'Monthly quota of the user has been used up') {
          if (window.confirm(t('This user has used up all their quota for the month, ignore monthly quota and still book for them?'))) {
            try {
              requestBody.isForceCreate = true;
              await BookingApi.post(requestBody);
              await refreshBookings();
              handleModalClose();
              toast.success(t('User booking added'));
            } catch (error) {
              toast.error(error.message);
              console.log(error);
            }
          }
        }
      }
      setLoading(false);
    } else {
      const requestBody = {
        authToken: user.authToken,
        bookingId: booking.id,
        statusMessage,
      };

      if (status !== booking.status) requestBody.status = status;

      setLoading(true);
      try {
        await BookingApi.patch(requestBody);
        await refreshBookings();
        handleModalClose();
        toast.success(t('User booking modified'));
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const loadUserOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken: user.authToken,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };

      if (keywords) requestParams.username = keywords;
      if (selectedBranchOption) requestParams.branchId = selectedBranchOption.value;

      const res = await UserApi.getList(requestParams);
      const { users, count } = res.data;
      return {
        options: users.map((u) => ({ value: u, label: `${u.username}, ${u.name}` })),
        hasMore: prevOptions.length + users.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  const handleChangeSelectedEvent = async (option) => {
    await fetchBranches(option.value);
    setSelectedEventOption(option);
  };

  const loadEventOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken: user.authToken,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
        startDate: (new Date()).toISOString(),
        branchId: branch.id,
        publicAccessTypes: [PublicAccessType.NONE, PublicAccessType.VIEW, PublicAccessType.BOOK],
      };

      if (keywords) requestParams.title = keywords;

      const res = await EventApi.getList(requestParams);
      const { events, count } = res.data;
      return {
        options: events.map((e) => (
          {
            value: e,
            label: `${e.title || t('Free Flow')}: ${DateTime.fromISO(e.startAt).toLocaleString(DateTime.DATETIME_MED)}, ${e.duration} ${t('hours')}, (${e.bookingCount}/${e.maxSlots}) ${t('slots')}`,
          }
        )),
        hasMore: prevOptions.length + events.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // save booking
    await saveBooking();
  };

  return (
    <Modal
      className="user-booking-modal"
      show={show}
      handleClose={handleModalClose}
    >
      {booking ? (
        <div>
          <form onSubmit={handleSubmit}>
            <CarouselHeader className="entry-options hlo" slideTo={tab}>
              <div onClick={() => setTab(1)}>{t('Booking Status')}</div>
              <div onClick={() => setTab(2)}>{t('Workshop Response')}</div>
              <div onClick={() => setTab(3)}>{t('Workshop Feedback')}</div>
            </CarouselHeader>
            <Carousel slideTo={tab}>
              <div>
                <div>
                  <label>
                    {t('Event Date and Time')}
                    :
                    {' '}
                    {DateTime.fromISO(booking.event?.startAt).toLocaleString(DateTime.DATETIME_MED)}
                  </label>
                  <br />
                </div>
                <div>
                  <label>{t('Booking Status')}</label>
                  <select onChange={(e) => setStatus(e.target.value)} value={status} disabled={!authToUpdate}>
                    {nextStatus[status].map((v) => (
                      <option value={v} key={v}>{t(status2Text[v])}</option>
                    ))}
                  </select>
                </div>
                {userQuota && (
                  <div className="user-quota">
                    *
                    {' '}
                    {t('Quota left for this user for')}
                    {' '}
                    <strong>
                      {DateTime.local(2017, userQuota.month, 1).monthShort}
                      {' '}
                      {userQuota.year}
                    </strong>
                    :
                    {' '}
                    <strong>{userQuota.weekdaysUnusedQuota}</strong>
                    {' '}
                    {t('weekday slots and')}
                    {' '}
                    <strong>{userQuota.weekendsUnusedQuota}</strong>
                    {' '}
                    {t('weekend slots.')}
                    {' '}
                  </div>
                )}
                <div>
                  <label>{t('Status Message (if any)')}</label>
                  <textarea
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder={t('Include any notes about this particular approval/rejection/cancellation here...')}
                    disabled={!authToUpdate}
                  />
                </div>
              </div>
              <div className="workshop-responses">
                {booking?.event?.type !== EventType.WORKSHOP ? (
                  <div>
                    <label>{t('This booking is not for a workshop.')}</label>
                  </div>
                ) : (
                  <div>
                    <h1>
                      {t('Workshop Title')}
                      :
                      {' '}
                      {booking?.event?.title}
                    </h1>
                    {Object.keys(bookingResponses).map((eventQuestionId, index) => (
                      <UserQuestionResponses
                        responses={bookingResponses}
                        eventQuestionId={eventQuestionId}
                        index={index}
                        key={`booking-response_${eventQuestionId}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                {!booking.attendance ? (
                  <h1>{t('No check in record for this booking.')}</h1>
                ) : (
                  <>
                    <h1>
                      {t('Workshop Title')}
                      :
                      {' '}
                      {booking?.event?.title}
                    </h1>
                    {Object.keys(checkoutResponses).map((eventQuestionId, index) => (
                      <UserQuestionResponses
                        responses={checkoutResponses}
                        eventQuestionId={eventQuestionId}
                        index={index}
                        key={`checkout-response_${eventQuestionId}`}
                      />
                    ))}
                  </>
                )}
              </div>
            </Carousel>
            <div className={tab > 1 ? 'hide' : ''}>
              <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} disabled={!authToUpdate} />
            </div>
          </form>
        </div>
      ) : (
        // new booking
        <div>
          <h3>{t('Make a booking for a user')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="select-container">
              <label>{t('Choose an event slot')}</label>
              <AsyncPaginate
                isClearable
                debounceTimeout={300}
                cacheUniqs={[show]}
                value={selectedEventOption}
                loadOptions={loadEventOptions}
                onChange={handleChangeSelectedEvent}
              />
            </div>
            <div className="select-container">
              <label>{t('Choose branch of member')}</label>
              <Select
                isClearable
                value={selectedBranchOption}
                options={branches}
                onChange={setSelectedBranchOption}
              />
            </div>
            <div className="select-container">
              <label>{t('Choose a member')}</label>
              <AsyncPaginate
                isClearable
                debounceTimeout={300}
                maxMenuHeight={280}
                cacheUniqs={[selectedBranchOption]}
                value={selectedUserOption}
                loadOptions={loadUserOptions}
                onChange={setSelectedUserOption}
              />
            </div>
            {userQuota && (
              <div className="user-quota">
                *
                {' '}
                {t('Quota left for this user for')}
                {' '}
                <strong>{DateTime.local(2017, userQuota.month, 1).monthShort}</strong>
                {' '}
                {userQuota.year}
                :
                {' '}
                {userQuota.weekdaysUnusedQuota}
                {' '}
                {t('weekday slots and')}
                {' '}
                {userQuota.weekendsUnusedQuota}
                {' '}
                {t('weekend slots.')}
                {' '}
              </div>
            )}
            <div className="status-message">
              <label>{t('Status Message (if any)')}</label>
              <textarea
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder={t('Include any notes about this particular booking creation here...')}
              />
            </div>
            <div className={tab > 2 ? 'hide' : ''}>
              <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}

export default UserBookingModal;
