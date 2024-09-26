import React from 'react';
import './navi-gray-out-screen.scss';

import useHeaderState from '../../store/header';

function NaviGrayOutScreen() {
  const { toggleMenu, header } = useHeaderState();
  const screenClass = (header.menuOpen) ? ' open' : ' close';

  return (
    <div className={`navi-gray-out-screen${screenClass}`} onClick={toggleMenu} />
  );
}

export default NaviGrayOutScreen;
