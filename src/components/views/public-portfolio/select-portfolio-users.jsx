import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import './select-portfolio.scss';

import UserApi from 'src/apis/viviboom/UserApi';
import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';
import DefaultUserPicture from 'src/css/imgs/default-profile-picture.png';

const DEFAULT_USER_ITEM_IMAGE_WIDTH = 512;
const DEFAULT_LIMIT = 3;

function SelectPortfolioUsers({
  show, setPrevUsers, users, setUsers, headingUser, setHeadingUser, portfolioId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const allUsersRef = useRef(null);

  const fetchAllUsers = useCallback(async () => {
    if (!user?.authToken) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      orderKey: 'username',
      orderDirection: 'ASC',
      isPublicPortfolioActivated: true,
    };
    if (keywords) requestParams.username = keywords;
    setLoading(true);
    try {
      const res = await UserApi.getList(requestParams);
      setAllUsers(res.data?.users);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, keywords]);

  const fetchSelectedUsers = useCallback(async () => {
    if (!user?.authToken || !portfolioId) return;
    const requestParams = {
      authToken: user.authToken,
      isPublicPortfolioActivated: true,
      portfolioId,
    };
    setLoading(true);
    try {
      const res = await UserApi.getList(requestParams);
      setUsers(res.data?.users);
      setPrevUsers(res.data?.users);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, portfolioId, setUsers, setPrevUsers]);

  const handleUserToggle = (selectedUser) => () => {
    if (!users.find((p) => p.id === selectedUser.id)) {
      setUsers([...users, selectedUser]);
    } else {
      setUsers(users.filter((p) => p.id !== selectedUser.id));
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedUsers = Array.from(users);
    const [movedUser] = updatedUsers.splice(source.index, 1);
    updatedUsers.splice(destination.index, 0, movedUser);
    setUsers(updatedUsers);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    setKeywords(keywordInput);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  useEffect(() => {
    fetchSelectedUsers();
  }, [fetchSelectedUsers]);

  return show && (
    <div className="select-portfolio-items">
      <div className="selected-items">
        <div className="section-title">
          {t('Selected User Profiles')}
        </div>
        <div className="section-subtext">
          {t('Drag and drop the users to change the order they appear on your public portfolio page')}
        </div>
        <div className="drag-container">
          <input
            className="heading"
            type="text"
            value={headingUser}
            placeholder={t('Add a heading for the user section (optional)')}
            onChange={(e) => setHeadingUser(e.target.value)}
          />
          {users?.length === 0 && <div className="no-items">{t('No users has been selected for this page yet')}</div>}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="item-list" direction="horizontal">
              {(provided) => (
                <ul className="item-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {users.map((v, index) => (
                    <Draggable key={v.id} draggableId={v.id.toString()} index={index}>
                      {(provided) => (
                        <li key={`user-user+${v.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="item-container selected">
                            <div className="item-image user">
                              <MyImage
                                src={v?.profileImageUri}
                                defaultImage={DefaultUserPicture}
                                alt="user"
                                width={DEFAULT_USER_ITEM_IMAGE_WIDTH}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-title user">
                                {v?.name}
                              </div>
                            </div>
                            <div className="item-btn">
                              <button onClick={handleUserToggle(v)} type="submit" className="item-button remove">{t('Remove User')}</button>
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
              {t('All Users')}
            </div>
            <div className="section-subtext">
              {t('Only users with public portfolio activated are shown here')}
            </div>
          </div>
          <div className="section-header-right">
            <input
              className="search-portfolios"
              type="text"
              value={keywordInput}
              placeholder={t('Search Users')}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
          </div>
        </div>
        <div className="drag-container" ref={allUsersRef}>
          {allUsers?.length === 0 && <div className="no-items">{t('No user found')}</div>}
          <ul className="item-list unselected">
            {allUsers.map((v) => (
              <li key={`user-user+${v.id}`}>
                <div className={`item-container${users.find((p) => p.id === v.id) ? ' is-selected' : ''}`}>
                  <div className="item-image user">
                    <MyImage
                      src={v?.profileImageUri}
                      defaultImage={DefaultUserPicture}
                      alt="user"
                      width={DEFAULT_USER_ITEM_IMAGE_WIDTH}
                      isLoading={loading}
                    />
                  </div>
                  <Loading show={loading} size="24px" />
                  <div className="item-details">
                    <div className="item-title user">
                      {v?.name}
                    </div>
                  </div>
                  <div className="item-btn">
                    {users.find((p) => p.id === v.id) ? (
                      <span className="selected-text">{t('Selected! Scroll up to rearrange / remove user!')}</span>
                    ) : (
                      <button onClick={handleUserToggle(v)} type="submit" className="item-button">{t('Select User')}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-footer">
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} scrollToRef={allUsersRef.current} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectPortfolioUsers;
