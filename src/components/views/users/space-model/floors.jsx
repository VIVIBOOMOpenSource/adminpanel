import { Player } from '@lottiefiles/react-lottie-player';
import React, { useEffect, useState } from 'react';
import './kampong-eunos.scss';
import {
  floorItems, floors, rooms, showAnimation,
} from './data';

function Floors({
  zoom, isDragging, handleItemClick, handleRoomClick,
}) {
  const [showFloors, setShowFloors] = useState({ firstFloor: false, secondFloor: false });

  const [mapFocus, setMapFocus] = useState('firstFloor');

  const handleFloorClick = (floorKey) => () => {
    if (!isDragging) setMapFocus(floorKey);
  };

  useEffect(() => {
    setTimeout(() => setShowFloors({ firstFloor: true, secondFloor: false }), 800);
    setTimeout(() => setShowFloors({ firstFloor: true, secondFloor: true }), 1000);
  }, []);

  return (
    <>
      <div
        className={`clickable-svg floor${showFloors.firstFloor ? '' : ' floor-hide'}`}
        // className="clickable-svg"
        style={{
          left: zoom * floors.first.location.x,
          top: zoom * floors.first.location.y,
          width: zoom * floors.first.width,
          height: zoom * floors.first.height,
          opacity: showFloors.firstFloor && mapFocus === 'firstFloor' ? 1 : undefined,
          animation: showFloors.firstFloor && mapFocus === 'firstFloor' ? 0 : undefined,
        }}
      >
        <floors.first.svg
          className="unclickable-svg"
          src={floors.first.image}
          alt={floors.first.id}
        />
        <svg className="clickable-svg-cover" viewBox="0 0 1280 676.193">
          <polygon
            onClick={handleFloorClick('firstFloor')}
            onTouchEnd={handleFloorClick('firstFloor')}
            points="1280 324.992 689.91 665.709 0 267.309 417.572 26.203 780.675 235.882 953.172 136.281 1280 324.992"
            fill="#ffffff00"
          />
        </svg>
      </div>
      <div
        className={`clickable-svg floor${showFloors.secondFloor ? '' : ' floor-hide'}`}
        // className="clickable-svg"
        style={{
          left: zoom * floors.second.location.x,
          top: zoom * floors.second.location.y,
          width: zoom * floors.second.width,
          height: zoom * floors.second.height,
          opacity: showFloors.secondFloor && mapFocus === 'secondFloor' ? 1 : undefined,
          animation: showFloors.secondFloor && mapFocus === 'secondFloor' ? 0 : undefined,
        }}
      >
        <floors.second.svg
          className="unclickable-svg"
          src={floors.second.image}
          alt={floors.second.id}
        />
        <svg className="clickable-svg-cover" viewBox="0 0 1280 664.59">
          <polygon
            onClick={handleFloorClick('secondFloor')}
            onTouchEnd={handleFloorClick('secondFloor')}
            points="1300 284.992 644.91 665.709 0 292.309 0 212.309 367.572 0 790.675 240.882 1013.172 111.281 1300 284.992"
            fill="#ffffff00"
          />
        </svg>
      </div>
      {floorItems.map((v) => (
        <button
          key={`clickable_${v.id}`}
          className={`clickable-item floor${showFloors[v.floor] ? '' : ' floor-hide'}`}
          // className="clickable-item"
          style={{
            left: zoom * v.location.x,
            top: zoom * v.location.y,
            width: zoom * v.width,
            height: zoom * v.height,
            pointerEvents: mapFocus !== v.floor || v.disabled ? 'none' : 'auto',
            opacity: showFloors[v.floor] && mapFocus === v.floor ? 1 : undefined,
            animation: showFloors[v.floor] && mapFocus === v.floor ? 0 : undefined,
          }}
          type="button"
          onClick={handleItemClick(v.contentKey || v.id)}
          onTouchEnd={handleItemClick(v.contentKey || v.id)}
        >
          {!!v.lottie && (
            <Player
              autoplay={showAnimation}
              loop
              src={v.lottie}
              style={{ height: '100%', width: '100%' }}
            />
          )}
          {!!v.image && <img className={`clickable-item-image ${showAnimation ? v.animation : ''}`} style={v.style} src={v.image} alt={v.id} />}
          {!!v.children && v.children}
        </button>
      ))}
      {rooms.map((v) => (
        <button
          key={`clickable_${v.id}`}
          className={`clickable-item floor${showFloors[v.floor] ? '' : ' floor-hide'}`}
          // className="clickable-item"
          style={{
            left: zoom * v.location.x,
            top: zoom * v.location.y,
            width: zoom * v.width,
            height: zoom * v.height,
            pointerEvents: mapFocus !== v.floor ? 'none' : 'auto',
            opacity: showFloors[v.floor] && mapFocus === v.floor ? 1 : undefined,
            animation: showFloors[v.floor] && mapFocus === v.floor ? 0 : undefined,
          }}
          type="button"
          onClick={handleRoomClick(v.contentKey || v.id)}
          onTouchEnd={handleRoomClick(v.contentKey || v.id)}
        >
          {!!v.lottie && (
            <Player
              autoplay={showAnimation}
              loop
              src={v.lottie}
              style={{ height: '100%', width: '100%' }}
            />
          )}
          {!!v.image && <img className="clickable-item-image" src={v.image} alt={v.id} />}
        </button>
      ))}
    </>
  );
}

export default Floors;
