import React from 'react';
import { useSelector } from 'react-redux';

import './workshop-item.scss';

import MyImage from 'src/components/common/MyImage';
import DefaultWorkshopPicture from 'src/css/imgs/kampong_eunos/default-workshop.png';

const DEFAULT_WORKSHOP_IMAGE_SIZE = 512;

function WorkshopItem({ eventSession }) {
  const user = useSelector((state) => state?.user);

  return (
    <div className="workshop-item">
      <div className="workshop-item-content-container">
        <div className="workshop-image">
          {user.authToken ? (
            <MyImage alt="workshop" src={eventSession?.image} defaultImage={DefaultWorkshopPicture} width={DEFAULT_WORKSHOP_IMAGE_SIZE} />
          ) : (
            <img
              className="image"
              alt="workshop"
              src={eventSession?.imageUri || DefaultWorkshopPicture}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = DefaultWorkshopPicture;
              }}
              width={DEFAULT_WORKSHOP_IMAGE_SIZE}
            />
          )}
        </div>
        <div className="text-container">
          <div className="title">{eventSession?.name}</div>
          <div className="duration">
            <div>{eventSession?.location}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkshopItem;
