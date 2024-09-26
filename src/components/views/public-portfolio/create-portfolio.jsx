import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './create-portfolio.scss';

import PortfolioApi from 'src/apis/viviboom/PortfolioApi';
import Config from 'src/config';
import About from 'src/css/imgs/icon-about.png';
import { ReactComponent as CloseSVG } from 'src/css/imgs/icon-close.svg';
import PlaceholderCover from 'src/css/imgs/background.jpg';
import PlaceholderProfile from 'src/css/imgs/v-icon.png';
import Header from 'src/css/imgs/viviboom-header.png';
import Button from 'src/components/common/button/button';
import { getBase64 } from '../../../utils/object';
import SelectPortfolioProjects from './select-portfolio-projects';
import SelectPortfolioBadges from './select-portfolio-badges';
import SelectPortfolioEvents from './select-portfolio-events';
import SelectPortfolioUsers from './select-portfolio-users';
import SelectPortfolioChallenges from './select-portfolio-challenges';

function getArrayForUpdate(prevArr, arr) {
  return [
    // order items
    ...arr.filter((item, idx) => idx !== prevArr.findIndex((i) => i.id === item.id)).map((item, idx) => ({ id: item.id, order: idx + 1 })),
    // deleted items
    ...prevArr.filter((item1) => !arr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, isDelete: true })),
  ];
}

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const items = ['About this page', 'Badges', 'Challenges', 'Events', 'Projects', 'Creators', 'Other Settings'];

