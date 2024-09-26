import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { components } from 'react-select';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './assign-staff-role.scss';

import MyImage from 'src/components/common/MyImage';
import Button from 'src/components/common/button/button';
import Pagination from 'src/components/common/pagination/pagination';
import Loading from 'src/components/common/loading/loading';
import PersonSvg from 'src/css/imgs/icon-person.svg';

import StaffRoleApi from 'src/apis/viviboom/StaffRoleApi';
import UserApi from 'src/apis/viviboom/UserApi';

const DEFAULT_LIMIT = 9;

// custom option component with user image
function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.profileImageUri} alt={value?.name} preloadImage={PersonSvg} defaultImage={PersonSvg} width={128} />
        {children}
      </div>
    </components.Option>
  );
}

function AssignStaffRole({ staffRoleId }) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);

  const [selectedUserOption, setSelectedUserOption] = useState(null);

  const [assignedUsers, setAssignedUsers] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAssignedUsers = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: user.authToken,
        staffRoleIds: [staffRoleId],
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await UserApi.getList(requestParams);
      setAssignedUsers(res.data?.users);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, staffRoleId]);

  const addUserToStaffRole = useCallback(async () => {
    if (!selectedUserOption) return toast.error(t('Please select a user to add'));
    setLoading(true);
    try {
      await StaffRoleApi.postUser({
        authToken: user.authToken,
        staffRoleId,
        userId: selectedUserOption.value.id,
      });
      toast.success(t('User Added'));
      setPage(1);
      await fetchAssignedUsers(1);
      setSelectedUserOption(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message);
    }
    return setLoading(false);
  }, [fetchAssignedUsers, selectedUserOption, staffRoleId, user.authToken, t]);

  const removeUserFromStaffRole = (id) => async () => {
    if (window.confirm(t('Remove this user from staff role?'))) {
      if (id === user?.id) {
        toast.error(t('Cannot remove yourself.'));
        return;
      }
      setLoading(true);
      try {
        await StaffRoleApi.deleteUser({
          authToken: user.authToken,
          staffRoleId,
          userId: id,
        });
        toast.success(t('User removed'));
        setPage(1);
        await fetchAssignedUsers();
      } catch (err) {
        console.error(err);
        toast.error(err);
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

  useEffect(() => {
    if (staffRoleId) fetchAssignedUsers();
  }, [fetchAssignedUsers, staffRoleId]);

  useEffect(() => {
    setSelectedUserOption(null);
  }, [staffRoleId]);

  if (!staffRoleId) {
    return <div>{t('Create staff role before adding users')}</div>;
  }

  return (
    <div className="role-user">
      <div className="add-role-user">
        <h2>
          {t('Assign staff role to a user')}
          :
        </h2>
        <div className="select-ctn">
          <label>
            {t('Choose a user')}
            :
          </label>
          <AsyncPaginate
            isClearable
            maxMenuHeight={200}
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            cacheUniqs={[staffRoleId]}
            value={selectedUserOption}
            loadOptions={loadUserOptions}
            onChange={setSelectedUserOption}
            components={{ Option }}
          />
        </div>
        {selectedUserOption && selectedUserOption.value.branchId !== branch.id && (
          <div className="warning">
            *Please note that you are granting access to a user outside
            {' '}
            {branch.name}
          </div>
        )}
        <button type="button" className="add-button" onClick={addUserToStaffRole}>
          {t('Add User')}
        </button>
      </div>

      <div className="role-users">
        <h2>
          {t('Staff Role Assigned To')}
          :
        </h2>
        {assignedUsers.length ? (
          <div className="role-users-ctn">
            <div className="role-users-header">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            <Loading show={loading} size="32px" />
            <ul className="role-users-list">
              {assignedUsers.map((v) => (
                <li key={`role_${staffRoleId}-user_${v.id}`}>
                  <div className="user-info">
                    <MyImage src={v?.profileImageUri} alt={v?.name} preloadImage={PersonSvg} defaultImage={PersonSvg} width={128} />
                    <div>{`${v.username}, ${v.givenName} ${v.familyName}`}</div>
                  </div>
                  <Button status={loading ? 'loading' : 'minus'} parentClassName="user-button" onClick={removeUserFromStaffRole(v.id)} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>{t('Staff role is not assigned to any user yet.')}</div>
        )}
      </div>
    </div>
  );
}

export default AssignStaffRole;
