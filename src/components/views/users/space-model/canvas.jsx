import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import './canvas.scss';

import MerakiApi from 'src/apis/viviboom/MerakiApi';
import { ReactComponent as BackArrowSVG } from 'src/css/imgs/icon-chevron-down.svg';

import useInterval from 'src/utils/useInterval';
import { toast } from 'react-toastify';
import KampongEunos from './kampong-eunos';
import TinkeringStudio from './tinkering-studio';
import Gallery from './gallery';
import Pantry from './pantry';
import InfoSidebar from './sidebar/info-sidebar';
import { toastOption } from './data';

const CISCO_ORGANISATION_ID = '649081296294778801';

const DOOR_SERIAL_NUMBER = 'Q3CC-ZB9A-CDEN';
const OUTDOOR_SENSOR_SERIAL_NUMBER = 'Q3CG-F67E-PRDH';
const INDOOR_SENSOR_SERIAL_NUMBER = 'Q3CG-2UPJ-PFFC';

const pollingDuration = 30 * 1000;

function MainSpaceModel() {
  const { t } = useTranslation('translation');
  const loggedInUser = useSelector((state) => state.user);
  const history = useHistory();

  const isPublic = !loggedInUser?.authToken;

  const [page, setPage] = useState('kampongEunos');
  const [contentKey, setContentKey] = useState('');

  const [doorSensorReadings, setDoorSensorReadings] = useState();
  const [outdoorEnvReadings, setOutdoorSensorReadings] = useState();
  const [indoorEnvReadings, setIndoorEnvReadings] = useState();

  const getSensorReadings = useCallback(async () => {
    if (isPublic) return;
    try {
      const res = await MerakiApi.getSensorReadings({ authToken: loggedInUser?.authToken, organisationId: CISCO_ORGANISATION_ID });
      const tempDoorSensorReadings = res.data?.sensorReadings.find((v) => v.serial === DOOR_SERIAL_NUMBER);
      const tempOutdoorSensorReadings = res.data?.sensorReadings.find((v) => v.serial === OUTDOOR_SENSOR_SERIAL_NUMBER);
      const tempIndoorSensorReadings = res.data?.sensorReadings.find((v) => v.serial === INDOOR_SENSOR_SERIAL_NUMBER);

      if (tempOutdoorSensorReadings?.readings?.temperature?.celcius > 30 && outdoorEnvReadings?.temperature?.celcius < 30) {
        toast.info('Temperature level has risen beyond comfortable level', toastOption);
      }
      if (tempOutdoorSensorReadings?.readings?.temperature?.celcius < 30 && outdoorEnvReadings?.temperature?.celcius > 30) {
        toast.info('Temperature level has reached comfortable level', toastOption);
      }
      if (tempOutdoorSensorReadings?.readings?.noise?.ambient?.level > 50 && outdoorEnvReadings?.noise?.ambient?.level < 50) {
        toast.info('Noise level has risen beyond comfortable level', toastOption);
      }
      if (tempOutdoorSensorReadings?.readings?.noise?.ambient?.level < 50 && outdoorEnvReadings?.noise?.ambient?.level > 50) {
        toast.info('Noise level has reached comfortable level', toastOption);
      }
      if (tempOutdoorSensorReadings?.readings?.humidity?.relativePercentage > 60 && outdoorEnvReadings?.humidity.relativePercentage < 60) {
        toast.info('Humidity has risen beyond comfortable level', toastOption);
      }
      if (tempOutdoorSensorReadings?.readings?.humidity?.relativePercentage < 60 && outdoorEnvReadings?.humidity.relativePercentage > 60) {
        toast.info('Humidity has decreased to comfortable level', toastOption);
      }

      if (page !== 'kampongEunos') {
        if (tempIndoorSensorReadings?.readings?.temperature?.celcius > 30 && indoorEnvReadings?.temperature?.celcius < 30) {
          toast.info('Temperature level has risen beyond comfortable level', toastOption);
        }
        if (tempIndoorSensorReadings?.readings?.temperature?.celcius < 30 && indoorEnvReadings?.temperature?.celcius > 30) {
          toast.info('Temperature level has reached comfortable level', toastOption);
        }
        if (tempIndoorSensorReadings?.readings?.noise?.ambient?.level > 50 && indoorEnvReadings?.noise?.ambient?.level < 50) {
          toast.info('Noise level has risen beyond comfortable level', toastOption);
        }
        if (tempIndoorSensorReadings?.readings?.noise?.ambient?.level < 50 && indoorEnvReadings?.noise?.ambient?.level > 50) {
          toast.info('Noise level has reached comfortable level', toastOption);
        }
        if (tempIndoorSensorReadings?.readings?.humidity?.relativePercentage > 60 && indoorEnvReadings?.humidity?.relativePercentage < 60) {
          toast.info('Humidity has risen beyond comfortable level', toastOption);
        }
        if (tempIndoorSensorReadings?.readings?.humidity?.relativePercentage < 60 && indoorEnvReadings?.humidity?.relativePercentage > 60) {
          toast.info('Humidity has decreased to comfortable level', toastOption);
        }
      }

      setDoorSensorReadings(tempDoorSensorReadings?.readings);
      setOutdoorSensorReadings(tempOutdoorSensorReadings?.readings);
      setIndoorEnvReadings(tempIndoorSensorReadings?.readings);
    } catch (error) {
      console.log(error);
    }
  }, [indoorEnvReadings?.humidity?.relativePercentage, indoorEnvReadings?.noise?.ambient?.level, indoorEnvReadings?.temperature?.celcius, isPublic, loggedInUser?.authToken, outdoorEnvReadings?.humidity?.relativePercentage, outdoorEnvReadings?.noise?.ambient?.level, outdoorEnvReadings?.temperature?.celcius, page]);

  useEffect(() => {
    getSensorReadings();
  }, [isPublic, loggedInUser?.authToken]);

  useInterval(getSensorReadings, pollingDuration);

  if (!isPublic && loggedInUser.branchId !== 1) {
    return <h4>This space model is for Vivistop Kampong Eunos only.</h4>;
  }

  return (
    <div className="canvas-container">
      <KampongEunos show={page === 'kampongEunos'} setPage={setPage} setContentKey={setContentKey} outdoorEnvReadings={outdoorEnvReadings} doorSensorReadings={doorSensorReadings} isPublic={isPublic} />
      <TinkeringStudio show={page === 'tinkeringStudio'} setContentKey={setContentKey} indoorEnvReadings={indoorEnvReadings} isPublic={isPublic} />
      <Gallery show={page === 'gallery'} setContentKey={setContentKey} />
      <Pantry show={page === 'pantry'} setContentKey={setContentKey} />
      {!isPublic && (
        <button className="check-in-button" type="button" onClick={() => history.push('/checkincheckout')}>
          {t('Check in to the space here!')}
        </button>
      )}
      {page !== 'kampongEunos' && (
        <button type="button" className="back-home-button" onClick={() => setPage('kampongEunos')}>
          <div className="back-home-text">{t('Back to main')}</div>
          <BackArrowSVG className="back-home-logo" />
        </button>
      )}

      <InfoSidebar isPublic={isPublic} show={!!contentKey} contentKey={contentKey} handleClose={() => setContentKey('')} />
    </div>
  );
}

export default MainSpaceModel;
