import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import './select-portfolio.scss';

import ProjectApi from 'src/apis/viviboom/ProjectApi';
import { ProjectOrderType } from 'src/enums/ProjectOrderType';
import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import MyImage from 'src/components/common/MyImage';
import DefaultProjectPicture from 'src/css/imgs/default-project-picture.png';

const DEFAULT_PROJECT_ITEM_IMAGE_WIDTH = 512;
const DEFAULT_LIMIT = 3;

function SelectPortfolioProjects({
  show, setPrevProjects, projects, setProjects, headingProject, setHeadingProject, portfolioId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const allProjectsRef = useRef(null);

  const fetchAllProjects = useCallback(async () => {
    if (!user?.authToken) return;
    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      order: ProjectOrderType.LATEST,
      isCompleted: true,
      isPublished: true,
    };
    if (keywords) requestParams.keywords = keywords;
    setLoading(true);
    try {
      const res = await ProjectApi.getList(requestParams);
      setAllProjects(res.data?.projects);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, page, keywords]);

  const fetchSelectedProjects = useCallback(async () => {
    if (!user?.authToken || !portfolioId) return;
    const requestParams = {
      authToken: user.authToken,
      isPublished: true,
      portfolioId,
    };
    setLoading(true);
    try {
      const res = await ProjectApi.getList(requestParams);
      setProjects(res.data?.projects);
      setPrevProjects(res.data?.projects);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [user.authToken, portfolioId, setProjects, setPrevProjects]);

  const handleProjectToggle = (project) => () => {
    if (!projects.find((p) => p.id === project.id)) {
      setProjects([...projects, project]);
    } else {
      setProjects(projects.filter((p) => p.id !== project.id));
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedProjects = Array.from(projects);
    const [movedProject] = updatedProjects.splice(source.index, 1);
    updatedProjects.splice(destination.index, 0, movedProject);
    setProjects(updatedProjects);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    setKeywords(keywordInput);
  };

  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects]);

  useEffect(() => {
    fetchSelectedProjects();
  }, [fetchSelectedProjects]);

  return show && (
    <div className="select-portfolio-items">
      <div className="selected-items">
        <div className="section-title">
          {t('Selected Projects')}
        </div>
        <div className="section-subtext">
          {t('Drag and drop the projects to change the order they appear on your public portfolio page')}
        </div>
        <div className="drag-container">
          <input
            className="heading"
            type="text"
            value={headingProject}
            placeholder={t('Add a heading for the project section (optional)')}
            onChange={(e) => setHeadingProject(e.target.value)}
          />
          {projects?.length === 0 && <div className="no-items">{t('No projects has been selected for this page yet')}</div>}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="item-list" direction="horizontal">
              {(provided) => (
                <ul className="item-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {projects.map((v, index) => (
                    <Draggable key={v.id} draggableId={v.id.toString()} index={index}>
                      {(provided) => (
                        <li key={`user-project+${v.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="item-container selected">
                            <div className="item-image">
                              <MyImage
                                src={v?.thumbnailUri || v?.images[0]?.uri || DefaultProjectPicture}
                                alt="project"
                                width={DEFAULT_PROJECT_ITEM_IMAGE_WIDTH}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-title">
                                {v?.name}
                              </div>
                              <div className={v?.description === '' ? 'no-item-desc' : 'item-desc'}>{v?.description}</div>
                            </div>
                            <div className="item-btn">
                              <button onClick={handleProjectToggle(v)} type="submit" className="item-button remove">{t('Remove Project')}</button>
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
              {t('All Projects')}
            </div>
            <div className="section-subtext">
              {t('Only completed projects are shown here')}
            </div>
          </div>
          <div className="section-header-right">
            <input
              className="search-portfolios"
              type="text"
              value={keywordInput}
              placeholder={t('Search Projects')}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
          </div>
        </div>
        <div className="drag-container" ref={allProjectsRef}>
          {allProjects?.length === 0 && <div className="no-items">{t('No project found')}</div>}
          <ul className="item-list unselected">
            {allProjects.map((v) => (
              <li key={`user-project+${v.id}`}>
                <div className={`item-container${projects.find((p) => p.id === v.id) ? ' is-selected' : ''}`}>
                  <div className="item-image">
                    <MyImage
                      src={v?.thumbnailUri || v?.images[0]?.uri || DefaultProjectPicture}
                      alt="project"
                      width={DEFAULT_PROJECT_ITEM_IMAGE_WIDTH}
                      isLoading={loading}
                    />
                  </div>
                  <Loading show={loading} size="24px" />
                  <div className="item-details">
                    <div className="item-title">
                      {v?.name}
                    </div>
                    <div className={v?.description === '' ? 'no-item-desc' : 'item-desc'}>{v?.description}</div>
                  </div>
                  <div className="item-btn">
                    {projects.find((p) => p.id === v.id) ? (
                      <span className="selected-text">{t('Selected! Scroll up to rearrange / remove project!')}</span>
                    ) : (
                      <button onClick={handleProjectToggle(v)} type="submit" className="item-button">{t('Select Project')}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-footer">
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} scrollToRef={allProjectsRef.current} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectPortfolioProjects;
