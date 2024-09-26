import React from 'react';
import { NavLink } from 'react-router-dom';
import './navi-body.scss';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UserReduxActions from 'src/redux/user/UserReduxActions';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';
import { ReactComponent as InfoSvg } from '../../css/imgs/icon-info.svg';
import { ReactComponent as LogoutSvg } from '../../css/imgs/icon-logout.svg';
import { ReactComponent as PersonSvg } from '../../css/imgs/icon-person.svg';

import naviRoutes from './navi-routes';

const eventBookingRoutesPath = ['/events', '/all-bookings', '/quota'];
const vivitaHiddenPaths = ['/classes'];
const newInstitutionHiddenPaths = ['/branches', '/quota'];

function MenuItem({ naviRoute }) {
  const { t } = useTranslation('translation', { keyPrefix: 'navi' });
  const { staffRolePrivilegeFeatureType: privilegeRequired } = naviRoute;
  const branch = useSelector((state) => state.branch);
  const loggedInUser = useSelector((state) => state.user);

  if (!branch?.allowEventBooking && eventBookingRoutesPath.includes(naviRoute.path)) return null;
  if ((!branch?.allowVivicoinRewards || !loggedInUser?.institution?.isRewardEnabled) && naviRoute.path === '/vivicoin') return null;
  if (!loggedInUser?.institution?.isVaultEnabled && naviRoute.path === '/vivivault') return null;

  if (branch?.institutionId !== 1 && newInstitutionHiddenPaths.includes(naviRoute.path)) return null;
  if (branch?.institutionId === 1 && vivitaHiddenPaths.includes(naviRoute.path)) return null;

  if (!privilegeRequired || branch?.userStaffRolePrivilegesHt?.[privilegeRequired]) {
    return (
      <li>
        <NavLink exact to={naviRoute.path} className={naviRoute.name}>
          <div className="icon">{(naviRoute.icon !== undefined) ? naviRoute.icon : <InfoSvg />}</div>
          <div className="detail">
            <div className="display">{t(naviRoute.display)}</div>
            {(naviRoute.desc) ? <div className="desc">{naviRoute.desc}</div> : ''}
          </div>
        </NavLink>
      </li>
    );
  }
  return null;
}

function BranchSelection() {
  const uniqueStaffRoleBranches = useSelector((state) => state.user?.uniqueStaffRoleBranches);
  const curBranchId = useSelector((state) => state.branch.id);
  if (uniqueStaffRoleBranches?.length > 1) {
    return (
      <form
        className="branch-selection"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <select
          value={curBranchId}
          onChange={(e) => {
            BranchReduxActions.setCurBranch({ branchId: Number(e.target.value) });
          }}
        >
          {uniqueStaffRoleBranches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </form>
    );
  }
  return null;
}

function NaviBody() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);

  return (
    <div className="navi-body">
      <BranchSelection />
      <ul>
        { user.isEmailVerified && naviRoutes.map((v) => <MenuItem key={v.name} naviRoute={v} />) }
      </ul>
      <div className="line" />
      <ul>
        <li className="user-options">
          <NavLink className="my-account" to="/my-account">
            <div className="icon"><PersonSvg /></div>
            <div className="detail">
              <div className="display">{t('navi.myAccount')}</div>
              <div className="desc">{user.username}</div>
            </div>
          </NavLink>
        </li>
        <li>
          <div className="logout" onClick={UserReduxActions.logout}>
            <div className="icon"><LogoutSvg /></div>
            <div className="detail">
              <div className="display">{t('navi.logout')}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default NaviBody;
