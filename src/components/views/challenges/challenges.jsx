import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './challenges.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';

import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';

import ChallengeApi from 'src/apis/viviboom/ChallengeApi';
import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';

import ChallengeModal from './challenge-modal';

const DEFAULT_LIMIT = 20;
const badgeImageParams = { suffix: 'png' };

function Challenges({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const authToken = useSelector((state) => state.user.authToken);
  const { state } = useLocation();

  const [showNewChallenge, setShowNewChallenge] = useState(!!state?.isCreate);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // for the tabs: -1 is 'all categories'
  const [badgeCategoryId, setBadgeCategoryId] = useState(-1);

  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [badgeCategories, setBadgeCategories] = useState([]);

  const [keywords, setKeywords] = useState('');
  const [order, setOrder] = useState(BadgeOrderType.LATEST);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isPublished, setIsPublished] = useState(true);

  const handleClose = () => {
    setShowNewChallenge(false);
    setSelectedChallenge(null);
  };

  const fetchCategories = useCallback(async () => {
    if (!authToken) return;

    setCategoriesLoading(true);
    try {
      const res = await BadgeCategoryApi.getList({ authToken });
      setBadgeCategories(res.data?.badgeCategories);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setCategoriesLoading(false);
  }, [authToken]);

  const fetchChallenges = useCallback(async (newPage = page) => {
    setChallenges([]);

    const requestParams = {
      authToken,
      verboseAttributes: ['createdByUser', 'categories', 'content'],
      order,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
      isPublished,
    };
    // if badgeCategoryId is undefined, fetch all challenges, else:
    if (badgeCategoryId > 0) requestParams.badgeCategoryId = badgeCategoryId;
    if (keywords) requestParams.keywords = keywords;

    setLoading(true);
    try {
      const res = await ChallengeApi.getList(requestParams);
      setChallenges(res.data?.challenges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [authToken, badgeCategoryId, keywords, order, page, isPublished]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchChallenges();
  }, [page, order, badgeCategoryId, fetchChallenges]);

  const handleCategoryClick = (id) => () => {
    if (id !== badgeCategoryId) {
      setPage(1);
      setTotalPages(1);
      setKeywords('');
      setOrder(BadgeOrderType.LATEST);
      setBadgeCategoryId(id);
      if (id === 0) {
        setIsPublished(false);
      } else {
        setIsPublished(true);
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    setBadgeCategoryId(-1);
    setPage(1);
    setTotalPages(1);
    await fetchChallenges(1);
  };

  const handleOrderChange = async (e) => {
    setOrder(e.target.value);
    setPage(1);
    setTotalPages(1);
  };

  return (
    <div className="challenges">
      <div className="challenges-container">
        <div className="challenges-category-content">
          <h1>{t('Challenges')}</h1>
          <ul>
            <li className={(badgeCategoryId === -1) ? 'active' : ''} onClick={handleCategoryClick(-1)}>All Categories</li>
            <li className={(badgeCategoryId === 0) ? 'active' : ''} onClick={handleCategoryClick(0)}>Drafts</li>
            {
              badgeCategories.map((v, index) => (
                <li
                  key={`badge-category_${v.id}`}
                  className={(badgeCategoryId === v.id) ? 'active' : ''}
                  onClick={handleCategoryClick(v.id, index)}
                >
                  {v.name}
                </li>
              ))
            }
            <Loading show={categoriesLoading} size="24px" />
          </ul>
        </div>
        <div className="challenges-content">
          <div className="challenges-header">
            <div className="challenges-search">
              <form onSubmit={handleSearchSubmit}>
                <input type="text" value={keywords} placeholder="Search Challenges" onChange={(e) => setKeywords(e.target.value)} />
                <select value={order} onChange={handleOrderChange}>
                  <option value={BadgeOrderType.LATEST}>Latest</option>
                  <option value={BadgeOrderType.OLDEST}>Oldest</option>
                </select>
                <Button type="submit" status="search" value="Search" className="button" />
              </form>

            </div>
            <div className="challenges-add">
              <Button
                status="add"
                className="button"
                disabled={!authToCreate}
                onClick={() => setShowNewChallenge(true)}
              >
                {t('New Challenge')}
              </Button>
            </div>
          </div>

          <div className="challenges-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Thumbnail Image')}</th>
                  <th>{t('Name')}</th>
                  <th>{t('Created Date')}</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((v) => (
                  <tr key={`challenge_${v.id}`} onClick={() => setSelectedChallenge(v)}>
                    <td className="image">
                      <MyImage src={v.imageUri} alt={v.name} preloadImage={PreloadBadgeImage} defaultImage={PreloadBadgeImage} params={badgeImageParams} width={128} />
                    </td>
                    <td>{v.name || '(no name)'}</td>
                    <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATE_MED)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!challenges?.length && <div className="no-results">{t('No Results')}</div>}
            <div className="challenges-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>

        </div>
      </div>

      <ChallengeModal
        show={selectedChallenge || showNewChallenge}
        handleClose={handleClose}
        refreshChallenges={fetchChallenges}
        challenge={selectedChallenge}
        allBadgeCategories={badgeCategories}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Challenges;
