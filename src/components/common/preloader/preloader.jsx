import React from 'react';

import './preloader.scss';

function Preloader() {
  return (
    <div className="preloader">
      <div className="preloader-dot" />
      <div className="preloader-dot" />
      <div className="preloader-dot" />
      <div className="preloader-dot" />
      <div className="preloader-dot" />
    </div>
  );
}

export default Preloader;
