import React from 'react';
import './css/styles/app.scss';
import './css/styles/common.scss';

import {
  Router, Route, Switch, withRouter,
} from 'react-router-dom';
import { ToastContainer, Flip } from 'react-toastify';
import history from './store/history';

import Navi from './components/navi/navi';
import NaviGrayOutScreen from './components/navi/navi-gray-out-screen';
import Entry from './components/views/entry/entry';
import NotFound from './components/views/not-found/not-found';
import MyAccount from './components/views/my-account/my-account';

import Comments from './components/views/comments/comments';
import Dashboard from './components/views/dashboard/dashboard';
import Users from './components/views/users/users';
import Badges from './components/views/badges/badges';
import Challenges from './components/views/challenges/challenges';
import Projects from './components/views/projects/projects';
import PublicPortfolio from './components/views/public-portfolio/public-portfolio';
import Bookings from './components/views/bookings/bookings';
import AllBookings from './components/views/user-bookings/all-bookings';
import Quota from './components/views/quota/quota';
import MyBranch from './components/views/my-branch/my-branch';
import GoogleAdminOnly from './components/views/my-branch/google-admin-only';
import GoogleCalendar from './components/views/my-branch/google-calendar';
import CheckInCheckOut from './components/views/users/check-in-check-out/check-in-check-out';
import UserRegistrationForm from './components/views/users/user-registration-form';
import Vivicoins from './components/views/vivicoin/vivicoin';
import Vivivault from './components/views/vivivault/vivivault';

import ResetPassword from './components/views/email-related/reset-password/reset-password';
import VerifyEmail from './components/views/email-related/verify-email/verify-email';

import AuthRoute from './components/common/routes/auth-route';
import ScrollToTop from './components/common/routes/scroll-to-top';

import 'react-toastify/dist/ReactToastify.css';
import StaffRolePrivilegeFeatureType from './enums/StaffRolePrivilegeFeatureType';
import Branches from './components/views/branches/branches';
import SpaceModel from './components/views/users/space-model/canvas';
import Institutions from './components/views/institutions/institutions';

function App() {
  const subDirectory = '/';

  const NaviDiv = withRouter(() => (
    <div className="navi-container">
      <Navi />
      <NaviGrayOutScreen />
    </div>
  ));

  return (
    <Router basename={subDirectory} history={history}>
      <ScrollToTop />
      <div className="app">
        <NaviDiv />
        <div id="content">
          <Switch>
            <Route path="/login(.*)" component={Entry} />

            <Route exact path="/reset-password" component={ResetPassword} />
            <Route path="/reset-password/:token" component={ResetPassword} />

            <Route path="/kampongeunos" component={SpaceModel} />

            <Route path="/verify-email/:token" component={VerifyEmail} />
            <AuthRoute exact path="/verify-email" component={VerifyEmail} />

            <AuthRoute exact path="/" component={Dashboard} />
            <AuthRoute path="/comments" privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={Comments} />
            <AuthRoute path="/users" privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={Users} />
            <AuthRoute path="/badges" privilegeRequired={StaffRolePrivilegeFeatureType.BADGE} component={Badges} />
            <AuthRoute path="/challenges" privilegeRequired={StaffRolePrivilegeFeatureType.BADGE} component={Challenges} />
            <AuthRoute path="/projects" privilegeRequired={StaffRolePrivilegeFeatureType.PROJECT} component={Projects} />
            <AuthRoute path="/events" privilegeRequired={StaffRolePrivilegeFeatureType.EVENT} component={Bookings} />
            <AuthRoute path="/all-bookings" privilegeRequired={StaffRolePrivilegeFeatureType.EVENT} component={AllBookings} />
            <AuthRoute path="/quota" privilegeRequired={StaffRolePrivilegeFeatureType.EVENT} component={Quota} />
            <AuthRoute path="/my-account" component={MyAccount} />
            <AuthRoute path="/my-branch" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={MyBranch} />
            <AuthRoute path="/google-calendar" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={GoogleCalendar} />
            <AuthRoute path="/google-admin-only" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={GoogleAdminOnly} />
            <AuthRoute path="/vivinautreg" exact privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={UserRegistrationForm} />
            <AuthRoute path="/vivinautreg/:userId" exact privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={UserRegistrationForm} />
            <AuthRoute path="/checkincheckout" privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={CheckInCheckOut} />
            <AuthRoute path="/vivicoin" privilegeRequired={StaffRolePrivilegeFeatureType.USER} component={Vivicoins} />
            <AuthRoute path="/public-portfolio" privilegeRequired={StaffRolePrivilegeFeatureType.PROJECT} component={PublicPortfolio} />
            <AuthRoute path="/vivivault" component={Vivivault} />
            <AuthRoute path="/branches" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={Branches} />
            <AuthRoute path="/classes" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={Branches} />
            <AuthRoute path="/institutions" privilegeRequired={StaffRolePrivilegeFeatureType.STAFF_ROLE} component={Institutions} />

            <Route component={NotFound} />
          </Switch>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          transition={Flip}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
