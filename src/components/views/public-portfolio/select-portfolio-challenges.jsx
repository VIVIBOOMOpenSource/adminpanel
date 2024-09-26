import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import './select-portfolio.scss';

import ChallengeApi from 'src/apis/viviboom/ChallengeApi';
import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';
import DefaultChallengePicture from 'src/css/imgs/placeholder-square-s.jpeg';

const DEFAULT_LIMIT = 3;

function SelectPortfolioChallenges({
  show, setPrevChallenges, challenges, setChallenges, headingChallenge, setHeadingChallenge, portfolioId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);
  const [allChallenges, setAllChallenges] = useState([]);

  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const allChallengesRef = useRef(null);

  const fetchAllChallenges = useCallback(async () => {
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
      const res = await ChallengeApi.getList(requestParams);
      setAllChallenges(res.data?.challenges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, keywords]);

  const fetchSelectedChallenges = useCallback(async () => {
    if (!user?.authToken || !portfolioId) return;
    const requestParams = {
      authToken: user.authToken,
      isPublished: true,
      portfolioId,
    };
    setLoading(true);
    try {
      const res = await ChallengeApi.getList(requestParams);
      setChallenges(res.data?.challenges);
      setPrevChallenges(res.data?.challenges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, portfolioId, setChallenges, setPrevChallenges]);

  const handleChallengeToggle = (challenge) => () => {
    if (!challenges.find((p) => p.id === challenge.id)) {
      setChallenges([...challenges, challenge]);
    } else {
      setChallenges(challenges.filter((p) => p.id !== challenge.id));
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedChallenges = Array.from(challenges);
    const [movedChallenge] = updatedChallenges.splice(source.index, 1);
    updatedChallenges.splice(destination.index, 0, movedChallenge);
    setChallenges(updatedChallenges);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    setKeywords(keywordInput);
  };

  useEffect(() => {
    fetchAllChallenges();
  }, [fetchAllChallenges]);

  useEffect(() => {
    fetchSelectedChallenges();
  }, [fetchSelectedChallenges]);

  return show && (
    <div className="select-portfolio-items">
      <div className="selected-items">
        <div className="section-title">
          {t('Selected Challenges')}
        </div>
        <div className="section-subtext">
          {t('Drag and drop the challenges to change the order they appear on your public portfolio page')}
        </div>
        <div className="drag-container">
          <input
            className="heading"
            type="text"
            value={headingChallenge}
            placeholder={t('Add a heading for the challenge section (optional)')}
            onChange={(e) => setHeadingChallenge(e.target.value)}
          />
          {challenges?.length === 0 && <div className="no-items">{t('No challenges has been selected for this page yet')}</div>}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="item-list" direction="horizontal">
              {(provided) => (
                <ul id="selected-scroll" className="item-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {challenges.map((v, index) => (
                    <Draggable key={v.id} draggableId={v.id.toString()} index={index}>
                      {(provided) => (
                        <li key={`user-challenge+${v.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="item-container selected">
                            <div className="item-image challenge">
                              <MyImage
                                src={v?.imageUri}
                                alt="challenge"
                                width={256}
                                defaultImage={DefaultChallengePicture}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-title badge">
                                {v?.name}
                              </div>
                            </div>
                            <div className="item-btn">
                              <button onClick={handleChallengeToggle(v)} type="submit" className="item-button remove">{t('Remove Challenge')}</button>
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
              {t('All Challenges')}
            </div>
            <div className="section-subtext">
              {t('Select from all Viviboom challenges')}
            </div>
          </div>
          <div className="section-header-right">
            <input
              className="search-portfolios"
              type="text"
              value={keywordInput}
              placeholder={t('Search Challenges')}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
          </div>
        </div>
        <div className="drag-container" ref={allChallengesRef}>
          {allChallenges?.length === 0 && <div className="no-items">{t('No challenge found')}</div>}
          <ul className="item-list unselected">
            {allChallenges.map((v) => (
              <li key={`user-challenge+${v.id}`}>
                <div className={`item-container${challenges.find((p) => p.id === v.id) ? ' is-selected' : ''}`}>
                  <div className="item-image challenge">
                    <MyImage
                      src={v?.imageUri}
                      alt="challenge"
                      width={256}
                      defaultImage={DefaultChallengePicture}
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
                    {challenges.find((p) => p.id === v.id) ? (
                      <span className="selected-text">{t('Selected! Scroll up to rearrange / remove challenge!')}</span>
                    ) : (
                      <button onClick={handleChallengeToggle(v)} type="submit" className="item-button">{t('Select Challenge')}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-footer">
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} scrollToRef={allChallengesRef.current} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectPortfolioChallenges;
