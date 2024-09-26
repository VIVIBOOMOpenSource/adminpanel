import React from 'react';
import { ReactComponent as CloseSVG } from 'src/css/imgs/icon-close.svg';

import { info } from '../data';
import ProjectSection from './project-section';

function InfoSidebar({
  isPublic, show, contentKey, handleClose, children,
}) {
  return (
    <div className="sidebar-container">
      <button type="button" className={`sidebar-backdrop${show ? ' show-backdrop' : ' '}`} onClick={handleClose} />
      <div className={`sidebar-content-container${show ? ' show' : ' '}`}>
        <div className="sidebar-scroll">
          {children || (
            <>
              <div className="sidebar-title">{info[contentKey]?.title || ''}</div>
              {!!info[contentKey]?.subtitle && <div className="sidebar-subtitle">{info[contentKey]?.subtitle || ''}</div>}
              {info[contentKey]?.contents?.map((text, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={`${contentKey}-content_${index}`} className="sidebar-desc">{text}</div>
              ))}
              {info[contentKey]?.videoUrls?.map((url, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={`${contentKey}-video_${index}`} className="sidebar-video">
                  <iframe
                    src={`${url}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
              {!isPublic && info[contentKey]?.projectIds?.map((projectId) => (
                // eslint-disable-next-line react/no-array-index-key
                <ProjectSection key={`${contentKey}-project_${projectId}`} projectId={projectId} />
              ))}
              {info[contentKey]?.images?.map((url, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={`${contentKey}-image_${index}`} className="sidebar-image">
                  <img className="sidebar-image" src={url} alt={contentKey} />
                </div>
              ))}
              {!!info[contentKey]?.link && <button className="sidebar-button" type="button" onClick={() => window.open(info[contentKey].link)}>Find Out More</button>}
            </>
          )}
        </div>
        <button type="button" onClick={handleClose} className="sidebar-close-button">
          <CloseSVG />
        </button>
      </div>
    </div>
  );
}

export default InfoSidebar;
