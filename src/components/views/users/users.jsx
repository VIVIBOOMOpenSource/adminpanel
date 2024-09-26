import React, {
  useState, useEffect, useCallback,
  useMemo,
} from 'react';
import './users.scss';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserApi from 'src/apis/viviboom/UserApi';
import MyImage from 'src/components/common/MyImage';
import { DateTime } from 'luxon';
import { UserAccountStatusType } from 'src/enums/UserAccountStatusType';
import { ReactComponent as CopySvg } from 'src/css/imgs/icon-copy.svg';
import Button from '../../common/button/button';
import Loading from '../../common/loading/loading';
import * as DateUtil from '../../../utils/date';
import PersonSvg from '../../../css/imgs/icon-person.svg';

import UserModal from './user-modal';
import Pagination from '../../common/pagination/pagination';
import UserBulkImportModal from './user-tabs/user-bulk-import-modal';

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
  { key: 'name', title: 'Name', toString: (data) => data ?? '' },
  { key: 'username', title: 'Username', toString: (data) => data ?? '' },
  { key: 'createdAt', title: 'Created Date', toString: (date) => (date ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '') },
  { key: 'lastActiveAt', title: 'Last Active', toString: (date) => (date ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '') },
  { key: 'guardianEmail', title: "Guardian's Email", toString: (data) => data ?? '' },
  { key: 'guardianPhone', title: "Guardian's Phone", toString: (data) => data ?? '' },
  { key: 'accountStatus', title: 'Account Status', toString: (data) => data ?? '' },
];

const exportSecondGuardianFields = [
  { key: 'guardianEmailTwo', title: "Second Guardian's Email", toString: (data) => data ?? '' },
  { key: 'guardianPhoneTwo', title: "Second Guardian's Phone", toString: (data) => data ?? '' },
];

const secondGuardianCountryISO = ['EE', 'NZ', 'US'];

const exportAsCsv = (users, exportSecondGuardian = false) => {
  const fields = !exportSecondGuardian ? exportFields : [...exportFields, ...exportSecondGuardianFields];

  const rows = [
    fields.map((field) => field.title).join(','), // titles
    ...users.map((user) => fields.map((field) => field.toString?.(user[field.key])).join(',')), // data rows
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

function Users({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('username');
  const [queryOrder, setQueryOrder] = useState('ASC');
  const [queryRoleType, setQueryRoleType] = useState(defaultRoleTypes[0]);

  const [queryUserResults, setQueryUserResults] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isShowUserModal, setIsShowUserModal] = useState(!!state?.isCreate);
  const [modalUserToShow, setModalUserShowUser] = useState();

  const [showUserBulkImportModal, setShowUserBulkImportModal] = useState(false);

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
    if (!user.authToken) return;
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
  }, [constructSearchParams, t, user.authToken]);

  useEffect(() => { searchUsers(); }, [searchUsers]);

  const onExportPress = async () => {
    const params = constructSearchParams();
    try {
      const promises = [...Array(totalPages).keys()].map((p) => UserApi.getList({ ...params, offset: p * QUERY_ROW_COUNT }));
      const results = await Promise.allSettled(promises);
      const allUsers = results.flatMap((p) => p?.value?.data.users);
      exportAsCsv(allUsers, secondGuardianCountryISO.includes(branch.countryISO)); // hardcode to return second guardian info
    } catch (e) {
      console.log(e);
      if (e.response?.body?.message) toast(e.response?.body?.message);
      else toast(t('Fail to fetch data'));
    }
  };

  const onCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="users-comp">
      <div className="users-container">
        <div className="users-container-left">
          <h1>{t('Users')}</h1>
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
          {branch.institutionId > 1 && (
            <div className="user-sign-up-banner">
              <div className="user-sign-up-heading">
                The Sign-Up Code for this branch is
                {' '}
                <button type="button" className="sign-up-code" onClick={() => { onCopy(branch.code); toast.success('Branch code copied!'); }}>
                  {branch.code}
                  <CopySvg />
                </button>
              </div>
              <div className="user-sign-up-subtitle">
                Easily add your students by asking them to visit
                {' '}
                <a href="https://viviboom.co/sign-up" target="_blank" rel="noreferrer">viviboom.co/sign-up</a>
                {' '}
                and register a new account with the Sign-Up Code.
              </div>
            </div>
          )}
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
            <div className="users-add bulk-add">
              <Button
                onClick={() => setShowUserBulkImportModal(true)}
                disabled={!authToCreate}
              >
                {t('Bulk Import CSV')}
              </Button>
            </div>
          </div>
          <div className="users-main">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Username')}</th>
                  <th>{t('Name')}</th>
                  <th>{t("Guardian's Email")}</th>
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
                        {queriedUser?.name}
                      </td>
                      <td>{queriedUser?.guardianEmail}</td>
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
                <Button onClick={() => onExportPress()}>{t('Export')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserModal
        show={isShowUserModal}
        handleClose={() => {
          setModalUserShowUser(null);
          setIsShowUserModal(false);
        }}
        onUserDataChanged={searchUsers}
        onBulkImportClick={() => { setIsShowUserModal(false); setShowUserBulkImportModal(true); }}
        user={modalUserToShow}
        authToUpdate={authToUpdate}
        authToCreate={authToCreate}
      />

      <UserBulkImportModal show={showUserBulkImportModal} handleClose={() => setShowUserBulkImportModal(false)} onUserDataChanged={searchUsers} authToCreate={authToCreate} />
    </div>
  );
}

export default Users;
