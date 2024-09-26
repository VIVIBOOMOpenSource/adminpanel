import React, { useEffect, useState } from 'react';

import background from 'src/css/imgs/kampong_eunos/pantry.svg';
import './pantry.scss';

import {
  assets, deviceHeight, deviceWidth, roomCanvasHeight, roomCanvasWidth,
} from './data';

function Pantry({ show, setContentKey }) {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setShowItems(true), 300);
    } else {
      setShowItems(false);
    }
  }, [show]);

  return (
    <div
      className={`pantry-container ${show ? '' : 'hide'}`}
      style={{
        width: roomCanvasWidth, height: roomCanvasHeight, left: (deviceWidth - roomCanvasWidth) / 2, top: (deviceHeight - roomCanvasHeight) / 2,
      }}
    >
      <img src={background} alt="pantry" className="pantry-background" draggable={false} />
      {show && assets.pantry.map((v) => (
        <button
          key={`clickable_${v.id}`}
          className={`clickable-item animated${showItems ? '' : ` ${v.animation}`}`}
          style={{
            left: v.location.x, top: v.location.y, width: v.width, height: v.height,
          }}
          type="button"
          onClick={() => setContentKey(v.contentKey || v.id)}
        >
          <img className="clickable-item-image" src={v.image} alt={v.id} />
          {!!v.children && v.children}
        </button>
      ))}
    </div>
  );
}

export default Pantry;
