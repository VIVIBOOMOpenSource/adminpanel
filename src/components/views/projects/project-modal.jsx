import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Config from 'src/config';

import './project-modal.scss';

import Button from 'src/components/common/button/button';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';
import Modal from 'src/components/common/modal/modal';
import MyImage from 'src/components/common/MyImage';
import BadgeSvg from 'src/css/imgs/icon-badge.svg';
import PersonSvg from 'src/css/imgs/icon-person.svg';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import { ProjectBadgeStatusType } from 'src/enums/ProjectBadgeStatusType';

import ProjectApi from 'src/apis/viviboom/ProjectApi';
import UserApi from 'src/apis/viviboom/UserApi';
import Loading from 'src/components/common/loading/loading';
import { ProjectAuthorRoleType, projectAuthorRoleTypes } from 'src/enums/ProjectAuthorRoleType';

const badgeImageParams = { suffix: 'png' };
const DEFAULT_LIMIT = 20;

function getArrayForUpdate(prevArr, arr) {
  return [
    // new items
    ...arr.filter((item1) => !prevArr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, role: item.role })),
    // edit items
    ...arr.filter((item1) => prevArr.find((item2) => item1.id === item2.id && item1.role !== item2.role)).map((item) => ({ id: item.id, role: item.role })),
    // deleted items
    ...prevArr.filter((item1) => !arr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, isDelete: true })),
  ];
}

function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.profileImageUri} alt={value?.name} preloadImage={PersonSvg} defaultImage={PersonSvg} width={64} />
        {children}
      </div>
    </components.Option>
  );
}

