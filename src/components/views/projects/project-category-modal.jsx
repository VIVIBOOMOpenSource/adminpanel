import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import './project-category-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';

import ProjectCategoryApi from 'src/apis/viviboom/ProjectCategoryApi';

function ProjectCategoryModal({
  show, handleClose, refreshCategories, projectCategory, authToCreate, authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'project' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // load data if exists
  useEffect(() => {
    if (projectCategory) {
      setName(projectCategory.name);
      setDescription(projectCategory.description);
    }
  }, [projectCategory]);

  const saveCategory = useCallback(async () => {
    if (!name) return toast.error(t('A name is required for project category'));
    setLoading(true);
    try {
      if (!projectCategory) {
        await ProjectCategoryApi.post({ authToken, name, description });
        toast.success(t('Project category added'));
      } else {
        await ProjectCategoryApi.patch({
          authToken, projectCategoryId: projectCategory.id, name, description,
        });
        toast.success(t('Project category edited'));
      }
      await refreshCategories();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    return setLoading(false);
  }, [authToken, projectCategory, description, name, refreshCategories, t]);

  const handleModalClose = () => {
    setLoading(false);
    setName('');
    setDescription('');
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCategory();
    handleModalClose();
  };

  const deleteCategory = async () => {
    if (window.confirm(t('Delete category?'))) {
      setLoading(true);
      try {
        await ProjectCategoryApi.deleteProjectCategory({ authToken, projectCategoryId: projectCategory.id });
        toast.success(t('Project category deleted'));
        await refreshCategories();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
      setLoading(false);
    }
  };

  return (
    <Modal
      className="project-category-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <h3>{t('Add/Modify Project Category')}</h3>
        <form onSubmit={handleSubmit}>
          <label>{t('Name')}</label>
          <input
            type="text"
            value={name}
            disabled={loading || !authToUpdate}
            onChange={(e) => setName(e.target.value)}
          />
          <label>{t('Description')}</label>
          <textarea
            value={description}
            disabled={loading || !authToUpdate}
            onChange={(e) => setDescription(e.target.value)}
          />

          {projectCategory && (
            <>
              <div className="created-date">
                <label>{t('Created Date')}</label>
                <div>{DateTime.fromISO(projectCategory.createdAt).toLocaleString(DateTime.DATE_MED)}</div>
              </div>
              <Button
                parentClassName="delete-category"
                type="button"
                disabled={!authToCreate}
                onClick={deleteCategory}
              >
                {t('Delete Category')}
              </Button>
            </>
          )}
          <Button type="submit" disabled={!authToUpdate} status={loading ? 'loading' : 'save'} value={t('Save')} />
        </form>
      </div>
    </Modal>
  );
}

export default ProjectCategoryModal;
