import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './profile-modal.scss';

import Modal from 'src/components/common/modal/modal';
import MyImage from 'src/components/common/MyImage';
import DefaultProfileCover from 'src/css/imgs/profile/default-profile-cover.png';
import DefaultProfilePicture from 'src/css/imgs/profile/default-profile-picture.png';
import DefaultProjectPicture from 'src/css/imgs/profile/default-project-picture.png';
import DefaultBadgePicture from 'src/css/imgs/placeholder-square-s.jpeg';
import Visitor from 'src/css/imgs/profile/visitor.png';
import Explorer from 'src/css/imgs/profile/explorer.png';
import Vivinaut from 'src/css/imgs/profile/vivinaut.png';
import { useSelector } from 'react-redux';
import UserApi from 'src/apis/viviboom/UserApi';
import { toast } from 'react-toastify';
import { ProjectOrderType } from 'src/enums/ProjectOrderType';
import ProjectApi from 'src/apis/viviboom/ProjectApi';
import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import BadgeApi from 'src/apis/viviboom/BadgeApi';
import ChallengeApi from 'src/apis/viviboom/ChallengeApi';
import { getCountryFlag } from 'src/data/countries';
import { DateTime } from 'luxon';
import ChallengeItem from './challenge-item';

const DEFAULT_PROJECT_LIMIT = 4;
const DEFAULT_BADGE_LIMIT = 10;
const DEFAULT_CHALLENGE_LIMIT = 4;

const DEFAULT_COVER_IMAGE_SIZE = 512;
const DEFAULT_PROFILE_IMAGE_SIZE = 256;
const DEFAULT_BADGE_IMAGE_SIZE = 256;
const DEFAULT_PROJECT_IMAGE_SIZE = 512;