function CreatePublicPortfolio({ onBack, portfolio, refresh }) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const isCreatePortfolio = !portfolio;

  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState(portfolio?.code || '');
  const [title, setTitle] = useState(portfolio?.title || '');
  const [description, setDescription] = useState(portfolio?.description || '');

  const [profileImageToUpload, setProfileImageToUpload] = useState({ file: null, base64: null });
  const [coverImageToUpload, setCoverImageToUpload] = useState({ file: null, base64: null });

  const [showProjectCountry, setShowProjectCountry] = useState(isCreatePortfolio || !!portfolio?.showProjectCountry);
  const [showUserFullName, setShowUserFullName] = useState(isCreatePortfolio || !!portfolio?.showUserFullName);
  const [showUserProfile, setShowUserProfile] = useState(isCreatePortfolio || !!portfolio?.showUserProfile);

  const [itemKey, setItemKey] = useState('About this page');

  const [headingBadge, setHeadingBadge] = useState(portfolio?.headingBadge || '');
  const [headingChallenge, setHeadingChallenge] = useState(portfolio?.headingChallenge || '');
  const [headingEvent, setHeadingEvent] = useState(portfolio?.headingEvent || '');
  const [headingProject, setHeadingProject] = useState(portfolio?.headingProject || '');
  const [headingUser, setHeadingUser] = useState(portfolio?.headingUser || '');

  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [prevBadges, setPrevBadges] = useState([]);
  const [prevChallenges, setPrevChallenges] = useState([]);
  const [prevEvents, setPrevEvents] = useState([]);
  const [prevProjects, setPrevProjects] = useState([]);
  const [prevUsers, setPrevUsers] = useState([]);

  const savePortfolio = async (isPublished = false) => {
    if (!user?.authToken) return;
    if (!code) {
      toast.error('Please add a unique link for your page');
      return;
    }
    if (isPublished && !title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const requestParams = {
      authToken: user.authToken,
      isPublished,
      title,
      description,
      code,
      showProjectCountry,
      showUserFullName,
      showUserProfile,
      headingBadge,
      headingChallenge,
      headingEvent,
      headingProject,
      headingUser,
    };

    if (isCreatePortfolio) {
      // create
      requestParams.badgeIds = badges.map((v) => v.id);
      requestParams.challengeIds = challenges.map((v) => v.id);
      requestParams.eventIds = events.map((v) => v.id);
      requestParams.projectIds = projects.map((v) => v.id);
      requestParams.userIds = users.map((v) => v.id);

      setLoading(true);
      try {
        const res = await PortfolioApi.post(requestParams);
        const { portfolioId } = res.data;
        if (profileImageToUpload.file) {
          await PortfolioApi.putImage({
            authToken: user.authToken, portfolioId, imageType: 'profile-image', file: profileImageToUpload.file,
          });
        }
        if (coverImageToUpload.file) {
          await PortfolioApi.putImage({
            authToken: user.authToken, portfolioId, imageType: 'cover-image', file: coverImageToUpload.file,
          });
        }
        toast.success(('Changes saved!'));
        onBack();
        refresh();
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
      setLoading(false);
    } else {
      // patch
      requestParams.portfolioId = portfolio.id;
      // get prev arrays
      await PortfolioApi.get({ authToken: user.authToken, portfolioId: portfolio.id });
      requestParams.badges = getArrayForUpdate(prevBadges, badges);
      requestParams.challenges = getArrayForUpdate(prevChallenges, challenges);
      requestParams.events = getArrayForUpdate(prevEvents, events);
      requestParams.projects = getArrayForUpdate(prevProjects, projects);
      requestParams.users = getArrayForUpdate(prevUsers, users);

      setLoading(true);
      try {
        await PortfolioApi.patch(requestParams);
        if (profileImageToUpload.file) {
          await PortfolioApi.putImage({
            authToken: user.authToken, portfolioId: portfolio.id, imageType: 'profile-image', file: profileImageToUpload.file,
          });
        }
        if (coverImageToUpload.file) {
          await PortfolioApi.putImage({
            authToken: user.authToken, portfolioId: portfolio.id, imageType: 'cover-image', file: coverImageToUpload.file,
          });
        }
        toast.success(('Changes saved!'));
        onBack();
        refresh();
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!portfolio) return;
    if (window.confirm('Are you sure you want to delete this portfolio page?')) {
      const requestParams = {
        authToken: user.authToken,
        portfolioId: portfolio?.id,
      };

      try {
        await PortfolioApi.deletePortfolio(requestParams);
        toast.success(t('Portfolio page deleted'));
        onBack();
        refresh();
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    }
  };

  const handleLink = () => {
    if (!portfolio.isPublished) {
      toast.error(t('The portfolio page is not published yet'));
      return;
    }
    window.open(`${Config.Common.FrontEndUrl}/page/${portfolio?.code}`, '_blank').focus();
  };

  return (
    <div className="create-portfolio-container">
      <div className="create-portfolio-header-container">
        <div className="create-portfolio-header-title-container">
          <p className="create-portfolio-title">{t(!isCreatePortfolio ? 'Edit Portfolio Page' : 'New Portfolio Page')}</p>
          <p className="title-description">{t('Select and reorder projects to put in the public page!')}</p>
          <div className="close-button" onClick={onBack}>
            <CloseSVG />
          </div>
        </div>
      </div>
      <div className="portfolio-link">
        <p className="link-title">
          {t('Public link to this page')}
          * :
        </p>
        <p className="link-domain" onClick={handleLink}>
          {Config.Common.FrontEndUrl}
          /page/
        </p>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={` ${t('Add a unique Viviboom URL here')}`} />
      </div>

      <div className="edit-portfolio">
        <div className="body">
          <img className="header-img" src={Header} alt="header" />
          <div className="portfolio-header-container">
            <div className="cover-image">
              <img className="cover-img" src={coverImageToUpload.base64 || portfolio?.coverImageUri || PlaceholderCover} alt="cover" />
              <div className="edit-image">
                <div className="image">
                  <label className="button">
                    {t('Upload Cover Image')}
                    <input
                      type="file"
                      accept="image/x-png,image/gif,image/jpeg"
                      onChange={(e) => {
                        const file = e.currentTarget.files.length >= 1 ? e.currentTarget.files[0] : null;
                        if (file.size > MAX_IMAGE_SIZE) {
                          toast.error(t('File is too large. Max File size: 8MB'));
                        } else {
                          getBase64(file, (base64) => {
                            if (base64) setCoverImageToUpload({ file, base64 });
                          });
                        }
                      }}
                      disabled={loading}
                    />
                  </label>
                </div>
                <div className="image">
                  <label className="button">
                    {t('Upload Profile Picture')}
                    <input
                      type="file"
                      accept="image/x-png,image/gif,image/jpeg"
                      onChange={(e) => {
                        const file = e.currentTarget.files.length >= 1 ? e.currentTarget.files[0] : null;
                        if (file.size > MAX_IMAGE_SIZE) {
                          toast.error(t('File is too large. Max File size: 8MB'));
                        } else {
                          getBase64(file, (base64) => {
                            if (base64) setProfileImageToUpload({ file, base64 });
                          });
                        }
                      }}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="portfolio-details">
              <div className="portfolio-image">
                <img src={profileImageToUpload.base64 || portfolio?.profileImageUri || PlaceholderProfile} alt="profile" />
              </div>
              <div className="text">
                <div className="name">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('Add a title for this public page')} />
                  <p className="title-heading">
                    {t('Title')}
                    *
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="portfolio-info">
            <div className="portfolio-tabs">
              {items.map((key) => (
                <div className={key === itemKey ? 'portfolio-tab active' : 'portfolio-tab'} key={key} onClick={() => setItemKey(key)}>
                  {key}
                </div>
              ))}
            </div>
            {itemKey === 'About this page' && (
              <div className="portfolio-info-container">
                <div className="icon">
                  <img alt="logo" src={About} />
                </div>
                <div className="info-text">
                  <div className="title">
                    {t('About this page')}
                  </div>
                  <div className="name">
                    <textarea value={description} maxLength={60000} onChange={(e) => setDescription(e.target.value)} placeholder={t('Introduce this page to the public (optional)')} />
                  </div>
                </div>
              </div>
            )}
            <SelectPortfolioBadges
              show={itemKey === 'Badges'}
              portfolioId={portfolio?.id}
              setPrevBadges={setPrevBadges}
              badges={badges}
              setBadges={setBadges}
              headingBadge={headingBadge}
              setHeadingBadge={setHeadingBadge}
            />
            <SelectPortfolioChallenges
              show={itemKey === 'Challenges'}
              portfolioId={portfolio?.id}
              setPrevChallenges={setPrevBadges}
              challenges={challenges}
              setChallenges={setChallenges}
              headingChallenge={headingChallenge}
              setHeadingChallenge={setHeadingChallenge}
            />
            <SelectPortfolioEvents
              show={itemKey === 'Events'}
              portfolioId={portfolio?.id}
              setPrevEvents={setPrevEvents}
              events={events}
              setEvents={setEvents}
              headingEvent={headingEvent}
              setHeadingEvent={setHeadingEvent}
            />
            <SelectPortfolioProjects
              show={itemKey === 'Projects'}
              portfolioId={portfolio?.id}
              setPrevProjects={setPrevProjects}
              projects={projects}
              setProjects={setProjects}
              headingProject={headingProject}
              setHeadingProject={setHeadingProject}
            />
            <SelectPortfolioUsers
              show={itemKey === 'Creators'}
              portfolioId={portfolio?.id}
              setPrevUsers={setPrevUsers}
              users={users}
              setUsers={setUsers}
              headingUser={headingUser}
              setHeadingUser={setHeadingUser}
            />
            {itemKey === 'Other Settings' && (
              <div className="other-settings">
                <div className="portfolio-checkbox">
                  <input
                    type="checkbox"
                    onChange={(e) => setShowProjectCountry(e.target.checked)}
                    checked={showProjectCountry}
                  />
                  <div className="checkbox-label">
                    {t('Show author country flag on listed projects')}
                  </div>
                </div>
                <div className="portfolio-checkbox">
                  <input
                    type="checkbox"
                    onChange={(e) => setShowUserFullName(e.target.checked)}
                    checked={showUserFullName}
                  />
                  <div className="checkbox-label">
                    {t('Show user full name instead of shortened name')}
                  </div>
                </div>
                <div className="portfolio-checkbox">
                  <input
                    type="checkbox"
                    onChange={(e) => setShowUserProfile(e.target.checked)}
                    checked={showUserProfile}
                  />
                  <div className="checkbox-label">
                    {t('Show author profile on listed project')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="all-buttons">
        {!isCreatePortfolio && (
          <Button
            parentClassName="delete-btn"
            status={loading ? 'loading' : 'delete'}
            onClick={handleDelete}
          >
            {t('Delete Page')}
          </Button>
        )}
        <div className="save-buttons">
          {!portfolio?.isPublished && (
            <Button
              type="submit"
              parentClassName="save-btn"
              status={loading ? 'loading' : 'save'}
              value="Save as Draft"
              onClick={() => savePortfolio(false)}
            />
          )}
          <Button
            type="submit"
            parentClassName="save-btn"
            status={loading ? 'loading' : 'save'}
            value={portfolio?.isPublished ? 'Save' : 'Publish Page'}
            onClick={() => savePortfolio(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default CreatePublicPortfolio;
