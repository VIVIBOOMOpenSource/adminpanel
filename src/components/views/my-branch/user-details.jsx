import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import './user-details.scss';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import UserApi from 'src/apis/viviboom/UserApi';
import MyImage from 'src/components/common/MyImage';
import { DateTime } from 'luxon';
import BranchApi from 'src/apis/viviboom/BranchApi';
import { UserAccountStatusType } from 'src/enums/UserAccountStatusType';
import Button from '../../common/button/button';
import Loading from '../../common/loading/loading';
import * as DateUtil from '../../../utils/date';
import PersonSvg from '../../../css/imgs/icon-person.svg';

import UserDetailModal from './user-detail-modal';
import Pagination from '../../common/pagination/pagination';

const filterTypes = {
  username: 'Username',
  guardianEmail: "Guardian's Email",
  createdAt: 'Created Date',
  lastActiveAt: 'Last Active',
  givenName: 'Given Name',
  familyName: 'Family Name',
};

const sortingOrderTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

const defaultRoleTypes = [
  { all: true, name: 'All' },
  { staff: true, name: 'All Staff' },
  { members: true, name: 'All Members' },
  { restricted: true, name: 'Restricted' },
  { banned: true, name: 'Banned' },
];

const QUERY_ROW_COUNT = 100;

const exportFields = [
  { key: 'id', title: 'User ID', toString: (data) => data ?? '' },
  { key: 'givenName', title: 'Given Name', toString: (data) => data ?? '' },
  { key: 'familyName', title: 'Family Name', toString: (data) => data ?? '' },
  { key: 'gender', title: 'Gender', toString: (data) => data ?? '' },
  { key: 'dob', title: 'DoB', toString: (data) => data ?? '' },
  { key: 'school', title: 'School', toString: (data) => data ?? '' },
  { key: 'educationLevel', title: 'Education Level', toString: (data) => data ?? '' },
  { key: 'email', title: "VIVINAUT's Email", toString: (data) => data ?? '' },
  { key: 'phone', title: "VIVINAUT's Phone", toString: (data) => data ?? '' },
  { key: 'username', title: 'VIVIBOOM Username', toString: (data) => data ?? '' },
  { key: 'branch', title: 'VIVISTOP Branch', toString: (branch) => branch?.name ?? '' },
  { key: 'createdAt', title: 'Created Date', toString: (date) => (date ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '') },
  { key: 'lastActiveAt', title: 'Last Active', toString: (date) => (date ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '') },
  { key: 'guardianName', title: "Guardian's Name", toString: (data) => data ?? '' },
  { key: 'guardianRelationship', title: "Guardian's Relationship", toString: (data) => data ?? '' },
  { key: 'address', title: 'Address', toString: (data) => data ?? '' },
  { key: 'guardianEmail', title: "Guardian's Email", toString: (data) => data ?? '' },
  { key: 'guardianPhone', title: "Guardian's Phone", toString: (data) => data ?? '' },
  { key: 'accountStatus', title: 'Account Status', toString: (data) => data ?? '' },
];

const exportSecondGuardianFields = [
  { key: 'guardianNameTwo', title: "Second Guardian's Name", toString: (data) => data ?? '' },
  { key: 'guardianRelationshipTwo', title: "Second Guardian's Relationship", toString: (data) => data ?? '' },
  { key: 'guardianEmailTwo', title: "Second Guardian's Email", toString: (data) => data ?? '' },
  { key: 'guardianPhoneTwo', title: "Second Guardian's Phone", toString: (data) => data ?? '' },
];

const secondGuardianCountryISO = ['EE', 'NZ', 'US'];

