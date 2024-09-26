import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import './select-portfolio.scss';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';
import DefaultBadgePicture from 'src/css/imgs/default-profile-picture.png';

const badgeImageParams = { suffix: 'png' };
const DEFAULT_BADGE_ITEM_IMAGE_WIDTH = 128;
const DEFAULT_LIMIT = 3;

function SelectPortfolioBadges({
  show, setPrevBadges, badges, setBadges, headingBadge, setHeadingBadge, portfolioId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);
  const [allBadges, setAllBadges] = useState([]);

  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const allBadgesRef = useRef(null);

  const fetchAllBadges = useCallback(async () => {
    if (!user?.authToken) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      order: BadgeOrderType.LATEST,
    };
    if (keywords) requestParams.keywords = keywords;
    setLoading(true);
    try {
      const res = await BadgeApi.getList(requestParams);
      setAllBadges(res.data?.badges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, keywords]);

  const fetchSelectedBadges = useCallback(async () => {
    if (!user?.authToken || !portfolioId) return;
    const requestParams = {
      authToken: user.authToken,
      isPublished: true,
      portfolioId,
    };
    setLoading(true);
    try {
      const res = await BadgeApi.getList(requestParams);
      setBadges(res.data?.badges);
      setPrevBadges(res.data?.badges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, portfolioId, setBadges, setPrevBadges]);

  const handleBadgeToggle = (badge) => () => {
    if (!badges.find((p) => p.id === badge.id)) {
      setBadges([...badges, badge]);
    } else {
      setBadges(badges.filter((p) => p.id !== badge.id));
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedBadges = Array.from(badges);
    const [movedBadge] = updatedBadges.splice(source.index, 1);
    updatedBadges.splice(destination.index, 0, movedBadge);
    setBadges(updatedBadges);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    setKeywords(keywordInput);
  };

  useEffect(() => {
    fetchAllBadges();
  }, [fetchAllBadges]);

  useEffect(() => {
    fetchSelectedBadges();
  }, [fetchSelectedBadges]);

  return show && (
    <div className="select-portfolio-items">
      <div className="selected-items">
        <div className="section-title">
          {t('Selected Badges')}
        </div>
        <div className="section-subtext">
          {t('Drag and drop the badges to change the order they appear on your public portfolio page')}
        </div>
        <div className="drag-container">
          <input
            className="heading"
            type="text"
            value={headingBadge}
            placeholder={t('Add a heading for the badge section (optional)')}
            onChange={(e) => setHeadingBadge(e.target.value)}
          />
          {badges?.length === 0 && <div className="no-items">{t('No badges has been selected for this page yet')}</div>}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="item-list" direction="horizontal">
              {(provided) => (
                <ul id="selected-scroll" className="item-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {badges.map((v, index) => (
                    <Draggable key={v.id} draggableId={v.id.toString()} index={index}>
                      {(provided) => (
                        <li key={`user-badge+${v.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="item-container selected">
                            <div className="item-image badge">
                              <MyImage
                                src={v?.imageUri}
                                alt="badge"
                                width={DEFAULT_BADGE_ITEM_IMAGE_WIDTH}
                                defaultImage={DefaultBadgePicture}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-title badge">
                                {v?.name}
                              </div>
                            </div>
                            <div className="item-btn">
                              <button onClick={handleBadgeToggle(v)} type="submit" className="item-button remove">{t('Remove Badge')}</button>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      <div className="selected-items">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-title">
              {t('All Badges')}
            </div>
            <div className="section-subtext">
              {t('Select from all Viviboom badges')}
            </div>
          </div>
          <div className="section-header-right">
            <input
              className="search-portfolios"
              type="text"
              value={keywordInput}
              placeholder={t('Search Badges')}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
          </div>
        </div>
        <div className="drag-container" ref={allBadgesRef}>
          {allBadges?.length === 0 && <div className="no-items">{t('No badge found')}</div>}
          <ul className="item-list unselected">
            {allBadges.map((v) => (
              <li key={`user-badge+${v.id}`}>
                <div className={`item-container${badges.find((p) => p.id === v.id) ? ' is-selected' : ''}`}>
                  <div className="item-image badge">
                    <MyImage
                      src={v?.imageUri}
                      alt="badge"
                      width={DEFAULT_BADGE_ITEM_IMAGE_WIDTH}
                      defaultImage={DefaultBadgePicture}
                      params={badgeImageParams}
                      isLoading={loading}
                    />
                  </div>
                  <Loading show={loading} size="24px" />
                  <div className="item-details">
                    <div className="item-title badge">
                      {v?.name}
                    </div>
                  </div>
                  <div className="item-btn">
                    {badges.find((p) => p.id === v.id) ? (
                      <span className="selected-text">{t('Selected! Scroll up to rearrange / remove badge!')}</span>
                    ) : (
                      <button onClick={handleBadgeToggle(v)} type="submit" className="item-button">{t('Select Badge')}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-footer">
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} scrollToRef={allBadgesRef.current} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectPortfolioBadges;
