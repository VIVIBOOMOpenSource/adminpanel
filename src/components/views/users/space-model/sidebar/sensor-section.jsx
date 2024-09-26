import React, { useState, useEffect } from 'react';

import './sensor-section.scss';
import { Player } from '@lottiefiles/react-lottie-player';
import lowNoiseAnim from 'src/css/lotties/low_sound.json';
import highNoiseAnim from 'src/css/lotties/high_sound.json';
import hotTempAnim from 'src/css/lotties/hot_temp.json';
import coolingTempAnim from 'src/css/lotties/cooling_temp.json';
import highHumidityAnim from 'src/css/lotties/high_humidity.json';
import lowHumidityAnim from 'src/css/lotties/low_humidity.json';

function SensorReadingSection({ envReadings, setShowSensorModal, setSelectedSensorReading, setSelectedSensorMetric }) {
  const [noiseReading, setNoiseReading] = useState(0);
  const [temperatureReading, setTemperatureReading] = useState(0);
  const [humidityReading, setHumidityReading] = useState(0);

  useEffect(() => {
    envReadings?.forEach((v) => {
      if (v.metric === 'noise') setNoiseReading(v?.noise.ambient.level);
      else if (v.metric === 'temperature') setTemperatureReading(v?.temperature?.celsius);
      else if (v.metric === 'humidity') setHumidityReading(v?.humidity.relativePercentage);
    });
  }, [envReadings]);

  return (
    <div className="sensor-container">
      <div className="sensor-data-container" onClick={() => { setShowSensorModal(true); setSelectedSensorReading(noiseReading); setSelectedSensorMetric('noise') }}>
        <div className="sensor-value-container">
          <div className="sensor-value-title">Noise Level</div>
          <div className="sensor-value">{`${Math.round(noiseReading)} dBA`}</div>
        </div>
        <Player
          autoplay
          loop
          src={noiseReading > 50 ? highNoiseAnim : lowNoiseAnim}
          style={{ height: '80px', width: '80px' }}
        />
      </div>
      <div className="sensor-data-container" onClick={() => { setShowSensorModal(true); setSelectedSensorReading(temperatureReading); setSelectedSensorMetric('temperature') }}>
        <div className="sensor-value-container">
          <div className="sensor-value-title">Temperature</div>
          <div className="sensor-value">{`${Math.round(temperatureReading)}°C`}</div>
        </div>
        <Player
          autoplay
          loop
          src={temperatureReading > 30 ? hotTempAnim : coolingTempAnim}
          style={{ height: '80px', width: '80px' }}
        />
      </div>
      <div className="sensor-data-container" onClick={() => { setShowSensorModal(true); setSelectedSensorReading(humidityReading); setSelectedSensorMetric('humidity') }}>
        <div className="sensor-value-container">
          <div className="sensor-value-title">Humidity</div>
          <div className="sensor-value">{`${Math.round(humidityReading)}%`}</div>
        </div>
        <Player
          autoplay
          loop
          src={humidityReading > 60 ? highHumidityAnim : lowHumidityAnim}
          style={{ height: '80px', width: '80px' }}
        />
      </div>
    </div>
  );
}

export default SensorReadingSection;
