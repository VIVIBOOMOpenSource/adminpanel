import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';

import './check-in-check-out.scss';

import Pagination from 'src/components/common/pagination/pagination';
import Button from 'src/components/common/button/button';
import BookingApi from 'src/apis/viviboom/BookingApi';
import { BookingStatusType } from 'src/enums/BookingStatusType';
import PersonSvg from '../../../../css/imgs/icon-person-grey.svg';
import VisitorCheckInModal from './visitor-check-in-modal';

const DEFAULT_LIMIT = 4;

function VisitorCheckIn({ resetState, sessions }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const branch = useSelector((state) => state.branch);
  const authToken = useSelector((state) => state.user?.authToken);

  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const givenNameRef = useRef();
  const familyNameRef = useRef();

  const [publicBookings, setPublicBookings] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [loading, setLoading] = useState(false);

  // for check in
  const getPublicBookings = useCallback(async () => {
    if (!authToken) return;
    if (!givenName) {
      setPublicBookings([]);
      setPage(1);
      setTotalPages(1);
      return;
    }

    const params = {
      authToken,
      eventBranchId: branch.id,
      isPublicBooking: true,
      startDate: DateTime.local().startOf('day').toISO(),
      endDate: DateTime.local().endOf('day').toISO(),
      status: BookingStatusType.APPROVED,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
    };
    if (givenName) params.givenName = givenName;
    if (familyName) params.familyName = familyName;

    setLoading(true);
    try {
      const res = await BookingApi.getList(params);
      const fetchedBookings = res.data?.bookings;
      setPublicBookings(fetchedBookings);
      setTotalPages(res.data?.totalPages);
      if (page === 1 && fetchedBookings.length === 1) setSelectedBooking(fetchedBookings[0]);
      if (fetchedBookings.length === 0) setSelectedBooking({ id: 'create' });
    } catch (e) {
      if (e.response?.data?.message) toast(e.response?.data?.message);
      else toast('Fail to fetch data');
    }
    setLoading(false);
  }, [authToken, branch?.id, familyName, givenName, page]);

  const handleSearch = () => {
    setGivenName(givenNameRef.current?.value);
    setFamilyName(familyNameRef.current?.value);
    setPage(1);
    setTotalPages(1);
  };

  useEffect(() => {
    getPublicBookings();
  }, [getPublicBookings]);

  const visitorDetails = useMemo(() => (selectedBooking && selectedBooking.id !== 'create' ? {
    visitorName: `${selectedBooking.givenName} ${selectedBooking.familyName}`,
    visitorEmail: selectedBooking.email,
    visitorPhone: selectedBooking.phone,
    userEventBookingId: selectedBooking.id,
  } : { visitorName: [givenName, familyName].filter(Boolean).join(' ') }), [familyName, givenName, selectedBooking]);

  return (
    <>
      <div>
        <div className="vivinaut-visitor-greeting-container">
          <div className="vivinaut-visitor-greeting-title">
            {t('Welcome to Vivita – where you belong!')}
          </div>
          <div className="vivinaut-visitor-greeting-subtitle">
            {t('Enter your details in the boxes below and get started on your journey with us')}
          </div>
        </div>
        <div className="visitor-names">
          <div className="visitor-name">
            <label>
              {t("Visitor's Given Name*")}
            </label>
            <input
              ref={givenNameRef}
              className="text-input"
              type="text"
              disabled={loading}
              placeholder="Given Name"
              required
            />
          </div>
          <div className="visitor-name">
            <label>
              {t("Visitor's Family Name")}
            </label>
            <input
              ref={familyNameRef}
              className="text-input"
              type="text"
              disabled={loading}
              placeholder="Family Name"
            />
          </div>
        </div>
        <div className="list-of-users">
          {publicBookings.map((booking, index) => (
            <div onClick={() => setSelectedBooking(booking)} className="user" key={index}>
              <img src={PersonSvg} alt="person" className="image" />
              <div className="text">
                {`${booking.givenName} ${booking.familyName}`}
              </div>
            </div>
          ))}
        </div>
        <div className="comments-footer">
          {publicBookings.length > 0 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
        </div>
        <div className="button-container">
          <Button disabled={loading} parentClassName="submit-form" type="submit" value={t('Continue')} onClick={handleSearch} />
        </div>
      </div>
      <VisitorCheckInModal
        show={!!selectedBooking}
        handleClose={() => {
          setSelectedBooking(null);
        }}
        handleSuccess={() => {
          setSelectedBooking(null);
          resetState();
        }}
        selectedEventSession={selectedBooking?.event}
        visitorDetails={visitorDetails}
        sessions={sessions}
      />
    </>
  );
}

export default VisitorCheckIn;
