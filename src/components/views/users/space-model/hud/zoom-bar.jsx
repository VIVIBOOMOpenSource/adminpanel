import React from 'react';

import { ReactComponent as AddSVG } from 'src/css/imgs/icon-add.svg';
import { ReactComponent as MinusSVG } from 'src/css/imgs/icon-minus.svg';
import './zoom-bar.scss';
import { zoomMax, zoomMin, zoomStep } from '../data';

function ZoomBar({ zoom, handleZoomChange }) {
  return (
    <div className="zoom-bar-container">
      <input type="range" orient="vertical" min={zoomMin} max={zoomMax} step={zoomStep} value={zoom} onChange={(e) => handleZoomChange(+e.target.value)} />
      <button className="top-button" type="button" onClick={() => handleZoomChange(zoom + zoomStep)} disabled={zoom >= zoomMax}>
        <AddSVG />
      </button>
      <button className="bottom-button" type="button" onClick={() => handleZoomChange(zoom - zoomStep)} disabled={zoom <= zoomMin}>
        <MinusSVG />
      </button>
    </div>
  );
}

export default ZoomBar;
