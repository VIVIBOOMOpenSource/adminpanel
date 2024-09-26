import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import './bookings.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import { EventType } from 'src/enums/EventType';
import { EventOrderType } from 'src/enums/EventOrderType';

import EventApi from 'src/apis/viviboom/EventApi';
import { PublicAccessType } from 'src/enums/PublicAccessType';
import BookingModal from './booking-modal';

const filterTabs = {
  'All Events': {},
  'Upcoming Events': { startDate: DateTime.now().startOf('day').toISO(), isBeforeBookingEnd: true },
  'Free Flow': { category: EventType.FREE_FLOW },
  Workshop: { category: EventType.WORKSHOP },
  'Member Events': { publicAccessTypes: [PublicAccessType.BOOK, PublicAccessType.VIEW, PublicAccessType.NONE] },
  'Public Events': { publicAccessTypes: [PublicAccessType.PUBLIC_ONLY, PublicAccessType.BOOK, PublicAccessType.VIEW] },
  'To Be Released': { isYetToRelease: true },
  Drafts: { isDraft: true },
};

const DEFAULT_LIMIT = 20;

function Bookings({ authToCreate, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const { state } = useLocation();

  const [showNewBooking, setShowNewBooking] = useState(!!state?.isCreate);
  const [selectedEventSession, setSelectedEventSession] = useState(null);

  const [loading, setLoading] = useState(false);
  const [filterTabKey, setFilterTabKey] = useState('All Events');
  const [eventSessions, setEventSessions] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API Calls
  const getEventSessions = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: user.authToken,
        branchId: branch.id,
        ...filterTabs[filterTabKey],
        order: EventOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await EventApi.getList(requestParams);
      setEventSessions(res.data?.events);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [page, user.authToken, branch.id, filterTabKey]);

  const handleFilterTabChange = (key) => () => {
    setPage(1);
    setFilterTabKey(key);
  };

  useEffect(() => {
    getEventSessions();
  }, [getEventSessions]);
  // for redux states
  useEffect(() => {
    setPage(1);
    getEventSessions(1);
  }, [branch]);

  return (
    <div className="bookings">
      <div className="bookings-container">
        <div className="bookings-category-content">
          <h1>{t('Events')}</h1>
          <ul className="user-sort hlo">
            {Object.keys(filterTabs).map((key) => (
              <li
                key={`tab_${key}`}
                className={key === filterTabKey ? 'active' : ''}
                value={key}
                onClick={handleFilterTabChange(key)}
              >
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="bookings-content">
          <div className="bookings-header">
            <div className="bookings-add">
              <Button
                status="add"
                className="button"
                disabled={!authToCreate}
                onClick={() => {
                  setSelectedEventSession(null);
                  setShowNewBooking(true);
                }}
              >
                {t('New Event')}
              </Button>
            </div>
          </div>

          <div className="bookings-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Branch')}</th>
                  <th>{t('Day')}</th>
                  <th>{t('Event Date')}</th>
                  <th>{t('Time')}</th>
                  <th>{t('Duration')}</th>
                  <th>{t('Event')}</th>
                  <th>{t('Slots Filled')}</th>
                  <th>{t('Total Slots')}</th>
                </tr>
              </thead>
              <tbody>
                {eventSessions.map((v) => {
                  const luxonBookingDate = DateTime.fromISO(v.startAt);
                  return (
                    <tr
                      key={`event-session_${v.id}`}
                      onClick={() => setSelectedEventSession(v)}
                    >
                      <td>{v.branch?.name}</td>
                      <td>{luxonBookingDate.toFormat('ccc')}</td>
                      <td>{luxonBookingDate.toLocaleString(DateTime.DATE_MED)}</td>
                      <td>{luxonBookingDate.toLocaleString(DateTime.TIME_SIMPLE)}</td>
                      <td>
                        {v.duration}
                        {' '}
                        {t('hrs')}
                      </td>
                      <td>{v.title}</td>
                      <td>{v.bookingCount}</td>
                      <td>{v.maxSlots}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!eventSessions?.length && <div className="no-results">{t('No Results')}</div>}
            <div className="bookings-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        show={!!selectedEventSession || showNewBooking}
        handleClose={() => {
          setSelectedEventSession(null);
          setShowNewBooking(false);
        }}
        refreshEventSessions={getEventSessions}
        eventSession={selectedEventSession}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Bookings;
