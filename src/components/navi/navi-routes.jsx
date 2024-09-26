import React from 'react';

import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';

import { ReactComponent as BadgeSvg } from '../../css/imgs/icon-badge.svg';
import { ReactComponent as ChallengeSvg } from '../../css/imgs/icon-challenge.svg';
import { ReactComponent as CommentSvg } from '../../css/imgs/icon-comment.svg';
import { ReactComponent as PeopleSvg } from '../../css/imgs/icon-people.svg';
import { ReactComponent as DraftSvg } from '../../css/imgs/icon-draft.svg';
import { ReactComponent as DashboardSvg } from '../../css/imgs/icon-dashboard.svg';
import { ReactComponent as BookingSvg } from '../../css/imgs/icon-book.svg';
import { ReactComponent as UserBookingSvg } from '../../css/imgs/icon-info.svg';
import { ReactComponent as QuotaSvg } from '../../css/imgs/icon-table-chart.svg';
import { ReactComponent as CountrySvg } from '../../css/imgs/icon-language.svg';
import { ReactComponent as CoinSvg } from '../../css/imgs/icon-coin.svg';
import { ReactComponent as EditSvg } from '../../css/imgs/icon-edit.svg';
import { ReactComponent as TreasureChestSvg } from '../../css/imgs/icon-treasure-chest.svg';
import { ReactComponent as BranchesSvg } from '../../css/imgs/icon-branches.svg';
import { ReactComponent as ClassSvg } from '../../css/imgs/icon-class.svg';

const naviRoutes = [
  {
    name: 'dashboard',
    display: 'Dashboard',
    path: '/',
    icon: <DashboardSvg />,
  },
  {
    name: 'users',
    display: 'Users',
    path: '/users',
    icon: <PeopleSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.USER,
  },
  {
    name: 'projects',
    display: 'Projects',
    path: '/projects',
    icon: <DraftSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.PROJECT,
  },
  {
    name: 'badges',
    display: 'Badges',
    path: '/badges',
    icon: <BadgeSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.BADGE,
  },
  {
    name: 'challenges',
    display: 'Challenges',
    path: '/challenges',
    icon: <ChallengeSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.BADGE,
  },
  {
    name: 'comments',
    display: 'Comments',
    path: '/comments',
    icon: <CommentSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.USER,
  },
  {
    name: 'events',
    display: 'Events',
    path: '/events',
    icon: <BookingSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.EVENT,
  },
  {
    name: 'all-bookings',
    display: 'Bookings',
    path: '/all-bookings',
    icon: <UserBookingSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.EVENT,
  },
  {
    name: 'quota',
    display: 'Quota Allocation',
    path: '/quota',
    icon: <QuotaSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.EVENT,
  },
  {
    name: 'public-portfolio',
    display: 'Public Portfolio',
    path: '/public-portfolio',
    icon: <EditSvg />,
  },
  {
    name: 'vivi-coins',
    display: 'Vivicoin',
    path: '/vivicoin',
    icon: <CoinSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.WALLET,
  },
  {
    name: 'vivi-vault',
    display: 'Vivivault',
    path: '/vivivault',
    icon: <TreasureChestSvg />,
  },
  {
    name: 'branches',
    display: 'Branches',
    path: '/branches',
    icon: <BranchesSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.STAFF_ROLE,
  },
  {
    name: 'classes',
    display: 'Classes',
    path: '/classes',
    icon: <ClassSvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.STAFF_ROLE,
  },
  {
    name: 'my-branch',
    display: 'My Branch',
    path: '/my-branch',
    icon: <CountrySvg />,
    staffRolePrivilegeFeatureType: StaffRolePrivilegeFeatureType.STAFF_ROLE,
  },
];

export default naviRoutes;
