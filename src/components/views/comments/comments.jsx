import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './comments.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import { CommentOrderType } from 'src/enums/CommentOrderType';
import CommentApi from 'src/apis/viviboom/CommentApi';
import UserApi from 'src/apis/viviboom/UserApi';
import ProjectApi from 'src/apis/viviboom/ProjectApi';

import CommentModal from './comment-modal';

const DEFAULT_LIMIT = 20;

const searchBys = ['Text', 'Username', 'Project Title'];

// filter tabs are on the left
const filterTabs = {
  All: {},
  'Not Flagged': { isFlagged: false },
  Flagged: { isFlagged: true },
};

function Comments({ authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'comment' });
  const authToken = useSelector((state) => state.user.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const [filterTabKey, setFilterTabKey] = useState('All');
  const [keywords, setKeywords] = useState('');
  const [searchBy, setSearchBy] = useState(searchBys[0]);
  const [selectedUserOption, setSelectedUserOption] = useState(null); // if search by user
  const [selectedProjectOption, setSelectedProjectOption] = useState(null); // if search by project
  const [order, setOrder] = useState(CommentOrderType.LATEST);

  const [comments, setComments] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = useCallback(async (newPage = page) => {
    setComments([]);

    const requestParams = {
      authToken,
      userBranchId: branch.id,
      ...filterTabs[filterTabKey],
      order,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };

    if (searchBy === 'Username') {
      if (selectedUserOption) requestParams.userId = selectedUserOption.value.id;
    } else if (searchBy === 'Project Title') {
      if (selectedProjectOption) requestParams.projectId = selectedProjectOption.value.id;
    } else {
      // text
      requestParams.keywords = keywords;
    }

    setLoading(true);
    try {
      const res = await CommentApi.getList(requestParams);
      setComments(res.data?.comments);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [page, authToken, filterTabKey, order, searchBy, selectedUserOption, selectedProjectOption, keywords, branch]);

  const loadUserOptions = async (userSearchKeywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        branchId: branch.id, // comment privilige is based on USER
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };

      if (userSearchKeywords) requestParams.username = userSearchKeywords;

      const res = await UserApi.getList(requestParams);
      const { users, count } = res.data;
      return {
        options: users.map((u) => ({ value: u, label: `${u.username}, ${u.name}` })),
        hasMore: prevOptions.length + users.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  const loadProjectOptions = async (projectSearchKeywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        isPublished: true,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };

      if (projectSearchKeywords) requestParams.keywords = projectSearchKeywords;

      const res = await ProjectApi.getList(requestParams);
      const { projects, count } = res.data;
      return {
        options: projects.map((p) => ({ value: p, label: `${p.name}, ${t('Author')}: ${p.authorUser.name}` })),
        hasMore: prevOptions.length + projects.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    setFilterTabKey('All');
    setPage(1);
    setTotalPages(1);
    await fetchComments(1);
  };

  const handleFilterTabClick = (key) => () => {
    setPage(1);
    setTotalPages(1);
    setKeywords('');
    setSearchBy('Text');
    setOrder(CommentOrderType.LATEST);
    setFilterTabKey(key);
  };

  const handleOrderChange = async (e) => {
    setOrder(e.target.value);
    setPage(1);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchComments();
  }, [page, filterTabKey, order]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchComments(1);
  }, [branch]);

  return (
    <div className="comments">
      <div className="comments-container">
        <div className="comments-category-content">
          <h1>{t('Comments')}</h1>
          <ul className="user-sort hlo">
            {Object.keys(filterTabs).map((key) => (
              <li key={`tab-${key}`} className={(key === filterTabKey) ? 'active' : ''} value={key} onClick={handleFilterTabClick(key)}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className="comments-content">
          <div className="comments-header">
            <div className="comments-search">
              <form onSubmit={handleSearchSubmit}>
                {searchBy === 'Text' && <input type="text" value={keywords} placeholder="Search Comments" onChange={(e) => setKeywords(e.target.value)} />}
                {searchBy === 'Username' && (
                  <AsyncPaginate
                    className="select"
                    placeholder={t('Select Users')}
                    isClearable
                    debounceTimeout={300}
                    cacheUniqs={[searchBy]}
                    value={selectedUserOption}
                    loadOptions={loadUserOptions}
                    onChange={setSelectedUserOption}
                  />
                )}
                {searchBy === 'Project Title' && (
                  <AsyncPaginate
                    className="select"
                    placeholder={t('Select Projects')}
                    isClearable
                    debounceTimeout={300}
                    cacheUniqs={[searchBy]}
                    value={selectedProjectOption}
                    loadOptions={loadProjectOptions}
                    onChange={setSelectedProjectOption}
                  />
                )}
                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                  {searchBys.map((key) => (
                    <option key={key} value={key}>{t(key)}</option>
                  ))}
                </select>
                <select value={order} onChange={handleOrderChange}>
                  <option value={CommentOrderType.LATEST}>Latest</option>
                  <option value={CommentOrderType.OLDEST}>Oldest</option>
                </select>
                <Button type="submit" status="search" value="Search" className="button" />
              </form>
            </div>
          </div>

          <div className="comments-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Username')}</th>
                  <th>{t('Project Name')}</th>
                  <th>{t('Likes')}</th>
                  <th>{t('Flagged')}</th>
                  <th>{t('Created Date')}</th>
                  <th>{t('Updated Date')}</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((v) => (
                  <tr key={`comment_${v.id}`} onClick={() => setSelectedComment(v)}>
                    <td>{v?.user?.username}</td>
                    <td>{v?.project?.name}</td>
                    <td>{v?.likeCount}</td>
                    <td>{t((v.isFlagged) ? 'Yes' : 'No')}</td>
                    <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                    <td>{DateTime.fromISO(v.updatedAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!comments.length && <div className="no-results">{t('No Results')}</div>}
            <div className="comments-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      <CommentModal
        show={!!selectedComment}
        handleClose={() => setSelectedComment(null)}
        comment={selectedComment}
        refreshComments={fetchComments}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Comments;
