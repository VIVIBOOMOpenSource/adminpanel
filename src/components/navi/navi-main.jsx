import React, { useEffect, useState } from 'react';
import './navi-main.scss';

import NaviLogo from './navi-logo';
import NaviBody from './navi-body';
import NaviFooter from './navi-footer';
import useHeaderState from '../../store/header';

function NaviMain() {
  const [toggleWidth, setToggleWidth] = useState((localStorage.naviToggleWidth === 'true'));
  const { header } = useHeaderState();
  const menuClass = (header.menuOpen) ? ' open' : ' close';

  useEffect(() => {
    localStorage.setItem('naviToggleWidth', toggleWidth);
  }, [toggleWidth]);

  return (
    <div className={`navi-main${menuClass}${(toggleWidth) ? ' toggle-width-active' : ''}`}>
      <div className="width-toggle" onClick={() => { setToggleWidth(!toggleWidth); }} />
      <NaviLogo />
      <NaviBody />
      <NaviFooter />
    </div>
  );
}

export default NaviMain;
