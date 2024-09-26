import React from 'react';
import './entry.scss';

import ViviboomLogo from 'src/css/imgs/viviboom-logo.png';
import SignIn from './sign/sign-in';

function Entry() {
  return (
    <div className="entry">
      <div className="entry-header">
        <img className="logo-image" alt="logo" src={ViviboomLogo} />
      </div>
      <SignIn />
    </div>
  );
}

export default Entry;
