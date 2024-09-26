import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { isDesktop, isTablet } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import MyImage from 'src/components/common/MyImage';
import DefaultBadgePicture from 'src/css/imgs/placeholder-square-s.jpeg';
import DefaultProfilePicture from 'src/css/imgs/profile/default-profile-picture.png';
import DefaultProjectPicture from 'src/css/imgs/default-project-cover.png';
import PreloadProjectPicture from 'src/css/imgs/project-image-placeholder.png';

import './project-section.scss';
import ProjectApi from 'src/apis/viviboom/ProjectApi';
import { ProjectBadgeStatusType } from 'src/enums/ProjectBadgeStatusType';
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import MyVideo from 'src/components/common/MyVideo';

const DEFAULT_BADGE_IMAGE_SIZE = 256;
const DEFAULT_PROFILE_IMAGE_SIZE = 128;
const DEFAULT_PROJECT_IMAGE_WIDTH = 512;

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

function getEmbedYoutubeLink(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  const videoId = match && match[2].length === 11 ? match[2] : null;

  return `https://youtube.com/embed/${videoId}`;
}

let deviceType = 'desktop';

if (!isDesktop) {
  deviceType = isTablet ? 'tablet' : 'mobile';
}

function ProjectSection({ projectId }) {
  const { t } = useTranslation('translation');
  const user = useSelector((state) => state?.user);

  const [isProjectLoading, setProjectLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [projectBadges, setProjectBadges] = useState([]);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const projectAuthorsCount = project?.authorUsers?.length || 0;

  const fetchProject = useCallback(async () => {
    if (!user?.authToken) return;
    setProjectLoading(true);
    setProject(null);
    try {
      const res = await ProjectApi.get({ authToken: user.authToken, projectId, verboseAttributes: ['badges'] });
      setProject(res.data?.project);

      const fetchedProject = res.data?.project;

      if (fetchedProject.badgeStatus === ProjectBadgeStatusType.AWARDED) setProjectBadges(fetchedProject.badges);
    } catch (err) {
      console.error(err);
    }
    setProjectLoading(false);
  }, [projectId, user.authToken]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    try {
      if (project?.content) setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(project?.content))));
    } catch (err) {
      console.log(err);
    }
  }, [project]);

  const handleChangeSlide = (previousSlide, { currentSlide }) => {
    if (previousSlide < project?.videos?.length) {
      const video = document.getElementById(`project-video_${project?.videos[previousSlide].id}`);
      video.pause();
      video.currentTime = 0;
      if (video.hasAttribute('controls')) video.removeAttribute('controls');
    }
    if (currentSlide < project?.videos?.length) {
      const video = document.getElementById(`project-video_${project?.videos[currentSlide].id}`);
      video.play();
      video.setAttribute('controls', 'controls');
    }
  };

  const mediaCount = (project?.images?.length || 0) + (project?.videos?.length || 0);

  const projectAuthorName = useMemo(() => {
    if (projectAuthorsCount > 1) {
      return [project?.authorUsers?.slice(0, -1).map((u) => u.name).join(', '), project?.authorUsers?.[projectAuthorsCount - 1]?.name].join(` ${t('and')} `);
    }
    return project?.authorUsers?.[0]?.name || '-';
  }, [project?.authorUsers, projectAuthorsCount, t]);

  return (
    <div className="project-section-container">
      <div className="project-header">
        <div className="project-title">
          {project?.authorUsers?.length > 1 ? (
            <div className="project-creators">
              <MyImage
                src={project?.authorUsers?.[1]?.profileImageUri}
                alt="profile"
                defaultImage={DefaultProfilePicture}
                width={DEFAULT_PROFILE_IMAGE_SIZE}
                isLoading={isProjectLoading}
              />
              <MyImage
                src={project?.authorUsers?.[0]?.profileImageUri}
                alt="profile"
                defaultImage={DefaultProfilePicture}
                width={DEFAULT_PROFILE_IMAGE_SIZE}
                isLoading={isProjectLoading}
              />
            </div>
          ) : (
            <div className="profile-image">
              <MyImage
                src={project?.authorUsers?.[0]?.profileImageUri}
                alt="profile"
                defaultImage={DefaultProfilePicture}
                width={DEFAULT_PROFILE_IMAGE_SIZE}
                isLoading={isProjectLoading}
              />
            </div>
          )}
          <div className="titles">
            <p className="title">
              {project?.name || '-'}
              {' '}
              {project?.isCompleted === false && '(Work-In-Progress)'}
            </p>
            <p className="subtitle">
              {t('Created By')}
              :
              {' '}
              {projectAuthorName}
            </p>
            <p className="subtitle">
              {t('Inspired By')}
              :
              {' '}
              {project?.description}
            </p>
          </div>
        </div>
        {projectBadges.length > 0 && (
          <div className="project-badges">
            <ul>
              {projectBadges.slice(0, 2).map((v) => (
                <div key={`proejct-badge_${v.id}`} className="badge-item">
                  <div className="badge-image">
                    <MyImage
                      src={v.imageUri}
                      alt={v.name}
                      defaultImage={DefaultBadgePicture}
                      width={DEFAULT_BADGE_IMAGE_SIZE}
                    />
                  </div>
                </div>
              ))}
            </ul>
            <div className="project-badges-text">{t('Badges Awarded')}</div>
          </div>
        )}
      </div>

      {mediaCount > 0 && (
        <div className="project-image">
          <Carousel
            arrows={mediaCount > 1}
            draggable={false}
            showDots={mediaCount > 1}
            responsive={responsive}
            ssr
            // infinite
            keyBoardControl
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={['tablet', 'mobile']}
            deviceType={deviceType}
            dotListClass="custom-dot-list-style"
            itemClass={mediaCount === 1 ? 'carousel-item-project-media' : ''}
            afterChange={handleChangeSlide}
          >
            {project?.videos?.map((vid, index) => (
              <MyVideo
                key={`project-video_${vid.id}`}
                id={`project-video_${vid.id}`}
                alt="project-video"
                src={vid.uri}
                defaultImage={DefaultProjectPicture}
                params={{ width: DEFAULT_PROJECT_IMAGE_WIDTH }}
                loop
                autoplay={index === 0}
                control={index === 0}
              />
            ))}
            {project?.images?.map((img) => (
              <MyImage
                key={`project-image_${img.id}`}
                alt="project"
                width={DEFAULT_PROJECT_IMAGE_WIDTH}
                src={img?.uri}
                preloadImage={PreloadProjectPicture}
                defaultImage={DefaultProjectPicture}
              />
            ))}
          </Carousel>
        </div>
      )}
      <Editor
        editorState={editorState}
        toolbarClassName="toolbar"
        wrapperClassName="wrapper"
        editorClassName="editor"
        toolbarHidden
        readOnly
        toolbar={{
          embedded: {
            embedCallback: getEmbedYoutubeLink,
          },
        }}
      />
    </div>
  );
}

export default ProjectSection;
