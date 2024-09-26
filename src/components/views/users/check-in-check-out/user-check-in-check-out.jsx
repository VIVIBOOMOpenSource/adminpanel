import React, {
  useState, useEffect, useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';

import './check-in-check-out.scss';

import MyImage from 'src/components/common/MyImage';
import Pagination from 'src/components/common/pagination/pagination';
import Button from 'src/components/common/button/button';
import AttendanceApi from 'src/apis/viviboom/AttendanceApi';
import UserApi from 'src/apis/viviboom/UserApi';
import PersonSvg from '../../../../css/imgs/icon-person-grey.svg';
import UserCheckInModal from './user-check-in-modal';
import CheckOutModal from './check-out-modal';

const DEFAULT_LIMIT = 4;

function UserCheckInCheckOut({
  allowVisitorAttendance, resetState, authToken, sessions,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState();
  const [error, setError] = useState(false);
  const [display, setDisplay] = useState(false);
  const [listOfUsers, setListOfUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [searchName, setSearchName] = useState();
  const [attendanceList, setAttendanceList] = useState([]);

  const searchUsers = useCallback(async () => {
    if (!authToken) return;
    const params = {
      authToken,
      branchId: branch.id,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      verboseAttributes: ['branch'],
    };
    if (searchName) {
      params.givenName = searchName;
    }
    if (!searchName) {
      setListOfUsers([]);
    } else if (searchName && searchName.length < 3) {
      setError(true);
      setListOfUsers([]);
    } else if (searchName) {
      setError(false);
      setLoading(true);
      try {
        const res = await UserApi.getList(params);
        setListOfUsers(res.data.users);
        if (res.data.users.length === 0) {
          setDisplay(true);
        } else if (res.data.users.length === 1 && page === 1) {
          setSelectedUser(res.data.users[0]);
          setDisplay(false);
          setOpenModal(true);
        } else {
          setDisplay(false);
          setTotalPages(res.data?.totalPages);
        }
      } catch (e) {
        if (e.response?.data?.message) toast(e.response?.data?.message);
        else toast(('Fail to fetch data'));
      }
      setLoading(false);
    }
  }, [authToken, searchName, page, branch.id]);

  const getAttendanceList = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        userId: selectedUser?.id,
        checkInAfter: DateTime.local().startOf('day').toISO(),
        checkInBefore: DateTime.local().endOf('day').toISO(),
        isYetToCheckOut: true,
      };
      const res = await AttendanceApi.getList(requestParams);
      setAttendanceList(res.data.attendances);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [selectedUser?.id, authToken]);

  const handleSearchUser = () => {
    setPage(1);
    setTotalPages(1);
    setSearchName(name);
    setName();
  };

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchUser();
    }
  }

  function handleClick(user) {
    setOpenModal(true);
    setSelectedUser(user);
  }

  function resetVivianutStates() {
    setLoading(false);
    setName();
    setError(false);
    setDisplay(false);
    setListOfUsers([]);
    setOpenModal(false);
    setSelectedUser();
    setSearchName();
    setPage(1);
    setTotalPages(1);
  }

  const handleBack = () => {
    resetVivianutStates();
    resetState();
  };

  const handleProceed = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    searchUsers();
  }, [page, searchUsers]);

  useEffect(() => {
    if (selectedUser) getAttendanceList();
  }, [getAttendanceList, selectedUser]);

  return (
    <div>
      <form onClick={handleProceed}>
        <div className="form-content">
          <div>
            {allowVisitorAttendance && (
              <button className="back-button" onClick={handleBack} type="submit">{t('Back')}</button>
            )}
          </div>
          <div className="input-container">
            <div className="vivinaut-visitor-greeting-container">
              <div className="vivinaut-visitor-greeting-title">
                {t('Hello Vivinaut!')}
              </div>
              <div>
                {t("Let's enter your name in the search box below to locate yourself!")}
              </div>
            </div>
            <input
              className="text-input"
              type="text"
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              value={name || ''}
              placeholder="At least 3 characters required"
              required
              onKeyDown={handleKeyDown}
            />
            <div>
              {error && (
              <span className="error-msg">
                {t('Minimum 3 characters required!')}
              </span>
              )}
              {!error && display && (
              <span className="error-msg">
                {t('No results found!')}
              </span>
              )}
              <div className="list-of-users">
                {listOfUsers.map((user, index) => (
                  <div onClick={() => handleClick(user)} className="user" key={index}>
                    <MyImage
                      src={user.profileImageUri}
                      preloadImage={PersonSvg}
                      defaultImage={PersonSvg}
                    />
                    <div className="text">
                      {`${user.givenName} ${user.familyName}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="comments-footer">
          {listOfUsers.length > 0 && (
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
        </div>
        <div className="button-container">
          <Button parentClassName="submit-form" type="submit" value="Search" onClick={handleSearchUser} />
        </div>
      </form>
      {attendanceList.length === 0 && (
        <UserCheckInModal
          show={openModal}
          handleClick={() => {
            setOpenModal(false);
          }}
          handleClose={() => {
            handleBack();
          }}
          user={selectedUser}
          authToken={authToken}
          branchId={branch.id}
          sessions={sessions}
        />
      )}
      {attendanceList.length !== 0 && (
        <CheckOutModal
          isVisitor={false}
          show={openModal}
          handleClick={() => {
            setOpenModal(false);
          }}
          handleClose={() => {
            handleBack();
          }}
          user={selectedUser}
          authToken={authToken}
          attendance={attendanceList[0]}
        />
      )}
    </div>
  );
}

export default UserCheckInCheckOut;
