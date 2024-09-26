import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import './public-booking-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';

import EventApi from 'src/apis/viviboom/EventApi';
import BookingApi from 'src/apis/viviboom/BookingApi';
import PublicBookingApi from 'src/apis/viviboom/PublicBookingApi';

import { BookingStatusType } from 'src/enums/BookingStatusType';
import { EventType } from 'src/enums/EventType';
import { PublicAccessType } from 'src/enums/PublicAccessType';

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

function PublicBookingModal({
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
  const [familyName, setFamilyname] = useState('');
  const [givenName, setGivenName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEventOption, setSelectedEventOption] = useState(null); // event

  const [responses, setResponses] = useState([]);

  const fetchResponses = useCallback(async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const res = await EventApi.getResponse({ authToken: user.authToken, bookingId: booking.id, eventId: booking.eventId });
      const userResponses = res.data?.responses[0].userResponses;
      // group by event question id
      const responsesByQuestionId = {};
      userResponses?.forEach((resp) => {
        if (!(resp.eventQuestionId in responsesByQuestionId)) responsesByQuestionId[resp.eventQuestionId] = [];
        responsesByQuestionId[resp.eventQuestionId].push(resp);
      });
      setResponses(responsesByQuestionId);
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  }, [booking, user.authToken]);

  // load data and responses if exists
  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      if (booking.statusMessage) setStatusMessage(booking.statusMessage);
      fetchResponses();
    }
  }, [booking, fetchResponses]);

  const handleModalClose = () => {
    // do other stuff
    setTab(1);
    setStatus(BookingStatusType.SUBMITTED);
    setStatusMessage('');
    setResponses([]);
    setSelectedEventOption(null);
    setEmail('');
    setGivenName('');
    setFamilyname('');
    setPhone('');
    handleClose();
  };

  const saveBooking = async () => {
    if (!booking) {
      // create booking
      if (!selectedEventOption) {
        toast.error(t('Please select event'));
        return;
      }

      const requestBody = {
        authToken: user.authToken,
        familyName,
        givenName,
        phone,
        email,
        eventId: selectedEventOption.value.id,
        statusMessage,
      };
      setLoading(true);
      try {
        await PublicBookingApi.post(requestBody);
        await refreshBookings();
        handleModalClose();
        toast.success(t('User booking added'));
      } catch (err) {
        // if unsuccessful, ask if want to ignore quota limit
        toast.error(err.response.data.message);
        console.log(err.response?.data?.message);
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

  const handleChangeSelectedEvent = async (option) => {
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
        publicAccessTypes: [PublicAccessType.PUBLIC_ONLY, PublicAccessType.BOOK, PublicAccessType.VIEW],
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
      className="public-booking-modal"
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
                      {booking?.event?.title}
                    </h1>
                    {Object.keys(responses).map((eventQuestionId, index) => {
                      const question = responses[eventQuestionId][0];
                      return (
                        <div className="workshop-question" key={`booking-response_${eventQuestionId}`}>
                          <h4>
                            {index + 1}
                            {'. '}
                            {`(${t(question.type.toLowerCase())}) ${question.question}`}
                          </h4>
                          {responses[eventQuestionId].map((resp) => (
                            <div className="workshop-answer" key={`event-question_${eventQuestionId}-response_${resp.id}`}>
                              <label>
                                •
                                {resp.response}
                              </label>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                {!booking?.attendance && (
                  <h1>{t('No check in record for this booking.')}</h1>
                )}
                {booking?.attendance && booking.attendance.rating && (
                  <h1>
                    {t('Rating:')}
                    {' '}
                    {booking.attendance.rating}
                  </h1>
                )}
                {booking?.attendance && !booking.attendance.rating && (
                  <h1>{t('No ratings given.')}</h1>
                )}

                {booking?.attendance && booking.attendance.feedbackNotes && (
                  <h1>
                    {t('Feedback:')}
                    {' '}
                    {booking.attendance.feedbackNotes}
                  </h1>
                )}
                {booking?.attendance && !booking.attendance.feedbackNotes && (
                  <h1>{t('No feedback given.')}</h1>
                )}
              </div>
            </Carousel>
            <div className={tab > 2 ? 'hide' : ''}>
              <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} disabled={!authToUpdate} />
            </div>
          </form>
        </div>
      ) : (
        // new booking
        <div>
          <h3>{t('Make a booking as public')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="input-container">
                <label>
                  {t('Family name')}
                  <input
                    type="text"
                    value={familyName}
                    placeholder={t('Enter family name...')}
                    onChange={(e) => setFamilyname(e.target.value)}
                  />
                </label>
              </div>
              <div className="input-container">
                <label>
                  {t('Given name')}
                  <input
                    type="text"
                    value={givenName}
                    placeholder={t('Enter given name...')}
                    onChange={(e) => setGivenName(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="input-row">
              <div className="input-container">
                <label>
                  {t('Email')}
                  <input
                    type="text"
                    value={email}
                    placeholder={t('Enter email...')}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
              <div className="input-container">
                <label>
                  {t('Phone number')}
                  <input
                    type="text"
                    value={phone}
                    placeholder={t('Enter phone number...')}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
              </div>
            </div>
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

export default PublicBookingModal;