function ProfileModal({
  show, attendance, handleClose,
}) {
  const { t } = useTranslation('translation');
  const user = useSelector((state) => state?.user);

  const [member, setMember] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [wipProjects, setWipProjects] = useState([]);

  const [badgeCount, setBadgeCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [completedProjectCount, setCompletedProjectCount] = useState(0);
  const [wipProjectCount, setWipProjectCount] = useState(0);

  // API calls
  const fetchMember = useCallback(async () => {
    if (!user?.authToken || !attendance?.userId) return;
    setLoading(true);
    setMember(null);
    const requestParams = {
      authToken: user.authToken,
      userId: attendance.userId,
    };

    try {
      const res = await UserApi.get(requestParams);
      setMember(res.data?.user);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, attendance?.userId]);

  const fetchProjects = useCallback(async () => {
    if (!user?.authToken || !attendance?.userId) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_PROJECT_LIMIT,
      order: ProjectOrderType.LATEST,
      authorUserId: attendance.userId,
      isPublished: true,
      isCompleted: true,
    };

    setLoading(true);
    try {
      const res = await ProjectApi.getList(requestParams);
      setProjects(res.data?.projects);
      setCompletedProjectCount(res.data?.count);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, attendance?.userId]);

  const fetchWipProjects = useCallback(async () => {
    if (!user?.authToken || !attendance?.userId) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_PROJECT_LIMIT,
      order: ProjectOrderType.LATEST,
      authorUserId: attendance.userId,
      isPublished: true,
      isCompleted: false,
    };
    setLoading(true);
    try {
      const res = await ProjectApi.getList(requestParams);
      setWipProjects(res.data?.projects);
      setWipProjectCount(res.data?.count);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, attendance?.userId]);

  const fetchBadges = useCallback(async () => {
    if (!user?.authToken || !attendance?.userId) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_BADGE_LIMIT,
      order: BadgeOrderType.LATEST,
      awardedUserId: attendance.userId,
    };
    setLoading(true);
    try {
      const res = await BadgeApi.getList(requestParams);
      setBadges(res.data?.badges);
      setBadgeCount(res.data?.count);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, attendance?.userId]);

  const fetchChallenges = useCallback(async () => {
    if (!user?.authToken || !attendance?.userId) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_CHALLENGE_LIMIT,
      order: BadgeOrderType.LATEST,
      awardedUserId: attendance.userId,
      verboseAttributes: ['awardedUsers'],
    };
    setLoading(true);
    try {
      const res = await ChallengeApi.getList(requestParams);
      setChallenges(res.data?.challenges);
      setChallengeCount(res.data?.count);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, attendance?.userId]);

  const handleModalClose = () => {
    handleClose();
    setMember(null);
    setLoading(false);
    setBadges([]);
    setChallenges([]);
    setProjects([]);
    setWipProjects([]);
    setBadgeCount(0);
    setChallengeCount(0);
    setCompletedProjectCount(0);
    setWipProjectCount(0);
  };

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchWipProjects();
  }, [fetchWipProjects]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <Modal className="profile-modal" show={show} handleClose={handleModalClose}>
      <div className="profile-content-container">
        <div className="profile-info-banner">
          <div className="user-cover-image">
            <MyImage
              src={member?.coverImageUri}
              alt="cover"
              defaultImage={DefaultProfileCover}
              width={DEFAULT_COVER_IMAGE_SIZE}
              isLoading={isLoading}
            />
          </div>
          {!isLoading && (
            <>
              <div className="user-profile-basic-info">
                <div className="user-profile-image-name-container">
                  <div className="user-profile-image-container">
                    {member ? (
                      <div className="user-profile-image">
                        <MyImage
                          src={member?.profileImageUri}
                          alt="profile"
                          defaultImage={DefaultProfilePicture}
                          width={DEFAULT_PROFILE_IMAGE_SIZE}
                          isLoading={isLoading}
                        />
                      </div>
                    ) : (
                      <img className="visitor-image" alt="visitor" src={Visitor} />
                    )}
                    {!!member && <img className="user-profile-country" alt="country" src={getCountryFlag(member?.branch?.countryISO)} />}
                  </div>
                </div>
                {!!member && (
                  <div className="user-data">
                    <div className="data-btn">
                      <p className="stat">{badgeCount}</p>
                      <div className="more-button">
                        {t('Badges')}
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="data-btn">
                      <p className="stat">{challengeCount}</p>
                      <div className="more-button">
                        {t('Challenges')}
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="data-btn">
                      <p className="stat">{wipProjectCount + completedProjectCount}</p>
                      <div className="more-button">
                        {t('Projects')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="profile-name-container">
                <div className="user-real-name">{member ? `${member?.givenName} ${member?.familyName}` : attendance?.visitorName}</div>
                <div className="profile-status">{t(member ? member?.status : 'Visitor')}</div>
                {member && (
                  <img className="profile-status-image" alt="status" src={member?.status === 'VIVINAUT' ? Vivinaut : Explorer} />
                )}
              </div>
              {!!member?.description && (
                <div className="profile-description-container">
                  <p className="profile-description">{member?.description}</p>
                </div>
              )}
              <div className="check-in-info-container">
                <div className="check-in-info">
                  {t('Checked in at')}
                  {' '}
                  {attendance ? DateTime.fromISO(attendance.checkInAt).toLocaleString(DateTime.TIME_SIMPLE) : '-'}
                </div>
                <div className="check-in-info">
                  {attendance?.event ? attendance?.event.title : t('Crew Invite')}
                </div>
              </div>
            </>
          )}
        </div>
        {badges?.length > 0 && (
          <div className="profile-section">
            <div className="section-title-container">
              <div className="section-title">{t('Badges')}</div>
              <div className="count">{badgeCount}</div>
            </div>
            <div className="badge-list">
              {badges.map((v) => (
                <div key={`profile_${attendance?.id}-badge_${v.id}`} className="badge-item">
                  <div className="badge-image">
                    <MyImage
                      src={v.imageUri}
                      alt={v.name}
                      defaultImage={DefaultBadgePicture}
                      width={DEFAULT_BADGE_IMAGE_SIZE}
                    />
                  </div>
                  <div className="badge-name">
                    {v.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {projects?.length > 0 && (
          <div className="profile-section">
            <div className="section-title-container">
              <div className="section-title">{t('Completed Projects')}</div>
              <div className="count">{completedProjectCount}</div>
            </div>
            <div className="project-list">
              {projects.map((v) => (
                <div key={`profile_${attendance?.id}-project_${v.id}`} className="project-item">
                  <div className="project-image">
                    <MyImage
                      src={v.thumbnailUri}
                      alt={v.name}
                      defaultImage={DefaultProjectPicture}
                      width={DEFAULT_PROJECT_IMAGE_SIZE}
                    />
                  </div>
                  <div className="project-name">
                    {v.name}
                  </div>
                  {!!v.description && (
                    <div className="project-description">
                      {v.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {challenges?.length > 0 && (
          <div className="profile-section">
            <div className="section-title-container">
              <div className="section-title">{t('Challenges Completed')}</div>
              <div className="count">{challengeCount}</div>
            </div>
            <div className="challenge-list">
              {challenges.map((v) => (
                <div key={`profile_${attendance?.id}-challenge_${v.id}`} className="challenge-item">
                  <ChallengeItem challenge={v} />
                </div>
              ))}
            </div>
          </div>
        )}
        {wipProjects?.length > 0 && (
          <div className="profile-section">
            <div className="section-title-container">
              <div className="section-title">{t('WIP Projects')}</div>
              <div className="count">{wipProjectCount}</div>
            </div>
            <div className="project-list">
              {wipProjects.map((v) => (
                <div key={`profile_${attendance?.id}-wip-project_${v.id}`} className="project-item">
                  <div className="project-image">
                    <MyImage
                      src={v.thumbnailUri}
                      alt={v.name}
                      defaultImage={DefaultProjectPicture}
                      width={DEFAULT_PROJECT_IMAGE_SIZE}
                    />
                  </div>
                  <div className="project-name">
                    {v.name}
                  </div>
                  {!!v.description && (
                    <div className="project-description">
                      {v.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ProfileModal;