function ProjectModal({
  show, handleClose, refreshProjects, project, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'project' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(1);

  const [adminNotes, setAdminNotes] = useState('');
  const [selectedOwnerOption, setSelectedOwnerOption] = useState(null); // owner
  const [selectedUserOption, setSelectedUserOption] = useState(null); // author

  // project ownership
  const [prevProjectAuthors, setPrevProjectAuthors] = useState([]);
  const [projectAuthors, setProjectAuthors] = useState([]);

  const approveProject = useCallback(async () => {
    setLoading(true);
    try {
      await ProjectApi.patch({
        authToken,
        projectId: project.id,
        badgeStatus: ProjectBadgeStatusType.AWARDED,
        adminNotes,
      });
      toast.success(t('Project Approved'));
      await refreshProjects();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [authToken, project, adminNotes, refreshProjects, t]);

  const rejectProject = useCallback(async () => {
    setLoading(true);
    try {
      await ProjectApi.patch({
        authToken,
        projectId: project.id,
        badgeStatus: ProjectBadgeStatusType.REJECTED,
        adminNotes,
      });
      toast.success(t('Project Rejected'));
      await refreshProjects();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [authToken, project, adminNotes, refreshProjects, t]);

  const fetchProjectAuthors = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        projectId: project?.id,
        orderKey: 'username',
        orderDirection: 'asc',
      };

      const res = await UserApi.getList(requestParams);
      const filteredUsers = res.data?.users?.map((u) => ({
        id: u.id, username: u.username, name: u.name, profileImageUri: u.profileImageUri, role: u.authoredProjects?.[0]?.role, roleDescription: u.authoredProjects?.[0]?.description,
      }));
      setProjectAuthors(filteredUsers);
      setPrevProjectAuthors(filteredUsers);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [authToken, project]);

  const handleModalClose = () => {
    setLoading(false);
    setAdminNotes('');
    setTab(1);
    setSelectedOwnerOption(null);
    setSelectedUserOption(null);
    handleClose();
  };

  const deleteProject = async () => {
    if (window.confirm(t('DELETE! Are you absolutely certain that you want to DELETE this project?'))) {
      setLoading(true);
      try {
        await ProjectApi.deleteProject({ authToken, projectId: project.id });
        toast.success(t('Project Deleted'));
        await refreshProjects();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const handleAddAuthor = () => {
    setProjectAuthors([...projectAuthors, { ...selectedUserOption.value, role: ProjectAuthorRoleType.MAKER }]);
    setSelectedUserOption(null);
  };

  const handleChangeAuthor = (userId, data) => {
    const newProjectAuthors = [...projectAuthors];
    const userIndex = newProjectAuthors.findIndex((u) => u.id === userId);
    newProjectAuthors[userIndex] = { ...newProjectAuthors[userIndex], ...data };
    setProjectAuthors(newProjectAuthors);
  };

  const handleRemoveAuthor = (userId) => () => {
    setProjectAuthors(projectAuthors.filter((u) => u.id !== userId));
  };

  const onSaveAuthor = async () => {
    if (!projectAuthors.length) {
      toast.error(t('Please select at least one author from the dropdown list!'));
      return;
    }
    if (window.confirm(t('Are you sure that you want to change the project authors?'))) {
      setLoading(true);
      try {
        await ProjectApi.patch({ authToken, projectId: project.id, authorUsers: getArrayForUpdate(prevProjectAuthors, projectAuthors) });
        toast.success(t('Project Authors Changed!'));
        await refreshProjects();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const onChangeOwner = async () => {
    if (!selectedOwnerOption) {
      toast.error(t('Please select at least one user from the dropdown list!'));
      return;
    }
    if (window.confirm(t('Are you sure that you want to change the project owner?'))) {
      setLoading(true);
      try {
        await ProjectApi.patch({ authToken, projectId: project.id, authorUserId: selectedOwnerOption.value.id });
        toast.success(t('Project Owner Changed!'));
        await refreshProjects();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const loadUserOptions = (userIdsToExclude) => async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };

      if (keywords) requestParams.username = keywords;

      const res = await UserApi.getList(requestParams);
      const { users, count } = res.data;
      return {
        options: users.filter((u) => !userIdsToExclude?.find((id) => id === u.id)).map((u) => ({
          value: {
            id: u.id, username: u.username, name: u.name, profileImageUri: u.profileImageUri,
          },
          label: `${u.username}, ${u.name}`,
        })),
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

  // utility methods
  const readyToApproveOrReject = useMemo(() => project && (project.badgeStatus === ProjectBadgeStatusType.SUBMITTED || project.badgeStatus === ProjectBadgeStatusType.RESUBMITTED) && project.isCompleted, [project]);

  useEffect(() => {
    fetchProjectAuthors();
  }, [fetchProjectAuthors]);

  return (
    <Modal
      className="project-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <CarouselHeader slideTo={tab}>
          <div onClick={() => setTab(1)}>{t('Project Data')}</div>
          <div onClick={() => setTab(2)}>{t('Badge Status')}</div>
          <div onClick={() => setTab(3)}>{t('Project Ownership')}</div>
          <div onClick={() => setTab(4)}>{t('Danger Zone')}</div>
        </CarouselHeader>
        <Carousel slideTo={tab}>
          <div>
            <h1>{project?.name}</h1>
            <div className="section">
              <label>
                {t('Project Status')}
              </label>
              {project?.isCompleted ? 'Completed' : 'Work In Progress'}
            </div>
            <div className="section">
              <label>
                {t('Links')}
              </label>
              <div className="link">
                <a target="_blank" href={`${Config.Common.FrontEndUrl}/project/${project?.id}`} rel="noreferrer">
                  {t('Project Link')}
                  {' '}
                  (
                  {project?.id}
                  )
                </a>
              </div>
              <div className="link">
                <a target="_blank" href={`${Config.Common.FrontEndUrl}/edit-project/${project?.id}`} rel="noreferrer">
                  {t('Edit Project Link')}
                  {' '}
                  (
                  {project?.id}
                  )
                </a>
              </div>
              <div className="link">
                <a href={`${Config.Common.FrontEndUrl}/member/${project?.authorUserId}`}>
                  {t('Author User Link')}
                  {' '}
                  (
                  {project?.authorUserId}
                  )
                </a>
              </div>
            </div>
          </div>
          <div>
            <div className="section">
              <label>
                {t('Badge and Challenge Status')}
              </label>
              {project?.badgeStatus.toUpperCase()}
            </div>
            {project?.badges
              && (
              <div className="section">
                <label>
                  {t('Badges Awarded')}
                  {' '}
                  (
                  {project?.badges.length || 0}
                  )
                </label>
                {project?.badges.map((v) => (
                  <div key={`project_${project.id}-badge_${v.id}`}>
                    <a target="_blank" href={`${Config.Common.FrontEndUrl}/badge/${v.id}`} rel="noreferrer" className="badge-row">
                      <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={128} params={badgeImageParams} />
                      {v.name}
                    </a>
                  </div>
                ))}
              </div>
              )}
            {project?.challenges
              && (
              <div className="section">
                <label>
                  {t('Challenges Completed')}
                  {' '}
                  (
                  {project?.challenges.length || 0}
                  )
                </label>
                {project?.challenges.map((v) => (
                  <div key={`project_${project.id}-badge_${v.id}`}>
                    <a target="_blank" href={`${Config.Common.FrontEndUrl}/badge/${v.id}`} rel="noreferrer" className="badge-row">
                      <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={256} params={badgeImageParams} />
                      {v.name}
                    </a>
                  </div>
                ))}
              </div>
              )}
            <div className="section">
              <label>{t('Project Admin Notes')}</label>
              <textarea defaultValue={project?.adminNotes} disabled />
            </div>
            {readyToApproveOrReject && authToUpdate ? (
              <div className="approve-reject">
                <div className="section">
                  <label>
                    {t('Approve Requested Badges')}
                  </label>
                  <h6>
                    *
                    {t('Will go live right away if approved')}

                  </h6>
                  <div>
                    <h5>{t('Approve/Reject Notes')}</h5>
                    <textarea
                      onChange={(e) => setAdminNotes(e.target.value)}
                      value={adminNotes}
                    />
                  </div>
                </div>
                <div className="buttons">
                  <Button onClick={rejectProject}>{t('Reject')}</Button>
                  <div className="spacer" />
                  <Button onClick={approveProject}>{t('Approve')}</Button>
                </div>
              </div>
            ) : (
              <div className="approve-reject">
                {project && !project.isCompleted && <h6>{t('Only completed project can be approved/rejected for badges')}</h6>}
                {project && project.badgeStatus === ProjectBadgeStatusType.REJECTED && <h6>{t('Requested badges are rejected. Author needs to edit and re-submit request of badges')}</h6>}
                {!authToUpdate && <h6>{t('You are unauthorized to approve or reject project')}</h6>}
              </div>
            )}
          </div>
          <div>
            <div className="section">
              <div className="project-owner-container">
                <label>{t('Change Project Owner')}</label>
                <h5>{t('Choose a member to overwrite the current owner')}</h5>
                <div className="author-search">
                  <AsyncPaginate
                    isClearable
                    cacheUniqs={[project?.id]}
                    debounceTimeout={300}
                    value={selectedOwnerOption}
                    loadOptions={loadUserOptions([project?.authorUserId])}
                    onChange={setSelectedOwnerOption}
                    components={{ Option }}
                    className="author-dropdown"
                  />
                </div>
                <Button
                  parentClassName="project-btn"
                  type="button"
                  status={loading ? 'loading' : 'save'}
                  disabled={!authToUpdate}
                  onClick={onChangeOwner}
                >
                  {t('Change Owner')}
                </Button>
              </div>
            </div>
            <label>{t('Project Authors')}</label>
            <div className="section">
              <h5>{t('Choose a member to add to the coauthor list')}</h5>
              <div className="author-search">
                <AsyncPaginate
                  isClearable
                  cacheUniqs={[project?.id]}
                  debounceTimeout={300}
                  value={selectedUserOption}
                  loadOptions={loadUserOptions(projectAuthors.map((u) => u.id))}
                  onChange={setSelectedUserOption}
                  components={{ Option }}
                  className="author-dropdown"
                />
                <Button status="add" onClick={handleAddAuthor} disabled={!selectedUserOption || !authToUpdate} />
              </div>
            </div>
            <div className="project-authors">
              <div className="project-authors-ctn">
                <div className="project-authors-header">
                  <label>{t('Authors')}</label>
                </div>
                <Loading show={loading} size="32px" />
                <ul className="project-authors-list">
                  {projectAuthors.map((v) => (
                    <li key={`project_${project?.id}-author_${v.id}`}>
                      <div className="author-info">
                        <MyImage src={v?.profileImageUri} alt={v?.name} preloadImage={PersonSvg} defaultImage={PersonSvg} width={64} />
                        <div>
                          {v.username}
                          ,
                          {' '}
                          {v.name}
                          {v.id === project?.authorUserId ? ' (Owner)' : ''}
                        </div>
                      </div>
                      <div className="author-right">
                        <select
                          className="author-role"
                          onChange={(e) => handleChangeAuthor(v.id, { role: e.target.value })}
                          value={v.role}
                          disabled={loading || !authToUpdate}
                          required
                        >
                          {projectAuthorRoleTypes.map((type) => <option key={`role-${type}`} value={type}>{type}</option>)}
                        </select>
                        <Button status={loading ? 'loading' : 'minus'} parentClassName="author-button" onClick={handleRemoveAuthor(v.id)} disabled={v.id === project?.authorUserId || !authToUpdate} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <label>{t('Delete this project?')}</label>
          </div>
        </Carousel>
        {tab === 3 && (
          <Button
            parentClassName={tab < 3 ? 'hide' : 'project-btn'}
            type="button"
            status={loading ? 'loading' : 'save'}
            disabled={!authToUpdate}
            onClick={onSaveAuthor}
          >
            {t('Save Authors')}
          </Button>
        )}
        {tab === 4 && (
          <Button
            parentClassName={tab < 3 ? 'hide' : 'danger-btn'}
            type="button"
            status={loading ? 'loading' : 'delete'}
            disabled={!authToCreate}
            onClick={deleteProject}
          >
            {t('Delete Project')}
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default ProjectModal;