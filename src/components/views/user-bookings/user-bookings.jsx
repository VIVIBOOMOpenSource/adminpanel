import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { CSVLink } from 'react-csv';
import DateTimePicker from 'react-datetime-picker';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './user-bookings.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import BookingApi from 'src/apis/viviboom/BookingApi';

import { BookingStatusType } from 'src/enums/BookingStatusType';
import { EventType, eventTypes } from 'src/enums/EventType';

import UserBookingModal from './user-booking-modal';

const status2Text = {
  [BookingStatusType.SUBMITTED]: 'Submitted',
  [BookingStatusType.APPROVED]: 'Approved',
  [BookingStatusType.REJECTED]: 'Rejected',
  [BookingStatusType.CANCELLED]: 'Cancelled',
};

const DEFAULT_LIMIT = 20;

const dateTimeFormat = (navigator.language || navigator.userLanguage) === 'en-US' ? 'M / d / y   h : m   a' : 'd / M / y   H : m';
const dateFormat = (navigator.language || navigator.userLanguage) === 'en-US' ? 'M / d / y' : 'd / M / y';

function UserBookings({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'userBooking' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // const [query, setQuery] = useState("");
  // const [filter, setFilter] = useState("id");
  // const [order, setOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // bookings
  const [bookings, setBookings] = useState([]);

  // export data
  const [exportData, setExportData] = useState([]);

  // search params
  const [status, setStatus] = useState('');
  const [singleDate, setSingleDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date()); // Date
  const [endDate, setEndDate] = useState(null); // Date
  const [username, setUsername] = useState('');

  // show more params
  const [showMore, setShowMore] = useState(false);

  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [isLateCancellation, setLateCancellation] = useState('');
  const [isReminderSent, setReminderSent] = useState('');

  const fetchBookings = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: user.authToken,
        eventBranchId: branch.id,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
        isPublicBooking: false,
      };

      if (status) requestParams.status = status;
      if (startDate) requestParams.startDate = startDate.toISOString();
      if (endDate) requestParams.endDate = endDate.toISOString();
      if (username) requestParams.username = username;
      if (eventTitle) requestParams.eventTitle = eventTitle;
      if (eventCategory) requestParams.eventCategory = eventCategory;
      if (isLateCancellation) requestParams.isLateCancellation = isLateCancellation;
      if (isReminderSent) requestParams.isReminderSent = isReminderSent;

      const res = await BookingApi.getList(requestParams);
      setBookings(res.data?.bookings);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [page, user, status, startDate, endDate, username, eventTitle, eventCategory, branch, isLateCancellation, isReminderSent]);

  const exportBookings = useCallback(async () => {
    await fetchBookings(1);
    setExportLoading(true);
    try {
      const requestParams = {
        authToken: user.authToken,
        eventBranchId: branch.id,
        limit: DEFAULT_LIMIT,
        isPublicBooking: false,
      };

      if (status) requestParams.status = status;
      if (startDate) requestParams.startDate = startDate.toISOString();
      if (endDate) requestParams.endDate = endDate.toISOString();
      if (username) requestParams.username = username;
      if (eventTitle) requestParams.eventTitle = eventTitle;
      if (eventCategory) requestParams.eventCategory = eventCategory;
      if (isLateCancellation) requestParams.isLateCancellation = isLateCancellation;
      if (isReminderSent) requestParams.isReminderSent = isReminderSent;

      // fetch all remaining bookings
      const promises = [...Array(totalPages).keys()].slice(1).map((p) => BookingApi.getList({ ...requestParams, offset: p * DEFAULT_LIMIT }));
      const results = await Promise.allSettled(promises);
      const allBookings = bookings.concat(...results.map((p) => p?.value?.data.bookings));
      setExportData(allBookings.map((booking) => ({
        'event title': booking.event?.title || '-',
        username: booking.user?.username,
        name: `${booking.user?.givenName} ${booking.user?.familyName}`,
        'guardian name': booking.user?.guardianName || '-',
        'guardian phone': booking.user?.guardianPhone,
        'guardian email': booking.user?.guardianEmail,
        'booking date': DateTime.fromISO(booking.event?.startAt).toLocaleString(DateTime.DATETIME_MED),
        status: status2Text[booking.status],
      })));
      // download
      document.querySelector('.csv-link').click();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
    setExportLoading(false);
  }, [bookings, endDate, branch, eventCategory, eventTitle, fetchBookings, isLateCancellation, isReminderSent, startDate, status, totalPages, user.authToken, username]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchBookings(1); // back to first page
  };

  const resetFilters = async () => {
    setSingleDate(false);
    setStartDate(new Date());
    setEndDate(null);
    setUsername('');
    setEventTitle('');
    setEventCategory('');
    setLateCancellation('');
    setReminderSent('');
    setStatus('');
  };

  // if the start date is later than end date, reset end date
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (newDate && (singleDate || !endDate || newDate > endDate)) setEndDate(new Date(newDate.getTime() + 60 * 60 * 24 * 1000)); // add one date to new date for end date
  };

  const handleShowMore = async () => {
    if (showMore) {
      setEventTitle('');
      setEventCategory(null);
      setLateCancellation(null);
      setReminderSent(null);
    }
    setShowMore(!showMore);
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchBookings(1);
  }, [branch]);

  return (
    <div className="user-bookings">
      <div className="user-bookings-container">
        <div className="user-bookings-content">
          <div>
            <div className="user-bookings-header">
              <div className="user-bookings-search">
                <form onSubmit={handleSearchSubmit}>
                  <div className="search-container">
                    <h2>{t('User Booking Search Parameters (optional)')}</h2>
                    <div className="checkbox-container">
                      <input type="checkbox" onChange={(e) => setSingleDate(e.target.checked)} />
                      <label>
                        {' '}
                        {t('Specific date and time?')}
                      </label>
                    </div>
                    <div className="search-row-one">
                      <div className="start-date-container">
                        <label>
                          {t('Start Date')}
                          :
                        </label>
                        <DateTimePicker
                          value={startDate}
                          onChange={handleStartDateChange}
                          format={singleDate ? dateTimeFormat : dateFormat}
                          calendarIcon={null}
                          disableClock
                        />
                      </div>
                      {!singleDate && (
                      <div className="end-date-container">
                        <label>
                          {t('End Date')}
                          :
                        </label>
                        <DateTimePicker value={endDate} onChange={setEndDate} format={dateFormat} calendarIcon={null} />
                      </div>
                      )}
                    </div>
                    <div className="search-row-two">
                      <div className="search-row-two-container">
                        <label>
                          {t('Username of user')}
                          <input
                            type="text"
                            value={username}
                            placeholder={t('Enter username...')}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="search-row-two-container">
                        <label>
                          {t('Booking Status')}
                          <select onChange={(e) => setStatus(e.target.value)} value={status}>
                            <option value="">-</option>
                            {Object.keys(status2Text).map((v) => (
                              <option value={v} key={v}>{t(status2Text[v])}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                    {showMore && (
                    <>
                      <div className="search-row-three">
                        <div className="search-row-three-container">
                          <label>
                            {t('Title of event')}
                            <input
                              type="text"
                              value={eventTitle}
                              placeholder={t('Enter event title...')}
                              onChange={(e) => setEventTitle(e.target.value)}
                            />
                          </label>
                        </div>
                        <div className="search-row-three-container">
                          <label>
                            {t('Event Category')}
                            <select onChange={(e) => setStatus(e.target.value)} value={eventCategory}>
                              <option value="">-</option>
                              {eventTypes.map((v) => (
                                <option value={v} key={v}>{t(v.toLowerCase())}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                      <div className="search-row-four">
                        <div className="search-row-four-container">
                          <label>
                            {t('Late Cancellation')}
                            <select onChange={(e) => setLateCancellation(e.target.value)} value={isLateCancellation}>
                              <option value="">-</option>
                              <option value>{t('Yes')}</option>
                              <option value={false}>{t('No')}</option>
                            </select>
                          </label>
                        </div>
                        <div className="search-row-four-container">
                          <label>
                            {t('Reminder Sent')}
                            <select onChange={(e) => setReminderSent(e.target.value)} value={isReminderSent}>
                              <option value="">-</option>
                              <option value>{t('Yes')}</option>
                              <option value={false}>{t('No')}</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </>
                    )}
                    <button type="button" className="show-more" onClick={handleShowMore}>
                      {t(showMore ? 'Less Filters' : 'More Filters')}
                    </button>
                  </div>
                  <div className="search-button-container">
                    <Button type="submit" value={t('Search')} className="button" />
                    <Button type="button" className="button" onClick={exportBookings}>{t('Export')}</Button>
                    <Button type="button" parentClassName="reset-btn" onClick={resetFilters}>{t('Reset')}</Button>
                    <CSVLink
                      className="csv-link"
                      data={exportData}
                      filename={`bookings_${new Date().toString()}.csv`}
                    />
                    <Loading show={exportLoading} size="24px" />
                  </div>
                </form>
              </div>
              <div className="user-bookings-add">
                <Button
                  status="add"
                  className="button"
                  disabled={!authToCreate}
                  onClick={() => {
                    setSelectedBooking(null);
                    setShowNewBooking(true);
                  }}
                >
                  {t('New User Booking')}
                </Button>
              </div>
            </div>

            <div className="user-bookings-list">
              <table>
                <thead>
                  <tr className="header">
                    <th>{t('Event')}</th>
                    <th>{t('Username')}</th>
                    <th>{t('Name')}</th>
                    <th>{t('Guardian Name')}</th>
                    <th>{t('Email')}</th>
                    <th>{t('Booking Date')}</th>
                    <th>{t('Attended')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading
                && bookings.map((v) => (
                  <tr
                    key={`user-event-booking_${v.id}`}
                    onClick={() => setSelectedBooking(v)}
                  >
                    {v.event?.title === EventType.WORKSHOP ? (
                      <td>{v.event?.title}</td>
                    ) : (
                      <td>{v.event?.title || t('Free Flow Session')}</td>
                    )}
                    <td>{v.user?.username || '—'}</td>
                    <td>{v.user ? (`${v.user?.givenName} ${v.user?.familyName.charAt(0)}`) : `${v.givenName} ${v.familyName.charAt(0)}`}</td>
                    <td>{v.user?.guardianName || '-'}</td>
                    <td>{v.user?.guardianEmail || v.email}</td>
                    <td>{DateTime.fromISO(v.event?.startAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                    <td>{v.attendance ? 'Yes' : 'No'}</td>
                    <td>{t(status2Text[v.status])}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              <Loading show={loading} size="40px" />
              {bookings.length === 0 && <div className="no-results">{t('No Results')}</div>}
              <div className="user-bookings-footer">
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserBookingModal
        show={!!selectedBooking || showNewBooking}
        handleClose={() => {
          setSelectedBooking(null);
          setShowNewBooking(false);
        }}
        refreshBookings={fetchBookings}
        booking={selectedBooking}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default UserBookings;
