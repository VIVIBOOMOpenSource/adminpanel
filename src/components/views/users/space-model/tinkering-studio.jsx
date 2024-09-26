import React, { useEffect, useState } from 'react';

import background from 'src/css/imgs/kampong_eunos/tinkering-studio.svg';
import './tinkering-studio.scss';

import {
  assets, deviceHeight, deviceWidth, roomCanvasHeight, roomCanvasWidth,
} from './data';
import SensorReadingSection from './sidebar/sensor-section';
import SensorModal from './sidebar/sensor-data-modal';

function TinkeringStudio({
  show, setContentKey, indoorEnvReadings, isPublic,
}) {
  const [selectedSensorReading, setSelectedSensorReading] = useState();
  const [selectedSensorMetric, setSelectedSensorMetric] = useState();
  const [showSensorModal, setShowSensorModal] = useState(false);

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
      className={`tinkering-studio-container ${show ? '' : 'hide'}`}
      style={{
        width: roomCanvasWidth, height: roomCanvasHeight, left: (deviceWidth - roomCanvasWidth) / 2, top: (deviceHeight - roomCanvasHeight) / 2,
      }}
    >
      <img src={background} alt="tinkering-studio" className="tinkering-studio-background" draggable={false} />
      {!isPublic && <SensorReadingSection envReadings={indoorEnvReadings} setShowSensorModal={setShowSensorModal} setSelectedSensorReading={setSelectedSensorReading} setSelectedSensorMetric={setSelectedSensorMetric} />}

      {assets.tinkeringStudio.map((v) => (
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
        </button>
      ))}
      {!isPublic && <SensorModal show={showSensorModal} selectedSensorReading={selectedSensorReading} selectedSensorMetric={selectedSensorMetric} handleClose={() => setShowSensorModal(false)} />}
    </div>
  );
}

export default TinkeringStudio;
