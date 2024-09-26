import React from 'react';
import './navi.scss';

import { useSelector } from 'react-redux';
import NaviMain from './navi-main';
import NaviMobile from './navi-mobile';
import NaviGrayOutScreen from './navi-gray-out-screen';

function Navi() {
  const user = useSelector((state) => state.user);
  if (!user.authToken) return null;

  return (
    <div className="navi">
      <NaviMobile />
      <NaviMain />
      <NaviGrayOutScreen />
    </div>
  );
}

export default Navi;
