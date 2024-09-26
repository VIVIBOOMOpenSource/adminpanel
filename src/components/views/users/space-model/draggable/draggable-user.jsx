import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import Draggable from 'react-draggable';
import MyImage from 'src/components/common/MyImage';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Visitor from 'src/css/imgs/profile/visitor.png';
import DefaultProfilePicture from 'src/css/imgs/profile/default-profile-picture.png';

import './draggable-user.scss';
import AttendanceApi from 'src/apis/viviboom/AttendanceApi';
import { canvasHeight, canvasWidth } from '../data';

const DEFAULT_PROFILE_IMAGE_SIZE = 64;
const threshold = 10;

const getDefaultPosition = () => {
  const w = 0.5 * Math.random() * canvasWidth + 0.2 * canvasWidth;
  return { x: (w * Math.sqrt(3)) / 2, y: 0.35 * canvasHeight + 0.5 * w };
};

function DraggableUser({
  zoom, attendance, handleDraggableUserClick,
}) {
  const nodeRef = useRef(null);
  const loggedInUser = useSelector((state) => state.user);

  const defaultPosition = attendance?.xPosition && attendance?.yPosition ? {
    x: attendance?.xPosition,
    y: attendance?.yPosition,
  } : getDefaultPosition();

  const [position, setPosition] = useState(defaultPosition);

  const startPosition = useRef();

  const saveAttendance = useCallback(async (p) => {
    try {
      const requestParams = {
        authToken: loggedInUser?.authToken,
        attendanceId: attendance?.id,
        xPosition: p.x,
        yPosition: p.y,
      };

      await AttendanceApi.patch(requestParams);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  }, [loggedInUser?.authToken, attendance?.id]);

  const handleStart = (_, dragElement) => {
    startPosition.current = { x: dragElement.x / zoom, y: dragElement.y / zoom };
  };

  const handleStop = (_, dragElement) => {
    const p = { x: dragElement.x / zoom, y: dragElement.y / zoom };
    if (!!startPosition.current && Math.abs(p.x - startPosition.current.x) + Math.abs(p.y - startPosition.current.y) < threshold) {
      handleDraggableUserClick();
    } else {
      saveAttendance(p);
    }
    setPosition(p);
  };

  const dragPosition = useMemo(() => ({
    x: position.x * zoom,
    y: position.y * zoom,
  }), [position, zoom]);

  return (
    <Draggable nodeRef={nodeRef} onStart={handleStart} onStop={handleStop} position={dragPosition} bounds="parent">
      <div ref={nodeRef} className="draggable-user draggable-cancel">
        <div className="user-content">
          <div className="user-image">
            {attendance.userId ? (
              <MyImage
                src={attendance?.user?.profileImageUri}
                alt="profile"
                defaultImage={DefaultProfilePicture}
                width={DEFAULT_PROFILE_IMAGE_SIZE}
              />
            ) : <img className="visitor-image" alt="visitor" src={Visitor} />}
          </div>
        </div>
        <div className="user-name">{ attendance?.visitorName || attendance?.user?.givenName }</div>
      </div>
    </Draggable>
  );
}

export default DraggableUser;
