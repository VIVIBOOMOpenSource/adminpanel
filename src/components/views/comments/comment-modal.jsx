import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import './comment-modal.scss';

import Config from 'src/config';
import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';

import CommentApi from 'src/apis/viviboom/CommentApi';

function CommentModal({
  show,
  handleClose,
  refreshComments,
  comment,
  authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'comment' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);

  // approve := unflag
  const unflagComment = useCallback(async () => {
    setLoading(true);
    try {
      await CommentApi.patch({
        authToken,
        commentId: comment.id,
        isFlagged: false,
      });
      toast.success(t('Comment unflagged'));
      await refreshComments();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [authToken, comment, refreshComments, t]);

  const deleteComment = useCallback(async () => {
    if (window.confirm(t('DELETE! Are you absolutely certain that you want to DELETE this comment?'))) {
      setLoading(true);
      try {
        await CommentApi.deleteComment({ authToken, commentId: comment.id });
        toast.success(t('Comment deleted'));
        await refreshComments();
        handleClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  }, [authToken, comment, handleClose, refreshComments, t]);

  return (
    <Modal className="comment-modal" show={show} handleClose={handleClose}>
      <div className="comment-modal-div">
        <h3>{t('View Comment')}</h3>
        <div className="item">
          <label>{t('Comment ID')}</label>
          <input type="text" value={comment?.id || ''} disabled />
        </div>

        <div className="item">
          <label>{t('User')}</label>
          <a target="_blank" rel="noreferrer" href={`${Config.Common.FrontEndUrl}/member/${comment?.userId}`}>{comment?.user?.username}</a>
        </div>

        <div className="item">
          <label>{t('Project')}</label>
          <a target="_blank" rel="noreferrer" href={`${Config.Common.FrontEndUrl}/project/${comment?.projectId}`}>{comment?.project?.name}</a>
        </div>

        <div className="item">
          <label>{t('Text')}</label>
          <textarea disabled value={comment?.text || ''} rows={5} />
        </div>

        <div className="buttons">
          <Button disabled={!comment?.isFlagged || !authToUpdate} status={loading ? 'loading' : ''} onClick={unflagComment}>{t('Unflag Comment')}</Button>
          <Button disabled={!authToUpdate} status={loading ? 'loading' : 'delete'} onClick={deleteComment}>{t('Delete Comment')}</Button>
        </div>
      </div>
    </Modal>
  );
}

export default CommentModal;
