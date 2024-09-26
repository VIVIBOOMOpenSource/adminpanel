import React from 'react';
import './navi-mobile.scss';

import NaviLogo from './navi-logo';
import useHeaderState from '../../store/header';
import { ReactComponent as MenuSvg } from '../../css/imgs/icon-menu.svg';

function NaviMobile() {
  const { toggleMenu, header } = useHeaderState();
  const menuClass = (header.menuOpen) ? ' open' : ' close';

  return (
    <div className={`navi-mobile${menuClass}`}>
      <button className="menu button" onClick={toggleMenu}><MenuSvg /></button>
      <div className="logo-container">
        <NaviLogo />
      </div>
    </div>
  );
}

export default NaviMobile;
