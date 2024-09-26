import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import './select-portfolio.scss';

import EventApi from 'src/apis/viviboom/EventApi';
import { EventOrderType } from 'src/enums/EventOrderType';
import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';
import DefaultEventPicture from 'src/css/imgs/workshop-default.jpg';
import { PublicAccessType } from 'src/enums/PublicAccessType';
import { DateTime } from 'luxon';

const DEFAULT_EVENT_ITEM_IMAGE_WIDTH = 512;
const DEFAULT_LIMIT = 3;

function SelectPortfolioEvents({
  show, setPrevEvents, events, setEvents, headingEvent, setHeadingEvent, portfolioId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState([]);

  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const allEventsRef = useRef(null);

  const fetchAllEvents = useCallback(async () => {
    if (!user?.authToken) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      order: EventOrderType.LATEST,
      publicAccessTypes: [PublicAccessType.VIEW, PublicAccessType.BOOK, PublicAccessType.PUBLIC_ONLY],
    };
    if (keywords) requestParams.title = keywords;
    setLoading(true);
    try {
      const res = await EventApi.getList(requestParams);
      setAllEvents(res.data?.events);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, keywords]);

  const fetchSelectedEvents = useCallback(async () => {
    if (!user?.authToken || !portfolioId) return;
    const requestParams = {
      authToken: user.authToken,
      portfolioId,
    };
    setLoading(true);
    try {
      const res = await EventApi.getList(requestParams);
      setEvents(res.data?.events);
      setPrevEvents(res.data?.events);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, portfolioId, setEvents, setPrevEvents]);

  const handleEventToggle = (event) => () => {
    if (!events.find((p) => p.id === event.id)) {
      setEvents([...events, event]);
    } else {
      setEvents(events.filter((p) => p.id !== event.id));
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedEvents = Array.from(events);
    const [movedEvent] = updatedEvents.splice(source.index, 1);
    updatedEvents.splice(destination.index, 0, movedEvent);
    setEvents(updatedEvents);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    setKeywords(keywordInput);
  };

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  useEffect(() => {
    fetchSelectedEvents();
  }, [fetchSelectedEvents]);

  return show && (
    <div className="select-portfolio-items">
      <div className="selected-items">
        <div className="section-title">
          {t('Selected Events')}
        </div>
        <div className="section-subtext">
          {t('Drag and drop the events to change the order they appear on your public portfolio page')}
        </div>
        <div className="drag-container">
          <input
            className="heading"
            type="text"
            value={headingEvent}
            placeholder={t('Add a heading for the event section (optional)')}
            onChange={(e) => setHeadingEvent(e.target.value)}
          />
          {events?.length === 0 && <div className="no-items">{t('No events has been selected for this page yet')}</div>}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="item-list" direction="horizontal">
              {(provided) => (
                <ul className="item-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {events.map((v, index) => (
                    <Draggable key={v.id} draggableId={v.id.toString()} index={index}>
                      {(provided) => (
                        <li key={`user-event+${v.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="item-container selected">
                            <div className="item-image">
                              <MyImage
                                src={v?.imageUri}
                                alt="event"
                                width={DEFAULT_EVENT_ITEM_IMAGE_WIDTH}
                                defaultImage={DefaultEventPicture}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-title event">
                                {v?.title}
                              </div>
                              <div className="item-desc event">{DateTime.fromISO(v?.startAt).toLocaleString(DateTime.DATE_MED)}</div>
                            </div>
                            <div className="item-btn">
                              <button onClick={handleEventToggle(v)} type="submit" className="item-button remove">{t('Remove Event')}</button>
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
              {t('All Events')}
            </div>
            <div className="section-subtext">
              {t('Only public events are shown here')}
            </div>
          </div>
          <div className="section-header-right">
            <input
              className="search-portfolios"
              type="text"
              value={keywordInput}
              placeholder={t('Search Events')}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
          </div>
        </div>
        <div className="drag-container" ref={allEventsRef}>
          {allEvents?.length === 0 && <div className="no-items">{t('No event found')}</div>}
          <ul className="item-list unselected">
            {allEvents.map((v) => (
              <li key={`user-event+${v.id}`}>
                <div className={`item-container${events.find((p) => p.id === v.id) ? ' is-selected' : ''}`}>
                  <div className="item-image">
                    <MyImage
                      src={v?.imageUri}
                      alt="event"
                      width={DEFAULT_EVENT_ITEM_IMAGE_WIDTH}
                      defaultImage={DefaultEventPicture}
                      isLoading={loading}
                    />
                  </div>
                  <Loading show={loading} size="24px" />
                  <div className="item-details">
                    <div className="item-title event">
                      {v?.title}
                    </div>
                    <div className="item-desc event">{DateTime.fromISO(v?.startAt).toLocaleString(DateTime.DATE_MED)}</div>
                  </div>
                  <div className="item-btn">
                    {events.find((p) => p.id === v.id) ? (
                      <span className="selected-text">{t('Selected! Scroll up to rearrange / remove event!')}</span>
                    ) : (
                      <button onClick={handleEventToggle(v)} type="submit" className="item-button">{t('Select Event')}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-footer">
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} scrollToRef={allEventsRef.current} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectPortfolioEvents;
