import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DateTimePicker from 'react-datetime-picker';
import Loading from 'src/components/common/loading/loading';
import { CSVLink } from 'react-csv';
import { DateTime } from 'luxon';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import './visitor-feedback.scss';

import AttendanceApi from 'src/apis/viviboom/AttendanceApi';

import Pagination from 'src/components/common/pagination/pagination';
import Button from 'src/components/common/button/button';

import { eventTypes } from 'src/enums/EventType';
import { ratingTypes } from 'src/enums/RatingType';

import FeedbackModal from './feedback-modal';

const DEFAULT_LIMIT = 20;

const dateFormat = (navigator.language || navigator.userLanguage) === 'en-US' ? 'M / d / y' : 'd / M / y';

function Feedback() {
  const { t } = useTranslation('translation', { keyPrefix: 'userBooking' });
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const [loading, setLoading] = useState(false);
  const [visitorFeedback, setVisitorFeedback] = useState([]);
  const [startDate, setStartDate] = useState(null); // Date
  const [endDate, setEndDate] = useState(null); // Date
  const [visitorName, setVisitorName] = useState('');
  const [rating, setRating] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [tempVisitorName, setTempVisitorName] = useState('');
  const [tempRating, setTempRating] = useState('');
  const [tempEventTitle, setTempEventTitle] = useState('');
  const [tempEventCategory, setTempEventCategory] = useState('');
  const [tempStartDate, setTempStartDate] = useState(null); // Date
  const [tempEndDate, setTempEndDate] = useState(null); // Date

  const getVisitorFeedback = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        branchId: branch.id,
        isAssociatedToUser: false,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      if (visitorName) requestParams.visitorName = visitorName;
      if (eventTitle && eventTitle !== 'Crew Invite') requestParams.eventTitle = eventTitle;
      if (eventTitle === 'Crew Invite' || eventCategory === 'CrewInvite') requestParams.isAssociatedToEvent = false;
      if (eventCategory && eventCategory !== 'CrewInvite') requestParams.eventCategory = eventCategory.toUpperCase();
      if (rating) requestParams.rating = rating.toUpperCase();
      if (startDate) requestParams.checkInAfter = startDate.toISOString();
      if (endDate) requestParams.checkInBefore = endDate.toISOString();

      const res = await AttendanceApi.getList(requestParams);
      setVisitorFeedback(res.data.attendances);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [branch.id, page, loggedInUser.authToken, visitorName, eventTitle, eventCategory, rating, startDate, endDate]);

  const exportFeedback = useCallback(async () => {
    await getVisitorFeedback(1);
    setExportLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        branchId: branch.id,
        isAssociatedToUser: false,
        limit: DEFAULT_LIMIT,
      };

      if (visitorName) requestParams.visitorName = visitorName;
      if (eventTitle && eventTitle !== 'Crew Invite') requestParams.eventTitle = eventTitle;
      if (eventTitle === 'Crew Invite' || eventCategory === 'CrewInvite') requestParams.isAssociatedToEvent = false;
      if (eventCategory && eventCategory !== 'CrewInvite') requestParams.eventCategory = eventCategory.toUpperCase();
      if (rating) requestParams.rating = rating.toUpperCase();
      if (startDate) requestParams.checkInAfter = startDate.toISOString();
      if (endDate) requestParams.checkInBefore = endDate.toISOString();

      // fetch all remaining feedback
      const promises = [...Array(totalPages).keys()].slice(1).map((p) => AttendanceApi.getList({ ...requestParams, offset: p * DEFAULT_LIMIT }));
      const results = await Promise.allSettled(promises);
      const allFeedback = visitorFeedback.concat(...results.map((p) => p?.value?.data.attendances));

      setExportData(allFeedback.map((feedback) => ({
        'event title': feedback.event?.title || 'Crew Invite',
        'event type': feedback.event?.type || 'Crew Invite',
        'event date': feedback.event?.startAt ? DateTime.fromISO(feedback.event.startAt).toLocaleString(DateTime.DATE_MED) : '-',
        'check in time': feedback.checkInAt ? DateTime.fromISO(feedback.checkInAt).toLocaleString(DateTime.TIME_SIMPLE) : '-',
        'check out time': feedback.checkOutAt ? DateTime.fromISO(feedback.checkOutAt).toLocaleString(DateTime.TIME_SIMPLE) : '-',
        name: feedback.visitorName,
        email: feedback.visitorEmail || '-',
        rating: feedback.rating || '-',
        feedback: feedback.feedbackNotes || '-',
        'admin notes': feedback.adminNotes || '-',
      })));
      // download
      document.querySelector('.csv-link').click();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
    setExportLoading(false);
  }, [branch.id, loggedInUser.authToken, visitorName, eventTitle, eventCategory, rating, startDate, endDate, getVisitorFeedback, totalPages, visitorFeedback]);

  useEffect(() => {
    getVisitorFeedback();
  }, [page, getVisitorFeedback]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setPage(1);
    setTotalPages(1);

    setVisitorName(tempVisitorName);
    setEventTitle(tempEventTitle);
    setEventCategory(tempEventCategory);
    setRating(tempRating);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);

    setTempStartDate(null);
    setTempEndDate(null);
    setTempVisitorName('');
    setTempEventTitle('');
    setTempEventCategory('');
    setTempRating('');

    await getVisitorFeedback(1);
  };

  const resetFilters = async () => {
    setStartDate(null);
    setEndDate(null);
    setVisitorName('');
    setEventTitle('');
    setEventCategory('');
    setRating('');

    setTempStartDate(null);
    setTempEndDate(null);
    setTempVisitorName('');
    setTempEventTitle('');
    setTempEventCategory('');
    setTempRating('');

    setPage(1);
    setTotalPages(1);
  };

  return (
    <div className="feedback">
      <div className="feedback-container">
        <div className="feedback-content">
          <div className="feedback-header">
            <div className="feedback-search">
              <form onSubmit={handleSearchSubmit}>
                <div className="search-container">
                  <h2>
                    {t('Visitor Feedback Search Parameters (optional)')}
                  </h2>
                  <div className="search-row-one">
                    <div className="start-date-container">
                      <label>
                        {t('Start Date')}
                        :
                      </label>
                      <DateTimePicker
                        value={tempStartDate}
                        onChange={setTempStartDate}
                        format={dateFormat}
                        calendarIcon={null}
                        disableClock
                      />
                    </div>
                    <div className="end-date-container">
                      <label>
                        {t('End Date')}
                        :
                      </label>
                      <DateTimePicker value={tempEndDate} onChange={setTempEndDate} format={dateFormat} calendarIcon={null} />
                    </div>
                  </div>
                  <div className="search-row-two">
                    <div className="search-row-two-container">
                      <label>
                        {t('Title of event')}
                        <input
                          type="text"
                          value={tempEventTitle}
                          placeholder="Enter event title..."
                          onChange={(e) => setTempEventTitle(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="search-row-two-container">
                      <label>
                        {t('Rating')}
                        <select onChange={(e) => setTempRating(e.target.value)} value={tempRating}>
                          <option value="">-</option>
                          {ratingTypes.map((r) => (
                            <option value={r} key={r}>{r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="search-row-three">
                    <div className="search-row-three-container">
                      <label>
                        {t('Visitor Name')}
                        <input
                          type="text"
                          value={tempVisitorName}
                          placeholder="Enter visitor name..."
                          onChange={(e) => setTempVisitorName(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="search-row-three-container">
                      <label>
                        {t('Event Category')}
                        <select onChange={(e) => setTempEventCategory(e.target.value)} value={tempEventCategory}>
                          <option value="">-</option>
                          <option value="CrewInvite">Crew Invite</option>
                          {eventTypes.map((v) => (
                            <option value={v} key={v}>{v.charAt(0).toUpperCase() + v.slice(1).toLowerCase().replace('_', ' ')}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="search-button-container">
                  <Button type="submit" value="Search" className="button" />
                  <Button type="button" className="button" onClick={exportFeedback}>{t('Export')}</Button>
                  <Button type="button" parentClassName="reset-btn" onClick={resetFilters}>{t('Reset')}</Button>
                  <CSVLink
                    className="csv-link"
                    data={exportData}
                    filename={`visitorFeedback_${new Date().toString()}.csv`}
                  />
                  <Loading show={exportLoading} size="24px" />
                </div>
              </form>
            </div>
          </div>
          <div className="feedback-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Event')}</th>
                  <th>{t('Date')}</th>
                  <th>{t('Check In Time')}</th>
                  <th>{t('Check Out Time')}</th>
                  <th>{t('Name')}</th>
                  <th>{t('Email')}</th>
                  <th>{t('Rating')}</th>
                </tr>
              </thead>
              <tbody>
                {!loading
            && visitorFeedback.map((v) => {
              const luxonBookingDate = DateTime.fromISO(v.checkInAt);
              const checkOutDate = DateTime.fromISO(v.checkOutAt);
              return (
                <tr
                  key={v.id}
                  onClick={() => setSelectedFeedback(v)}
                >
                  <td>{v.event?.title || 'Crew Invite'}</td>
                  <td>{luxonBookingDate.toLocaleString(DateTime.DATE_MED)}</td>
                  <td>{luxonBookingDate.toLocaleString(DateTime.TIME_SIMPLE) || '—'}</td>
                  <td>{checkOutDate.c ? checkOutDate.toLocaleString(DateTime.TIME_SIMPLE) : '—'}</td>
                  <td>{v.visitorName || '—'}</td>
                  <td>{v.visitorEmail || '—'}</td>
                  <td>{v.rating || '—'}</td>
                </tr>
              );
            })}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!visitorFeedback?.length && <div className="no-results">{t('No visitor feedback...')}</div>}
            <div className="feedback-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>
      <FeedbackModal
        show={selectedFeedback}
        handleClose={() => setSelectedFeedback(null)}
        attendance={selectedFeedback}
        authToken={loggedInUser.authToken}
        refreshFeedback={getVisitorFeedback}
      />
    </div>
  );
}

export default Feedback;
