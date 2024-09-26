import React, { useState } from 'react';

import './welcome-modal-content.scss';
import WelcomeImage from 'src/css/imgs/kampong_eunos/welcome.jpg';
import VivistopArtImage from 'src/css/imgs/kampong_eunos/vivistop.png';
import MobileImage from 'src/css/imgs/kampong_eunos/viviboom_mobile.png';
import Config from 'src/config';
import WorkshopItem from './workshop-item';
import eventSessions from './data';

function WelcomeModalContent() {
  const [page, setPage] = useState(1);

  return (
    <div className="welcome-modal-container">
      { page === 1 && (
      <div className="page-content-container">
        <div className="title">Welcome to Vivistop Kampong Eunos!</div>
        <img className="image-container" src={WelcomeImage} alt="" width="500" />
        <div className="welcome-modal-button" onClick={() => setPage(2)}>Next</div>
      </div>
      )}

      {/* VIVIBOOM New Features */}
      { page === 2 && (
        <div className="page-content-container">
          <div className="title">Viviboom Mobile Versions Out!</div>
          <img className="image-container" src={MobileImage} alt="" width="450" />
          <div className="welcome-modal-button" onClick={() => setPage(eventSessions.length > 0 ? 3 : 4)}>Next</div>
        </div>
      )}
      {/* Events for the day */}
      { page === 3 && eventSessions.length > 0 && (
        <div className="page-content-container">
          <div className="title">Checkout what is happening in stop today!</div>
          <div className="workshop-item-container">
            {eventSessions.map((v) => (
              <WorkshopItem
                key={`home-event-${v.id}`}
                eventSession={v}
              />
            ))}
          </div>
          <div className="welcome-modal-button" onClick={() => setPage(4)}>Next</div>
        </div>
      )}

      {/* Final Page */}
      { page === 4 && (
        <div className="page-content-container">
          <div className="title">You are checked in! Have fun!</div>
          <img className="image-container" src={VivistopArtImage} alt="" width="450" />
          <div className="welcome-modal-button">
            <a href={`${Config.Common.AdminFrontEndUrl}/kampongeunos`}>Visualise yourself in the space!</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeModalContent;