const exportAsCsv = (users, exportSecondGuardian = false) => {
  const fields = !exportSecondGuardian ? exportFields : [...exportFields, ...exportSecondGuardianFields];

  const rows = [
    fields.map((field) => field.title).join(','), // titles
    ...users.map((user) => fields.map((field) => `"${field.toString?.(user[field.key])}"`).join(',')), // data rows
  ];

  const csvStr = `${rows.join('\n')}\n`;

  const blob = new Blob([csvStr], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'download.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

function UserDetails({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(true);
  const [projectCountLoading, setProjectCountLoading] = useState(false);
  const [badgeCountLoading, setBadgeCountLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('username');
  const [queryOrder, setQueryOrder] = useState('ASC');
  const [queryRoleType, setQueryRoleType] = useState(defaultRoleTypes[0]);

  const [queryUserResults, setQueryUserResults] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isShowUserModal, setIsShowUserModal] = useState(false);
  const [modalUserToShow, setModalUserShowUser] = useState();

  const staffRoles = useMemo(() => [...defaultRoleTypes, ...branch.staffRoles], [branch]);

  const constructSearchParams = useCallback(() => {
    const params = {
      authToken: user.authToken,
      limit: QUERY_ROW_COUNT,
      offset: ((curPage || 1) - 1) * QUERY_ROW_COUNT,
      branchId: branch.id,
      orderKey: queryType,
      orderDirection: queryOrder,
      verboseAttributes: ['branch', 'wallet'],
    };
    if (query) {
      params[queryType] = query;
    }
    if (queryRoleType) {
      if (queryRoleType.all) {
        // No action required
      } else if (queryRoleType.staff) {
        params.staffRoleIds = branch.staffRoles.map((sr) => sr.id);
      } else if (queryRoleType.members) params.isStaffUser = false;
      else if (queryRoleType.restricted) params.accountStatus = UserAccountStatusType.RESTRICTED;
      else if (queryRoleType.banned) params.accountStatus = UserAccountStatusType.BANNED;
      else params.staffRoleIds = [queryRoleType.id];
    }
    return params;
  }, [branch, curPage, query, queryOrder, queryRoleType, queryType, user.authToken]);

  const searchUsers = useCallback(async () => {
    const params = constructSearchParams();
    setLoading(true);
    try {
      const res = await UserApi.getList(params);
      setQueryUserResults(res.data.users);
      setTotalPages(Math.ceil(res.data.count / QUERY_ROW_COUNT));
    } catch (e) {
      if (e.response?.data?.message) toast(e.response?.data?.message);
      else toast(t('Fail to fetch data'));
    }
    setLoading(false);
  }, [constructSearchParams, t]);

  useEffect(() => { searchUsers(); }, [searchUsers]);

  const onExportPress = async () => {
    const params = constructSearchParams();
    try {
      const promises = [...Array(totalPages).keys()].map((p) => UserApi.getList({ ...params, offset: p * QUERY_ROW_COUNT }));
      const results = await Promise.allSettled(promises);
      const allUsers = results.flatMap((p) => p?.value?.data.users);
      exportAsCsv(allUsers, secondGuardianCountryISO.includes(branch.countryISO)); // hardcode to return second guardian info for estonia
    } catch (e) {
      console.log(e);
      if (e.response?.body?.message) toast(e.response?.body?.message);
      else toast(t('Fail to fetch data'));
    }
  };

  const onProjectCountUpdatePress = async () => {
    const isConfirm = window.confirm('Update number of published projects for all users?');
    if (!isConfirm) {
      return;
    }

    setProjectCountLoading(true);
    try {
      await BranchApi.postUserProjectCountUpdate({ authToken: user.authToken, branchId: branch.id });
      toast.success('All Users Project Counts Updated');
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setProjectCountLoading(false);
  };
  const onBadgeCountUpdatePress = async () => {
    const isConfirm = window.confirm('Update number of badges for all users?');
    if (!isConfirm) {
      return;
    }

    setBadgeCountLoading(true);
    try {
      await BranchApi.postUserBadgeCountUpdate({ authToken: user.authToken, branchId: branch.id });
      toast.success('All Users Badge Counts Updated');
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setBadgeCountLoading(false);
  };

  return (
    <div className="users-details">
      <div className="users-container">
        <div className="users-container-left">
          <h2>{t('VIVINAUT Details')}</h2>
          <ul className="user-sort hlo">
            {(staffRoles || defaultRoleTypes).map((value) => (
              <li
                key={value.name}
                className={(value?.id === queryRoleType?.id && value?.name === queryRoleType?.name) ? 'active' : ''}
                value={value}
                onClick={() => {
                  setCurPage(1);
                  setTotalPages(1);
                  setQueryRoleType(value);
                }}
              >
                {value.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="users-container-center">
          <div className="users-container-top">
            <div className="users-search">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchUsers();
                }}
              >
                <input
                  type="text"
                  value={query}
                  placeholder={t('Search Users')}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                />
                <select
                  value={queryType}
                  onChange={(e) => {
                    setQueryType(e.target.value);
                  }}
                >
                  {Object.keys(filterTypes).map((key) => (
                    <option key={key} value={key}>
                      {t(filterTypes[key])}
                    </option>
                  ))}
                </select>
                <select
                  value={queryOrder}
                  onChange={(e) => {
                    setQueryOrder(e.target.value);
                  }}
                >
                  {Object.keys(sortingOrderTypes).map((key) => (
                    <option key={key} value={key}>
                      {t(sortingOrderTypes[key])}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  status="search"
                  value={t('Search')}
                  className="button"
                />
              </form>
            </div>
            <div className="users-add">
              <Button
                status="add"
                className="button"
                onClick={() => {
                  setModalUserShowUser(null);
                  setIsShowUserModal(true);
                }}
                disabled={!authToCreate}
              >
                {t('New User')}
              </Button>
            </div>
          </div>
          <div className="users-main">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Username')}</th>
                  <th>{t('Name')}</th>
                  <th>{t('Created Date')}</th>
                  <th>{t('Last Active')}</th>
                </tr>
              </thead>
              <tbody>
                {!loading
                  && queryUserResults?.map((queriedUser) => (
                    <tr
                      key={queriedUser.id}
                      onClick={() => {
                        setModalUserShowUser(queriedUser);
                        setIsShowUserModal(true);
                      }}
                    >
                      <td>
                        <div className="username-info">
                          <MyImage
                            src={queriedUser?.profileImageUri}
                            preloadImage={PersonSvg}
                            defaultImage={PersonSvg}
                            width={64}
                          />
                          <div>{queriedUser?.username}</div>
                        </div>
                      </td>
                      <td>
                        {queriedUser?.givenName}
                        {' '}
                        {queriedUser?.familyName}
                      </td>
                      <td>
                        {DateTime.fromISO(queriedUser?.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                      </td>
                      <td>
                        {DateUtil.dateTimeSince(queriedUser.lastActiveAt, t)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {queryUserResults?.length !== 0 ? (
              ''
            ) : (
              <div className="no-results">{t('No Results')}</div>
            )}
            <div className="users-main-footer">
              <Pagination
                page={curPage}
                totalPages={totalPages}
                setPage={setCurPage}
              />
              <div className="users-button-load-div">
                <Button
                  onClick={() => onProjectCountUpdatePress()}
                  status={projectCountLoading ? 'loading' : ''}
                >
                  Update Project Count
                </Button>
                <Button
                  onClick={() => onBadgeCountUpdatePress()}
                  status={badgeCountLoading ? 'loading' : ''}
                >
                  Update Badge Count
                </Button>
                <Button onClick={() => onExportPress()}>{t('Export')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserDetailModal
        show={isShowUserModal}
        handleClose={() => {
          setModalUserShowUser(null);
          setIsShowUserModal(false);
        }}
        onUserDataChanged={searchUsers}
        user={modalUserToShow}
        authToUpdate={authToUpdate}
        authToCreate={authToCreate}
      />
    </div>
  );
}

export default UserDetails;
