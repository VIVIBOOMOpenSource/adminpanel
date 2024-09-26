import React, { useState } from 'react';

import './check-in-check-out.scss';

import VisitorCheckIn from './visitor-check-in';
import VisitorCheckOut from './visitor-check-out';

function VisitorCheckInCheckOut({ resetState, sessions }) {
  const [visitorCheckOut, setVisitorCheckOut] = useState(false);

  const handleBack = () => {
    setVisitorCheckOut(false);
    resetState();
  };

  return (
    <div className="form-content">
      <div className="toggle-container">
        <button onClick={() => setVisitorCheckOut((b) => !b)} className="back-button checkout" type="submit">
          {visitorCheckOut ? 'Check In' : 'Check Out'}
        </button>
        <button className="back-button" onClick={handleBack} type="submit">Back</button>
      </div>
      <div className="input-container">
        {!visitorCheckOut ? (
          <VisitorCheckIn resetState={resetState} sessions={sessions} />
        ) : (
          <VisitorCheckOut resetState={resetState} />
        )}
      </div>
    </div>
  );
}

export default VisitorCheckInCheckOut;
