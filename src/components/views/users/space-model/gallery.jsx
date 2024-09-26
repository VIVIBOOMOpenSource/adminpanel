import React, { useEffect, useState } from 'react';

import background from 'src/css/imgs/kampong_eunos/gallery.svg';

import './gallery.scss';

import {
  assets, deviceHeight, deviceWidth, roomCanvasHeight, roomCanvasWidth,
} from './data';

const randomNumbers = assets.gallery.map(() => Math.random());

function Gallery({ show, setContentKey }) {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setShowItems(true), 300);
    } else {
      setShowItems(false);
    }
  }, [show]);

  const galleryWall = assets.gallery.find((v) => v.id === 'galleryWall');

  return (
    <div
      className={`gallery-container ${show ? '' : 'hide'}`}
      style={{
        width: roomCanvasWidth, height: roomCanvasHeight, left: (deviceWidth - roomCanvasWidth) / 2, top: (deviceHeight - roomCanvasHeight) / 2,
      }}
    >
      <img src={background} alt="gallery" className="gallery-background" draggable={false} />
      {show && (
        <>
          <button
            className={`clickable-item${galleryWall.animation ? ` ${galleryWall.animation}` : ''}`}
            style={{
              left: galleryWall.location.x,
              top: galleryWall.location.y,
              width: galleryWall.width,
              height: galleryWall.height,
              ...galleryWall.style,
              transition: 'all 1s ease-out',
              transform: showItems ? undefined : 'translateX(50vw)',
              opacity: showItems ? 1 : 0,
            }}
            type="button"
            onClick={() => setContentKey(galleryWall.contentKey || galleryWall.id)}
          >
            <img className="clickable-item-image" src={galleryWall.image} alt={galleryWall.id} />
          </button>
          <div className={showItems ? 'gallery-items' : 'gallery-items hide-top'}>
            {assets.gallery.map((v, index) => v.id !== 'galleryWall' && (
              <button
                key={`clickable_${v.id}`}
                className={`clickable-item${v.animation ? ` ${v.animation}` : ''}`}
                style={{
                  left: v.location.x,
                  top: v.location.y,
                  width: v.width,
                  height: v.height,
                  animationDelay: v.animation ? `${randomNumbers[index] * 5}s` : undefined,
                  ...v.style,
                }}
                type="button"
                onClick={() => setContentKey(v.contentKey || v.id)}
              >
                <img className="clickable-item-image" src={v.image} alt={v.id} />
                {!!v.children && v.children}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Gallery;
