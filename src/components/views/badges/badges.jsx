import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './badges.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';

import BadgeSvg from 'src/css/imgs/icon-badge.svg';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';

import BadgeModal from './badge-modal';
import BadgeCategoryModal from './badge-category-modal';

const DEFAULT_LIMIT = 20;
const badgeImageParams = { suffix: 'png' };

function Badges({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const authToken = useSelector((state) => state.user.authToken);
  const { state } = useLocation();

  const [showNewBadge, setShowNewBadge] = useState(!!state?.isCreate);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // for create/modify badge category
  const [showNewBadgeCategory, setShowNewBadgeCategory] = useState(false);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState(null);

  // for the tabs: -1 is 'all categories'
  const [badgeCategoryId, setBadgeCategoryId] = useState(-1);

  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [badges, setBadges] = useState([]);
  const [badgeCategories, setBadgeCategories] = useState([]);

  const [keywords, setKeywords] = useState('');
  const [order, setOrder] = useState(BadgeOrderType.LATEST);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isPublished, setIsPublished] = useState(true);

  const handleClose = () => {
    setShowNewBadge(false);
    setSelectedBadge(null);
    setShowNewBadgeCategory(false);
    setSelectedBadgeCategory(null);
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

  const fetchBadges = useCallback(async (newPage = page) => {
    setBadges([]);

    const requestParams = {
      authToken,
      verboseAttributes: ['createdByUser', 'categories', 'content'],
      order,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
      isPublished,
    };
    // if badgeCategoryId is undefined, fetch all badges, else:
    if (badgeCategoryId > 0) requestParams.badgeCategoryId = badgeCategoryId;
    if (keywords) requestParams.keywords = keywords;

    setLoading(true);
    try {
      const res = await BadgeApi.getList(requestParams);
      setBadges(res.data?.badges);
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
    fetchBadges();
  }, [page, order, badgeCategoryId, fetchBadges]);

  const handleCategoryClick = (id, index) => () => {
    if (id === badgeCategoryId && id > 0) {
      setSelectedBadgeCategory(badgeCategories[index]);
    } else {
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
    await fetchBadges(1);
  };

  const handleOrderChange = async (e) => {
    setOrder(e.target.value);
    setPage(1);
    setTotalPages(1);
  };

  return (
    <div className="badges">
      <div className="badges-container">
        <div className="badges-category-content">
          <h1>{t('Badges')}</h1>
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
            <li className="new-category">
              <Button
                status="add"
                disabled={!authToCreate}
                onClick={() => setShowNewBadgeCategory(true)}
              >
                {t('New Category')}
              </Button>
            </li>
          </ul>
        </div>
        <div className="badges-content">
          <div className="badges-header">
            <div className="badges-search">
              <form onSubmit={handleSearchSubmit}>
                <input type="text" value={keywords} placeholder="Search Badges" onChange={(e) => setKeywords(e.target.value)} />
                <select value={order} onChange={handleOrderChange}>
                  <option value={BadgeOrderType.LATEST}>Latest</option>
                  <option value={BadgeOrderType.OLDEST}>Oldest</option>
                </select>
                <Button type="submit" status="search" value="Search" className="button" />
              </form>

            </div>
            <div className="badges-add">
              <Button
                status="add"
                className="button"
                disabled={!authToCreate}
                onClick={() => setShowNewBadge(true)}
              >
                {t('New Badge')}
              </Button>
            </div>
          </div>

          <div className="badges-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Badge Image')}</th>
                  <th>{t('Name')}</th>
                  <th>{t('Created Date')}</th>
                </tr>
              </thead>
              <tbody>
                {badges.map((v) => (
                  <tr key={`badge_${v.id}`} onClick={() => setSelectedBadge(v)}>
                    <td className="image">
                      <MyImage src={v.imageUri} alt={v.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} params={badgeImageParams} width={128} />
                    </td>
                    <td>{v.name || '(no name)'}</td>
                    <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATE_MED)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!badges?.length && <div className="no-results">{t('No Results')}</div>}
            <div className="badges-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>

        </div>
      </div>

      <BadgeCategoryModal
        show={selectedBadgeCategory || showNewBadgeCategory}
        handleClose={handleClose}
        refreshCategories={fetchCategories}
        badgeCategory={selectedBadgeCategory}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
      <BadgeModal
        show={selectedBadge || showNewBadge}
        handleClose={handleClose}
        refreshBadges={fetchBadges}
        badge={selectedBadge}
        allBadgeCategories={badgeCategories}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Badges;
