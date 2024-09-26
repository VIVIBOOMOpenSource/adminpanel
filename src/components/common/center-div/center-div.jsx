import React from 'react';
import './center-div.scss';

function CenterDiv({ sidePadding, children }) {
  const newSidePadding = (sidePadding !== undefined) ? sidePadding : '0px';

  const customPadding = {
    padding: `0px ${newSidePadding}`,
  };

  return (
    <div className="center-div-outer">
      <div className="center-div-middle" style={customPadding}>
        {children}
      </div>
    </div>
  );
}

export default CenterDiv;
