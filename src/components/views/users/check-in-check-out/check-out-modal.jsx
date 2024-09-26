import React, {
  useState, useEffect, useCallback,
} from 'react';
import './check-in-check-out.scss';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import AttendanceApi from 'src/apis/viviboom/AttendanceApi';
import { EventQuestionType } from 'src/enums/EventQuestionType';
import EventApi from 'src/apis/viviboom/EventApi';
import { EventQuestionDestinationType } from 'src/enums/EventQuestionDestinationType';
import Loading from 'src/components/common/loading/loading';
import Modal from '../../../common/modal/modal';
import Excellent from '../../../../css/imgs/feedback-excellent.png';
import Good from '../../../../css/imgs/feedback-good.png';
import Terrible from '../../../../css/imgs/feedback-terrible.png';
import Mediocre from '../../../../css/imgs/feedback-mediocre.png';

const ratings = [
  { name: 'Excellent', image: Excellent },
  { name: 'Good', image: Good },
  { name: 'Mediocre', image: Mediocre },
  { name: 'Terrible', image: Terrible },
];

function CheckOutModal({
  isVisitor, show, handleClick, handleClose, user, authToken, attendance,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });

  const [success, setSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [visitorEmail, setVisitorEmail] = useState(attendance?.visitorEmail || '');
  const [selectedRatingIndex, setSelectedRatingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom form feedbacks
  const [input, setInput] = useState({});
  const [checkoutQuestions, setCheckoutQuestions] = useState([]);

  const fetchQuestions = useCallback(async () => {
    if (!attendance?.eventId) return;
    try {
      const requestParams = {
        authToken,
        eventId: attendance.eventId,
      };

      const res = await EventApi.get(requestParams);
      const eventQuestions = res?.data?.eventQuestions;
      const checkoutQuestionsRaw = eventQuestions?.filter((q) => q.destination === EventQuestionDestinationType.CHECKOUT);
      setCheckoutQuestions(checkoutQuestionsRaw);
      setVisitorEmail(attendance?.visitorEmail || '');
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  }, [attendance, authToken]);

  const updateAttendance = useCallback(async (isVisitorAttendance) => {
    try {
      const requestParams = {
        authToken,
        checkOutAt: new Date().toISOString(),
      };

      if (isVisitorAttendance) {
        requestParams.visitorName = user?.visitorName;
        requestParams.attendanceId = user?.id;
        if (visitorEmail !== '') {
          requestParams.visitorEmail = visitorEmail;
        }
      } else {
        requestParams.attendanceId = attendance.id;
      }

      if (selectedRatingIndex !== null) {
        requestParams.rating = ratings[selectedRatingIndex].name.toUpperCase();
      }

      if (feedbackText !== '') {
        requestParams.feedbackNotes = feedbackText;
      }

      await AttendanceApi.patch(requestParams);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  }, [authToken, feedbackText, user?.id, user?.visitorName, selectedRatingIndex, visitorEmail, attendance]);

  const postAttendanceResponses = useCallback(async () => {
    const responses = [];

    checkoutQuestions?.forEach((q) => {
      if (q.type === EventQuestionType.MULTIPLE) responses.push(...input[q.id].map((response) => ({ eventQuestionId: q.id, response })));
      else responses.push({ eventQuestionId: q.id, response: input[q.id] });
    });

    try {
      if (responses && responses.length > 0) {
        const requestBody = {
          authToken,
          eventId: attendance.eventId,
          attendanceId: attendance.id,
          responses,
        };

        await EventApi.postAttendanceResponse(requestBody);
      }
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  }, [authToken, attendance, checkoutQuestions, input]);

  const handleFeedbackChange = (event) => {
    setFeedbackText(event.target.value);
  };

  const handleEmailChange = (event) => {
    setVisitorEmail(event.target.value);
  };

  const handleRatingClick = (index) => {
    setSelectedRatingIndex(index);
  };

  const handleRatingQuestionClick = (question, index) => {
    setInput({ ...input, [question.id]: ratings[index].name.toUpperCase() });
    handleRatingClick(index);
  };

  const closeModal = (e) => {
    e.preventDefault();
    setSelectedRatingIndex(null);
    setFeedbackText('');
    setVisitorEmail('');
    setSuccess(false);
    handleClick();
  };

  const closeSuccessModal = () => {
    setSuccess(false);
    handleClose();
  };

  const checkOut = async (event) => {
    event.preventDefault();
    setLoading(true);
    await updateAttendance(isVisitor);
    await postAttendanceResponses();
    toast.success(('You have checked out!'));
    handleClose();
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // multiple response questions are special case. An array attribute is added for input element to track whether the boxes are checked.
  // a value atribute is added for input elememt to track what are the responses to submit.
  const handleMultiResponse = (event, eventQuestionId) => {
    // console.log(event.target);
    const multiQuestionResponses = [...(input[eventQuestionId] ?? [])];

    // find the index of the changed option if exists
    const modifiedIdx = multiQuestionResponses.findIndex((r) => r === event.target.value);

    // if exists and unchecked, delete, if does not exists and checked, insert
    if (modifiedIdx >= 0) {
      if (!event.target.checked) multiQuestionResponses.splice(modifiedIdx, 1);
    } else if (event.target.checked) multiQuestionResponses.push(event.target.value);
    setInput({ ...input, [eventQuestionId]: multiQuestionResponses });
  };

  return (
    <Modal
      className="check-in-modal"
      show={show}
      handleClose={success ? closeSuccessModal : closeModal}
    >
      <form onSubmit={checkOut}>
        <div className="checkout-popup">
          <h1>
            {t('Thank you for joining us today,')}
            {' '}
            {isVisitor ? (
              user?.visitorName
            ) : (
              `${user?.givenName} ${user?.familyName}`
            )}
            !
          </h1>
          <div className="feedback">
            {!attendance?.eventId && ( // Show default questions if this is a crew invite
              <>
                <h3>
                  {t('How was the session?')}
                </h3>
                {ratings.map((rating, index) => (
                  <div key={index} className={selectedRatingIndex === index ? 'ratings selected' : 'ratings'} onClick={() => handleRatingClick(index)}>
                    <img src={rating.image} alt="" width="50" height="50" />
                    <p>{rating.name}</p>
                  </div>
                ))}
                <h3>
                  {t('Feedback for the session (if any)')}
                  :
                </h3>
                <textarea
                  value={feedbackText}
                  onChange={handleFeedbackChange}
                  placeholder="Leave feedback..."
                  className="feedback-box"
                />
              </>
            )}
            <div className="checkout-form">
              {checkoutQuestions && checkoutQuestions.map((q) => {
                switch (q.type) {
                  case (EventQuestionType.SINGLE):
                    return (
                      <label key={`question_${q.id}`}>
                        <h3>{q.question}</h3>
                        <select onChange={(e) => setInput({ ...input, [q.id]: e.target.value })}>
                          <option value="" default>{t('Select an option')}</option>
                          {q.answerOptions.map((option) => <option value={option.answer} key={option.id}>{option.answer}</option>)}
                        </select>
                      </label>
                    );
                  case (EventQuestionType.MULTIPLE):
                    return (
                      <div key={`question_${q.id}`} className="multiple">
                        <h3>{q.question}</h3>
                        <fieldset>
                          {q.answerOptions.map((option) => (
                            <label className="form-option" key={option.id}>
                              <input
                                type="checkbox"
                                value={option.answer}
                                onChange={(e) => handleMultiResponse(e, q.id)}
                              />
                              {option.answer}
                            </label>
                          ))}
                        </fieldset>
                        <input className="required-box" type="text" />
                      </div>
                    );
                  case (EventQuestionType.TEXT):
                    return (
                      <label key={`question_${q.id}`}>
                        <h3>{q.question}</h3>
                        <textarea
                          placeholder="your answer"
                          onChange={(e) => setInput({ ...input, [q.id]: e.target.value })}
                          className="feedback-box"
                        />
                      </label>
                    );
                  case (EventQuestionType.RATING):
                    return (
                      <div key={`question_${q.id}`}>
                        <h3>
                          {t('How was the session?')}
                        </h3>
                        {ratings.map((rating, index) => (
                          <div key={index} className={selectedRatingIndex === index ? 'ratings selected' : 'ratings'} onClick={() => handleRatingQuestionClick(q, index)}>
                            <img src={rating.image} alt="" width="50" height="50" />
                            <p>{rating.name}</p>
                          </div>
                        ))}
                        <input className="required-box" type="text" />
                      </div>
                    );
                  default:
                    break;
                }
                return null;
              })}
            </div>
            {isVisitor && (
            <>
              <h3>
                {t('Please leave your email address if you would like us to contact you in the future')}
                :
              </h3>
              <textarea
                value={visitorEmail}
                onChange={handleEmailChange}
                placeholder="Email address"
                className="feedback-box email"
              />
            </>
            )}
          </div>
          <div className="button-container">
            <button className="modal-btn-back" onClick={closeModal} type="button">{t('This is not me')}</button>
            <button disabled={loading} className={`modal-btn ${loading ? 'disabled' : ''}`} type="submit">{loading ? <Loading show size="24px" /> : t('Submit')}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CheckOutModal;
