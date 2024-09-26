import { Player } from '@lottiefiles/react-lottie-player';
import React, {
  useState, useCallback, useEffect, useRef, useMemo,
} from 'react';
import Draggable from 'react-draggable';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { toast } from 'react-toastify';

import './kampong-eunos.scss';
import AttendanceApi from 'src/apis/viviboom/AttendanceApi';
import background from 'src/css/imgs/kampong_eunos/background.svg';
import useInterval from 'src/utils/useInterval';
import DraggableUser from './draggable/draggable-user';
import ProfileModal from './draggable/profile-modal';
import {
  assets, canvasHeight, canvasWidth, defaultPosition, defaultZoom, deviceHeight, deviceWidth, getDraggableBounds, showAnimation, staticAssets, toastOption, zoomMax, zoomMin, zoomStep,
} from './data';
import SensorReadingSection from './sidebar/sensor-section';
import SensorModal from './sidebar/sensor-data-modal';
import PlayerBar from './hud/player-bar';
import Floors from './floors';
import ZoomBar from './hud/zoom-bar';

const pollingDuration = 30 * 1000;
const threshold = 40;

function KampongEunos({
  show, setPage, setContentKey, outdoorEnvReadings, doorSensorReadings, isPublic,
}) {
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);
  const nodeRef = useRef(null);
  const [isLoading, setIsLoading] = useState();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [doorLockReading, setDoorLockReading] = useState('unknown');

  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [attendances, setAttendances] = useState([]);

  const [selectedSensorReading, setSelectedSensorReading] = useState();
  const [selectedSensorMetric, setSelectedSensorMetric] = useState();

  const [isDragging, setIsDragging] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState(defaultPosition);

  const [zoom, setZoom] = useState(defaultZoom);

  const position = useRef();
  const isScaling = useRef(false);
  const touchDistance = useRef(0);

  const handleStart = (_, dragElement) => {
    position.current = { x: dragElement.x, y: dragElement.y };
    setIsDragging(true);
  };

  const handleDragStop = (_, dragElement) => {
    setCanvasPosition({ x: dragElement.x / zoom, y: dragElement.y / zoom });

    if (!!position.current && Math.abs(dragElement.x - position.current.x) + Math.abs(dragElement.y - position.current.y) < threshold) {
      setIsDragging(false);
    } else {
      setTimeout(() => setIsDragging(false), 0);
    }
  };

  const handleRoomClick = (contentKey) => () => {
    if (!isDragging) setPage(contentKey);
  };

  const handleItemClick = (contentKey) => () => {
    if (!isDragging) setContentKey(contentKey);
  };

  const handleSensorModalClose = () => {
    setSelectedSensorMetric();
    setSelectedSensorReading();
    setShowSensorModal(false);
  };

  const defaultZoomOrigin = { x: deviceWidth / 2, y: deviceHeight / 2 };

  const handleZoomChange = (z, zoomOrigin = defaultZoomOrigin) => {
    setCanvasPosition({
      x: canvasPosition.x - zoomOrigin.x / zoom + zoomOrigin.x / z,
      y: canvasPosition.y - zoomOrigin.y / zoom + zoomOrigin.y / z,
    });
    setZoom(z);
  };

  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      if (zoom > zoomMin) handleZoomChange(zoom - zoomStep, { x: event.clientX, y: event.clientY });
    } else if (zoom < zoomMax) handleZoomChange(zoom + zoomStep, { x: event.clientX, y: event.clientY });
  };

  // pinch zoom handler
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      isScaling.current = true;
      touchDistance.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (isScaling.current) {
      const curDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (curDistance > 1.05 * touchDistance.current && zoom < zoomMax) handleZoomChange(zoom + zoomStep, { x: e.touches[0].clientX, y: e.touches[0].clientY });
      else if (1.05 * curDistance < touchDistance.current && zoom > zoomMin) handleZoomChange(zoom - zoomStep, { x: e.touches[0].clientX, y: e.touches[0].clientY });
      touchDistance.current = curDistance;
    }
  };

  const handleTouchEnd = () => {
    if (isScaling.current) {
      isScaling.current = false;
      touchDistance.current = 0;
    }
  };

  const getAttendanceList = useCallback(async () => {
    if (isPublic) return;
    setIsLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser?.authToken,
        branchId: branch?.id,
        checkInAfter: DateTime.local().startOf('day').toISO(),
        checkInBefore: DateTime.local().endOf('day').toISO(),
        isYetToCheckOut: true,
      };
      const res = await AttendanceApi.getList(requestParams);
      setAttendances(res.data.attendances);
      const recentAttendances = res.data.attendances?.filter((a) => DateTime.fromISO(a.checkInAt) > DateTime.now().minus({ millisecond: pollingDuration }));
      recentAttendances.forEach((a, index) => setTimeout(() => toast.info(a.user ? `Vivinaut ${a.user.name} just checked in!` : `Visitor ${a.visitorName} is in the space!`, toastOption), index * 3000));
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setIsLoading(false);
  }, [branch?.id, isPublic, loggedInUser?.authToken]);

  useEffect(() => {
    getAttendanceList();
  }, [getAttendanceList]);

  useEffect(() => {
    doorSensorReadings?.forEach((v) => {
      if (v.metric === 'door') setDoorLockReading(v.door.open ? 'open' : 'closed');
    });
  }, [doorSensorReadings]);

  useInterval(getAttendanceList, pollingDuration);

  const mapPosition = useMemo(() => {
    const bounds = getDraggableBounds(zoom);
    return { x: Math.max(Math.min(canvasPosition.x * zoom, bounds.right), bounds.left), y: Math.max(Math.min(canvasPosition.y * zoom, bounds.bottom), bounds.top) };
  }, [canvasPosition, zoom]);

  return (
    <>
      <Draggable
        nodeRef={nodeRef}
        bounds={getDraggableBounds(zoom)}
        onStart={handleStart}
        onStop={handleDragStop}
        cancel=".draggable-cancel"
        position={mapPosition}
      >
        <div
          ref={nodeRef}
          className={`kampong-eunos-container ${show ? '' : 'hide'}`}
          style={{ width: zoom * canvasWidth, height: zoom * canvasHeight }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img src={background} alt="kampong-eunos" className="kampong-eunos-background" draggable={false} />

          {staticAssets.kampongEunos.map((v) => (
            <div
              key={`static-item_${v.id}`}
              className={v.animation && showAnimation ? `static-item ${v.animation}` : 'static-item'}
              style={{
                left: zoom * v.location.x, top: zoom * v.location.y, width: zoom * v.width, height: zoom * v.height,
              }}
            >
              {!!v.image && <img className="static-item-image" src={v.image} alt={v.id} />}
              {!!v.lottie && (
                <Player
                  autoplay={showAnimation}
                  loop
                  src={v.lottie}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </div>
          ))}
          <Floors zoom={zoom} isDragging={isDragging} handleItemClick={handleItemClick} handleRoomClick={handleRoomClick} />
          {attendances.map((v) => (
            <DraggableUser key={`draggable-user_${v.id}`} zoom={zoom} attendance={v} handleDraggableUserClick={() => { setShowUserModal(true); setSelectedAttendance(v); }} />
          ))}
          {assets.kampongEunos.map((v) => (
            <button
              key={`clickable_${v.id}`}
              className={v.animation && showAnimation ? `clickable-item ${v.animation}` : 'clickable-item'}
              style={{
                left: zoom * v.location.x, top: zoom * v.location.y, width: zoom * v.width, height: zoom * v.height, ...v.style,
              }}
              type="button"
              onClick={handleItemClick(v.contentKey || v.id)}
              onTouchEnd={handleItemClick(v.contentKey || v.id)}
            >
              <img className="clickable-item-image" src={v.image} alt={v.id} />
            </button>
          ))}
        </div>
      </Draggable>
      {!isPublic && (
        <div>
          <SensorReadingSection envReadings={outdoorEnvReadings} setShowSensorModal={setShowSensorModal} setSelectedSensorReading={setSelectedSensorReading} setSelectedSensorMetric={setSelectedSensorMetric} />
          <ProfileModal show={showUserModal} attendance={selectedAttendance} handleClose={() => { setShowUserModal(false); setSelectedAttendance(null); }} />
          <SensorModal show={showSensorModal} selectedSensorReading={selectedSensorReading} selectedSensorMetric={selectedSensorMetric} handleClose={() => handleSensorModalClose()} />
          <PlayerBar attendances={attendances} handleAttendanceClick={(v) => { setShowUserModal(true); setSelectedAttendance(v); }} />
        </div>
      )}
      {show && <ZoomBar zoom={zoom} handleZoomChange={handleZoomChange} />}
    </>
  );
}

export default KampongEunos;
