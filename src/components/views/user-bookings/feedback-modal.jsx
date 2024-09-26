import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import Modal from 'src/components/common/modal/modal';
import './feedback-modal.scss';
import AttendanceApi from 'src/apis/viviboom/AttendanceApi';

import Button from 'src/components/common/button/button';
import EventApi from 'src/apis/viviboom/EventApi';
import { EventQuestionDestinationType } from 'src/enums/EventQuestionDestinationType';
import UserQuestionResponses from './user-question-responses';

function FeedbackModal({
  show, handleClose, refreshFeedback, attendance, authToken,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'userBooking' });
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutResponses, setCheckoutResponses] = useState([]);

  const fetchCheckoutResponses = useCallback(async () => {
    if (!attendance?.eventId) {
      setCheckoutResponses([]);
      return;
    }

    try {
      const requestBody = {
        authToken,
        eventId: attendance.eventId,
        attendanceId: attendance.id,
      };

      const res = await EventApi.getAttendanceResponse(requestBody);
      const { responses } = res.data;
      // group by event question id
      const checkoutResponsesByQuestionId = {};
      responses?.forEach((resp) => {
        const { userResponse } = resp;
        if (!(userResponse.eventQuestionId in checkoutResponsesByQuestionId)) checkoutResponsesByQuestionId[userResponse.eventQuestionId] = [];
        checkoutResponsesByQuestionId[userResponse.eventQuestionId].push(userResponse);
      });

      setCheckoutResponses(checkoutResponsesByQuestionId);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  }, [attendance, authToken]);

  const saveAdminNotes = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        attendanceId: attendance.id,
      };

      if (adminNotes !== '') {
        requestParams.adminNotes = adminNotes;
      }

      await AttendanceApi.patch(requestParams);
      await refreshFeedback();
      toast.success(('Admin notes modifed'));
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [adminNotes, authToken, attendance, handleClose, refreshFeedback]);

  useEffect(() => {
    if (attendance) {
      if (attendance.adminNotes) {
        setAdminNotes(attendance.adminNotes);
      } else {
        setAdminNotes('');
      }
      if (attendance.feedbackNotes) {
        setFeedbackNotes(attendance.feedbackNotes);
      } else {
        setFeedbackNotes('');
      }
    }
  }, [attendance]);

  useEffect(() => {
    fetchCheckoutResponses();
  }, [fetchCheckoutResponses]);

  const handleSave = async () => {
    await saveAdminNotes();
  };

  return (
    <Modal
      className="feedback-modal"
      show={show}
      handleClose={handleClose}
    >
      {!attendance?.eventId && (
        <div>
          <label>
            {t('Feedback')}
            :
            {' '}
            {feedbackNotes === '' ? 'No feedback given by attendee' : feedbackNotes}
          </label>
          <br />
        </div>
      )}
      {Object.keys(checkoutResponses).map((eventQuestionId, index) => (
        <UserQuestionResponses
          responses={checkoutResponses}
          eventQuestionId={eventQuestionId}
          index={index}
          key={`checkout-response_${eventQuestionId}`}
        />
      ))}
      <div>
        <label>
          {t('Admin Notes')}
          :
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Include any notes about this particular attendance here..."
        />
      </div>
      <div>
        <Button type="submit" status={loading ? 'loading' : 'save'} value="Save" onClick={handleSave} />
      </div>
    </Modal>
  );
}

export default FeedbackModal;
