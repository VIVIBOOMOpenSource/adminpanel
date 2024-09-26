import React from 'react';
import './navi-logo.scss';
import { Link } from 'react-router-dom';
import Logo from 'src/css/imgs/viviboom-logo-dark.png';

function NaviLogo() {
  return (
    <div className="navi-logo">
      <Link to="/">
        <img src={Logo} alt="Viviboom" />
      </Link>
    </div>
  );
}

export default NaviLogo;
