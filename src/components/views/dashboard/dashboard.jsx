import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { ReactComponent as CopySvg } from 'src/css/imgs/icon-copy.svg';
import { ReactComponent as AddSvg } from 'src/css/imgs/icon-add.svg';
import { ReactComponent as CheckInSvg } from 'src/css/imgs/icon-check-in.svg';
import { ReactComponent as RegistrationSvg } from 'src/css/imgs/icon-registration.svg';
import { ReactComponent as SpaceSvg } from 'src/css/imgs/icon-space.svg';
import { ReactComponent as GuideSvg } from 'src/css/imgs/icon-guide.svg';
import { ReactComponent as InstitutionSvg } from 'src/css/imgs/icon-institution.svg';
import AdminIcon from 'src/css/imgs/admin-icon.png';

import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import './dashboard.scss';
import { toast } from 'react-toastify';
import Config from 'src/config';

const adminPortalGuide = 'https://www.notion.so/vivitaglobal/VIVIBOOM-Admin-Portal-Guide-52e9914756d84124be537e707fc9b7aa';
const accountGuide = 'https://www.notion.so/vivitaglobal/Create-Manage-Admin-and-Creator-Accounts-d9eadbebcdaf41b0bb238ce1d260268c';
const badgeGuide = 'https://www.notion.so/vivitaglobal/Create-and-Award-Badges-Manage-Projects-a93c6e229bdd4f829e908dd957682087';
const eventGuide = 'https://www.notion.so/vivitaglobal/Create-Manage-Events-5ba3ed4d60ab443bbf9f0c7797cf043d';

function Dashboard() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const branchCode = useSelector((state) => state.branch.code);
  const eventPublicLink = `${Config.Common.FrontEndUrl}/branch/${branch?.id}/event`;
  const history = useHistory();

  const onCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="dashboard">
      <div className="welcome-container">
        <div className="welcome-title-container">
          <img src={AdminIcon} alt="admin" className="admin-logo" />
          <h1 className="welcome-title">{t('Welcome')}</h1>
        </div>
        <div className="welcome-subtitle">
          {t("You're at Viviboom Admin Portal")}
          {' '}
          -
          {' '}
          <NavLink className="link" to="/my-branch">
            {user?.institution?.name}
            <span style={{ margin: '0 8px' }}>›</span>
            {branch?.name}
          </NavLink>
        </div>
        <div className="institution-info">
          {branch.institutionId !== 1 && branch.userStaffRolePrivilegesHt?.[StaffRolePrivilegeFeatureType.USER] >= StaffRolePrivilegeLevel.CREATE_DELETE && (
            <div className="copy">
              <div className="copy-title">
                {t('Sign-Up Code')}
                :
              </div>
              <button type="button" className="sign-up-code" onClick={() => { onCopy(branchCode); toast.success('Branch code copied!'); }}>
                {branchCode}
                <CopySvg />
              </button>
            </div>
          )}
          <div className="copy">
            <div className="copy-title">
              {t('Public Event Link')}
              :
            </div>
            <div className="public-event-link">
              <a href={eventPublicLink} target="_blank" rel="noreferrer">
                {eventPublicLink}
              </a>
              <CopySvg onClick={() => { onCopy(eventPublicLink); toast.success('Public event link copied!'); }} />
            </div>
          </div>
        </div>
        <div className="recommendation-links">
          <a href={Config.Common.FrontEndUrl} target="_blank" rel="noreferrer" className="recommendation-link">
            {t('Members Portal')}
          </a>
          <a href={adminPortalGuide} target="_blank" rel="noreferrer" className="recommendation-link">
            {t('Admin Portal Guide')}
          </a>
          <a href={Config.Common.MobileAppUrl} target="_blank" rel="noreferrer" className="recommendation-link">
            {t('Mobile App Download')}
          </a>
        </div>
        <div className="recommendation-buttons">
          <button type="button" className="recommendation-button" onClick={() => history.push({ pathname: '/users', state: { isCreate: true } })}>
            <AddSvg />
            {t(branch.institutionId === 1 ? 'Add new members' : 'Add new students')}
          </button>
          <button type="button" className="recommendation-button" onClick={() => history.push({ pathname: '/badges', state: { isCreate: true } })}>
            <AddSvg />
            {t('Add a new badge')}
          </button>
          <button type="button" className="recommendation-button" onClick={() => history.push({ pathname: '/challenges', state: { isCreate: true } })}>
            <AddSvg />
            {t('Add a new challenge')}
          </button>
          <button type="button" className="recommendation-button" onClick={() => history.push({ pathname: '/events', state: { isCreate: true } })}>
            <AddSvg />
            {t('Create a new event')}
          </button>
          <button type="button" className="recommendation-button" onClick={() => history.push({ pathname: '/public-portfolio', state: { isCreate: true } })}>
            <AddSvg />
            {t('Create a public porfolio')}
          </button>
        </div>
        <div className="quick-access">
          <div className="quick-access-title">
            {t('Quick Access')}
          </div>
          <div className="access-buttons">
            {branch.institutionId === 1 && (
              <>
                <button type="button" className="access-button" onClick={() => history.push('/vivinautreg')}>
                  <RegistrationSvg />
                  {t('Vivinaut Registration')}
                </button>
                <button type="button" className="access-button" onClick={() => history.push('/checkincheckout')}>
                  <CheckInSvg />
                  {t('Check In / Check Out')}
                </button>
                {branch.id === 1 && (
                  <button type="button" className="access-button" onClick={() => history.push('/kampongeunos')}>
                    <SpaceSvg />
                    {t('Space Visualization')}
                  </button>
                )}
              </>
            )}
            <button type="button" className="access-button" onClick={() => window.open(accountGuide)}>
              <GuideSvg />
              {t('Guide on Account & Admin')}
            </button>
            <button type="button" className="access-button" onClick={() => window.open(badgeGuide)}>
              <GuideSvg />
              {t('Guide on Badge & Project')}
            </button>
            <button type="button" className="access-button" onClick={() => window.open(eventGuide)}>
              <GuideSvg />
              {t('Guide on Event Management')}
            </button>

            {branch.id === 1 && user.branchId === 1 && branch.userStaffRolePrivilegesHt?.[StaffRolePrivilegeFeatureType.STAFF_ROLE] >= StaffRolePrivilegeLevel.CREATE_DELETE && (
              <button type="button" className="access-button" onClick={() => history.push('/institutions')}>
                <InstitutionSvg />
                {t('Institution Management')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
