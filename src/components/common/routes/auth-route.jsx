import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Route, Redirect, useHistory, useLocation,
} from 'react-router-dom';
import { toast } from 'react-toastify';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import UserReduxActions from 'src/redux/user/UserReduxActions';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';

function Page({ component: Component, privilegeRequired, ...rest }) {
  const { t } = useTranslation();
  const branch = useSelector((state) => state.branch);

  const authToRead = useMemo(() => !privilegeRequired || branch.userStaffRolePrivilegesHt?.[privilegeRequired], [branch, privilegeRequired]);
  const authToUpdate = useMemo(() => !privilegeRequired || branch.userStaffRolePrivilegesHt?.[privilegeRequired] >= StaffRolePrivilegeLevel.UPDATE, [branch, privilegeRequired]);
  const authToCreate = useMemo(() => !privilegeRequired || branch.userStaffRolePrivilegesHt?.[privilegeRequired] >= StaffRolePrivilegeLevel.CREATE_DELETE, [branch, privilegeRequired]); // delete

  if (!authToRead) return <h2>{t('common.unauthorizedPage')}</h2>;
  return <Component authToUpdate={authToUpdate} authToCreate={authToCreate} {...rest} />;
}

function AuthRoute({ component, privilegeRequired, ...rest }) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const history = useHistory();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        await UserReduxActions.fetch();
        if (!user?.isEmailVerified) {
          if (!history.location.pathname.includes('/verify-email')) {
            setRedirect('/verify-email');
          } else {
            setRedirect('');
          }
        } else {
          if ((!branch?.allowVivicoinRewards || !user?.institution?.isRewardEnabled) && location.pathname.includes('/vivicoin')) setRedirect('/not-found');
          if (!branch?.allowEventBooking && (['/events', '/all-bookings', '/quota'].includes(location.pathname))) setRedirect('/not-found');
          if (!user?.institution?.isVaultEnabled && location.pathname.includes('/vivivault')) setRedirect('/not-found');
        }
      } catch (err) {
        toast.error(t('autoLogout'));
        await UserReduxActions.logout();
        setRedirect('/login');
      }
    };
    const fetchBranchData = async () => {
      await BranchReduxActions.fetch();
    };
    if (user?.authToken) {
      checkAuthToken();
      fetchBranchData();
    } else {
      setRedirect('/login');
    }
  }, [user?.authToken, history.location.pathname, user?.isEmailVerified, t, branch?.allowVivicoinRewards, branch?.allowEventBooking, location.pathname, user?.institution?.isVaultEnabled, user?.institution?.isRewardEnabled]);

  if (!redirect) return <Route {...rest} render={(props) => <Page component={component} privilegeRequired={privilegeRequired} {...props} />} />;
  return <Redirect {...rest} to={{ pathname: redirect }} />;
}

export default AuthRoute;