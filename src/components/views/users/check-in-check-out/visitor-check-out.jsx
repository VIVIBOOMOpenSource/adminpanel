import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';

import './check-in-check-out.scss';

import MyImage from 'src/components/common/MyImage';
import Pagination from 'src/components/common/pagination/pagination';
import AttendanceApi from 'src/apis/viviboom/AttendanceApi';
import PersonSvg from '../../../../css/imgs/icon-person-grey.svg';
import CheckOutModal from './check-out-modal';

const DEFAULT_LIMIT = 4;

function VisitorCheckOut({ resetState }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const branch = useSelector((state) => state.branch);
  const authToken = useSelector((state) => state.user?.authToken);

  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [visitorName, setVisitorName] = useState();
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorTotalPages, setVisitorTotalPages] = useState(1);

  const debounceDelay = 100;
  const debounceTimeoutId = useRef(null);

  // for check out
  const getVisitorList = useCallback(async (newPage = visitorPage) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        branchId: branch.id,
        checkInAfter: DateTime.local().startOf('day').toISO(),
        checkInBefore: DateTime.local().endOf('day').toISO(),
        isYetToCheckOut: true,
        isAssociatedToUser: false,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      if (visitorName) {
        requestParams.visitorName = visitorName;
      }

      clearTimeout(debounceTimeoutId);
      debounceTimeoutId.current = setTimeout(async () => {
        const res = await AttendanceApi.getList(requestParams);
        setFilteredVisitors(res.data.attendances);
        setVisitorTotalPages(res.data?.totalPages);
        setLoading(false);
      }, debounceDelay);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [visitorPage, authToken, branch.id, visitorName]);

  function handleClick(user) {
    setOpenModal(true);
    setSelectedUser(user);
  }

  function resetVisitorStates() {
    setVisitorName();
    setVisitorPage(1);
    setVisitorTotalPages(1);
    setOpenModal(false);
    setSelectedUser();
    setLoading(false);
  }

  const handleBack = () => {
    resetVisitorStates();
    resetState();
  };

  useEffect(() => {
    getVisitorList();
  }, [getVisitorList]);

  return (
    <div>
      <div className="vivinaut-visitor-greeting-container">
        <div className="vivinaut-visitor-greeting-title">
          {t('Goodbye for now - we hope to see you soon!')}
        </div>
        <div className="vivinaut-visitor-greeting-subtitle">
          {t('Click on your name to check out')}
        </div>
      </div>
      <label>
        {t("Visitor's Name*")}
      </label>
      <input
        className="text-input"
        type="text"
        disabled={loading}
        onChange={(e) => setVisitorName(e.target.value)}
        value={visitorName || ''}
        placeholder="Enter your name"
        required
      />
      <div>
        <div className="list-of-users">
          {filteredVisitors.map((user) => (
            <div onClick={() => handleClick(user)} className="user" key={user.id}>
              <MyImage
                src={user.profileImageUri}
                preloadImage={PersonSvg}
                defaultImage={PersonSvg}
              />
              <div className="text">
                {user.visitorName}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="comments-footer">
        {filteredVisitors.length > 0 && (
        <Pagination page={visitorPage} totalPages={visitorTotalPages} setPage={setVisitorPage} />
        )}
      </div>
      <CheckOutModal
        isVisitor
        show={openModal}
        handleClick={() => {
          setOpenModal(false);
          setSelectedUser();
        }}
        handleClose={() => {
          handleBack();
        }}
        user={selectedUser}
        authToken={authToken}
        attendance={selectedUser}
      />
    </div>
  );
}

export default VisitorCheckOut;
