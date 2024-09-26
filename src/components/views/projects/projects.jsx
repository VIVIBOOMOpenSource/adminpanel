import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './projects.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import { ProjectOrderType } from 'src/enums/ProjectOrderType';
import { ProjectBadgeStatusType } from 'src/enums/ProjectBadgeStatusType';

import ProjectCategoryApi from 'src/apis/viviboom/ProjectCategoryApi';
import ProjectApi from 'src/apis/viviboom/ProjectApi';
import UserApi from 'src/apis/viviboom/UserApi';

import ProjectModal from './project-modal';
import ProjectCategoryModal from './project-category-modal';

const DEFAULT_LIMIT = 20;

const filterTabs = {
  All: { isPublished: true },
  'Work In Progress': { isPublished: true, isCompleted: false },
  Completed: { isPublished: true, isCompleted: true },
  'Badges Unsubmitted': { isPublished: true, badgeStatus: ProjectBadgeStatusType.UNSUBMITTED },
  'Badges Submitted': { isPublished: true, badgeStatus: ProjectBadgeStatusType.SUBMITTED },
  'Badges Awarded': { isPublished: true, badgeStatus: ProjectBadgeStatusType.AWARDED },
  'Badges Rejected': { isPublished: true, badgeStatus: ProjectBadgeStatusType.REJECTED },
  'Badges Resubmitted': { isPublished: true, badgeStatus: ProjectBadgeStatusType.RESUBMITTED },
  Drafts: { isPublished: false },
};

