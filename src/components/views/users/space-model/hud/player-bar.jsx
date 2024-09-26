import React, { useRef, useState } from 'react';

import MyImage from 'src/components/common/MyImage';
import Visitor from 'src/css/imgs/profile/visitor.png';
import DefaultProfilePicture from 'src/css/imgs/profile/default-profile-picture.png';
import useOutsideClick from 'src/utils/use-outside-click';

import './player-bar.scss';

const DEFAULT_PROFILE_IMAGE_SIZE = 64;

function PlayerBar({ isLoading, attendances, handleAttendanceClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const playerBarRef = useRef();

  const onAttendanceClick = (attendance) => {
    if (isExpanded) handleAttendanceClick(attendance);
  };

  useOutsideClick(playerBarRef, () => {
    setIsExpanded(false);
  });

  return attendances?.length > 0 && (
    <div className="player-bar-container">
      <div ref={playerBarRef} className="player-bar" onClick={() => setIsExpanded(true)}>
        {attendances?.map((v) => (
          <button type="button" key={`hud-attendnace_${v.id}`} className={`hud-user-content${isExpanded ? ' show' : ''}`} onClick={() => onAttendanceClick(v)}>
            <div className="user-info">
              <div className="user-name">{v?.user?.name || v?.visitorName}</div>
              <div className="user-event">{v?.event?.title || 'Crew Invite'}</div>
            </div>
            <div className="user-image">
              {v.userId ? (
                <MyImage
                  src={v?.user?.profileImageUri}
                  alt="profile"
                  defaultImage={DefaultProfilePicture}
                  width={DEFAULT_PROFILE_IMAGE_SIZE}
                  isLoading={isLoading}
                />
              ) : <img className="visitor-image" alt="visitor" src={Visitor} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlayerBar;
