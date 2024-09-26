import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import './sensor-data-modal.scss';
import Modal from 'src/components/common/modal/modal';
import { useSelector } from 'react-redux';
import lowNoiseAnim from 'src/css/lotties/low_sound.json';
import highNoiseAnim from 'src/css/lotties/high_sound.json';
import hotTempAnim from 'src/css/lotties/hot_temp.json';
import coolingTempAnim from 'src/css/lotties/cooling_temp.json';
import highHumidityAnim from 'src/css/lotties/high_humidity.json';
import lowHumidityAnim from 'src/css/lotties/low_humidity.json';
import { Player } from '@lottiefiles/react-lottie-player';

function SensorModal({
  show, selectedSensorReading, selectedSensorMetric, handleClose,
}) {
  const { t } = useTranslation('translation');
  const user = useSelector((state) => state?.user);
  const [animation, setAnimation] = useState();
  const [description, setDescription] = useState();
  const [readingDataText, setReadingDataText] = useState();

  const handleModalClose = () => {
    setAnimation();
    setDescription();
    setReadingDataText();
    handleClose();
  };

  useEffect(() => {
    if (selectedSensorMetric === 'noise') {
      setAnimation(selectedSensorReading > 50 ? highNoiseAnim : lowNoiseAnim);
      setReadingDataText(`Noise Level: ${Math.round(selectedSensorReading)} dBA`);
      setDescription(selectedSensorReading > 50 ? 'Looks like a lot of fun things are happening around here! Head off to our cocoon corner if you need some space to unwind!' : 'Everyone seems to be working well together!');
    } else if (selectedSensorMetric === 'temperature') {
      setAnimation(selectedSensorReading > 30 ? hotTempAnim : coolingTempAnim);
      setReadingDataText(`Temperature: ${Math.round(selectedSensorReading)}°C`);
      setDescription(selectedSensorReading > 30 ? "It's a hot day today! Please remember to drink lots of water and stay indoors" : "Seems like a pleasant day! Let's try to do something under the sun!");
    } else if (selectedSensorMetric === 'humidity') {
      setAnimation(selectedSensorReading > 60 ? highHumidityAnim : lowHumidityAnim);
      setReadingDataText(`Humidity: ${Math.round(selectedSensorReading)}%`);
      setDescription(selectedSensorReading > 60 ? 'It seems like a fairly humid day! In case you are not feeling well, please stay in the air conditioned rooms and drink lots of water!' : 'Humidity seems to be rather low now!');
    }
  }, [selectedSensorMetric, selectedSensorReading]);

  return (
    <Modal className="sensor-data-modal" show={show} handleClose={handleModalClose}>
      <div className="sensor-data-container">
        <Player
          autoplay
          loop
          src={animation}
          style={{ height: '250px', width: '250px' }}
        />
        <div className="reading-data-text">{description}</div>
        <div className="description">{readingDataText}</div>
      </div>
    </Modal>
  );
}

export default SensorModal;
