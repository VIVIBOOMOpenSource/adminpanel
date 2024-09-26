import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import './badge-category-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';

import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';

function BadgeCategoryModal({
  show, handleClose, refreshCategories, badgeCategory, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // load data if exists
  useEffect(() => {
    if (badgeCategory) {
      setName(badgeCategory.name);
      setDescription(badgeCategory.description);
    }
  }, [badgeCategory]);

  const saveCategory = useCallback(async () => {
    if (!name) return toast.error(t('A name is required for badge category'));
    setLoading(true);
    try {
      if (!badgeCategory) {
        await BadgeCategoryApi.post({ authToken, name, description });
        toast.success(t('Badge category added.'));
      } else {
        await BadgeCategoryApi.patch({
          authToken, badgeCategoryId: badgeCategory.id, name, description,
        });
        toast.success(t('Badge category edited.'));
      }
      await refreshCategories();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    return setLoading(false);
  }, [authToken, badgeCategory, description, name, refreshCategories, t]);

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
    if (window.confirm(`${t('Delete Category')}?`)) {
      setLoading(true);
      try {
        await BadgeCategoryApi.deleteBadgeCategory({ authToken, badgeCategoryId: badgeCategory.id });
        toast.success(t('Badge category deleted'));
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
    <Modal className="badge-category-modal" show={show} handleClose={handleModalClose}>
      <div>
        <h3>{t('Add/Modify Badge Category')}</h3>
        <form onSubmit={handleSubmit}>
          <label>{t('Name')}</label>
          <input
            type="text"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
          />
          <label>{t('Description')}</label>
          <textarea
            value={description}
            disabled={loading}
            onChange={(e) => setDescription(e.target.value)}
          />

          {badgeCategory && (
            <>
              <div className="created-date">
                <label>{t('Created Date')}</label>
                <div>{DateTime.fromISO(badgeCategory.createdAt).toLocaleString(DateTime.DATE_MED)}</div>
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
          <Button type="submit" status={(loading) ? 'loading' : 'save'} value={t('Save')} disabled={!authToUpdate} />
        </form>
      </div>
    </Modal>
  );
}

export default BadgeCategoryModal;