function Projects({ authToCreate, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'project' });
  const authToken = useSelector((state) => state.user.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [filterTabKey, setFilterTabKey] = useState('All');
  const [projectCategoryId, setProjectCategoryId] = useState(-1);

  const [keywords, setKeywords] = useState('');
  const [searchBy, setSearchBy] = useState('PROJECT_TITLE');
  const [selectedUserOption, setSelectedUserOption] = useState(null); // if search by user
  const [order, setOrder] = useState(ProjectOrderType.LATEST);

  const [projects, setProjects] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [showNewProjectCategory, setShowNewProjectCategory] = useState(false);
  const [selectedProjectCategory, setSelectedProjectCategory] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API Calls
  const fetchCategories = useCallback(async () => {
    if (!authToken) return;

    setCategoriesLoading(true);
    try {
      const res = await ProjectCategoryApi.getList({ authToken });
      setProjectCategories(res.data?.projectCategories);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setCategoriesLoading(false);
  }, [authToken]);

  const fetchProjects = useCallback(async (newPage = page) => {
    setProjects([]);

    const requestParams = {
      authToken,
      branchId: branch.id,
      ...filterTabs[filterTabKey],
      verboseAttributes: ['badges'],
      order,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };
    // if projectCategoryId is undefined, fetch all projects, else:
    if (projectCategoryId > 0) requestParams.projectCategoryId = projectCategoryId;
    if (searchBy === 'USER_USERNAME') {
      if (selectedUserOption) requestParams.authorUserId = selectedUserOption.value.id;
    } else if (keywords) {
      requestParams.keywords = keywords;
    }

    setLoading(true);
    try {
      const res = await ProjectApi.getList(requestParams);
      setProjects(res.data?.projects);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [page, authToken, branch, filterTabKey, order, projectCategoryId, searchBy, keywords, selectedUserOption]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProjects();
  }, [page, projectCategoryId, filterTabKey, order]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchProjects(1);
  }, [branch]);

  const handleClose = () => {
    setSelectedProject(null);
    setSelectedProjectCategory(null);
    setShowNewProjectCategory(false);
  };

  const handleFilterTabClick = (key) => () => {
    setPage(1);
    setTotalPages(1);
    setKeywords('');
    setProjectCategoryId(-1);
    setSearchBy('PROJECT_TITLE');
    setOrder(ProjectOrderType.LATEST);
    setFilterTabKey(key);
  };

  const handleCategoryClick = (id, index) => () => {
    if (id === projectCategoryId && id > 0) {
      setSelectedProjectCategory(projectCategories[index]);
    } else {
      setPage(1);
      setTotalPages(1);
      setKeywords('');
      setFilterTabKey('All');
      setSearchBy('PROJECT_TITLE');
      setOrder(ProjectOrderType.LATEST);
      setProjectCategoryId(id);
    }
  };

  const loadUserOptions = async (userSearchKeywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        // branchId: branch.id
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

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    setFilterTabKey('All');
    setProjectCategoryId(-1);
    setPage(1);
    setTotalPages(1);
    await fetchProjects(1);
  };

  const handleOrderChange = async (e) => {
    setOrder(e.target.value);
    setPage(1);
    setTotalPages(1);
  };

  return (
    <div className="projects">
      <div className="projects-container">
        <div className="projects-container-left">
          <h1>{t('Projects')}</h1>

          <h4>{t('Project Filters')}</h4>
          <ul className="project-sort hlo">
            {Object.keys(filterTabs).map((key) => (
              <li
                key={`tab-${key}`}
                className={filterTabKey === key ? 'active' : ''}
                onClick={handleFilterTabClick(key)}
              >
                {t(key)}
              </li>
            ))}
          </ul>
          <ul className="project-category">
            <li className={(projectCategoryId === -1) ? 'all-category active' : 'all-category'} onClick={handleCategoryClick(-1)}>{t('All Categories')}</li>
            {projectCategories.map((v, index) => (
              <li
                key={`project-category_${v.id}`}
                className={projectCategoryId === v.id ? 'active' : ''}
                onClick={handleCategoryClick(v.id, index)}
              >
                {v.name}
              </li>
            ))}
            <Loading show={categoriesLoading} size="24px" />
          </ul>
          <Button
            disabled={!authToCreate}
            status="add"
            onClick={() => setShowNewProjectCategory(true)}
          >
            {t('New Category')}
          </Button>
        </div>
        <div className="projects-container-center">
          <div className="projects-container-top">
            <div className="projects-search">
              <form onSubmit={handleSearchSubmit}>
                {searchBy === 'PROJECT_TITLE' ? (
                  <input
                    className="search-projects"
                    type="text"
                    value={keywords}
                    placeholder={t('Search Projects')}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                ) : (
                  <AsyncPaginate
                    className="select-users"
                    placeholder={t('Select Users')}
                    isClearable
                    debounceTimeout={300}
                    cacheUniqs={[searchBy]}
                    value={selectedUserOption}
                    loadOptions={loadUserOptions}
                    onChange={setSelectedUserOption}
                  />
                )}
                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                  <option value="PROJECT_TITLE">{t('title')}</option>
                  <option value="USER_USERNAME">{t('username')}</option>
                </select>
                <select value={order} onChange={handleOrderChange}>
                  <option value={ProjectOrderType.LATEST}>{t('Latest')}</option>
                  <option value={ProjectOrderType.OLDEST}>{t('Oldest')}</option>
                </select>
                <Button type="submit" status="search" value={t('Search')} className="button" />
              </form>
            </div>
          </div>
          <div className="projects-main">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Branch')}</th>
                  <th>{t('Name')}</th>
                  <th>{t('Authors')}</th>
                  <th>{t('Project Status')}</th>
                  <th>{t('Badge Status')}</th>
                  <th>{t('Created Date')}</th>
                  <th>{t('Updated Date')}</th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((v) => (
                  <tr key={`project_${v.id}`} onClick={() => setSelectedProject(v)}>
                    <td>{v?.branch?.name}</td>
                    <td>{v?.name}</td>
                    <td>{v?.authorUsers?.length > 2 ? `${v?.authorUsers[0].username} and others` : v?.authorUsers?.map((u) => u.username).filter(Boolean).join(', ')}</td>
                    <td>{t(v?.isCompleted ? 'Completed' : 'Work In Progress')}</td>
                    <td>{t(v?.badgeStatus?.toLowerCase())}</td>
                    <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                    <td>{DateTime.fromISO(v.updatedAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!projects.length && <div className="no-results">{t('No Results')}</div>}
            <div className="projects-main-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      <ProjectCategoryModal
        show={selectedProjectCategory || showNewProjectCategory}
        handleClose={handleClose}
        refreshCategories={fetchCategories}
        projectCategory={selectedProjectCategory}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />

      <ProjectModal
        show={selectedProject}
        handleClose={handleClose}
        refreshProjects={fetchProjects}
        project={selectedProject}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Projects;
