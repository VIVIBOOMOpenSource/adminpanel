import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './survey-question.scss';

import { ReactComponent as BackArrowSVG } from 'src/css/imgs/icon-arrow-back.svg';
import { ReactComponent as ForwardArrowSVG } from 'src/css/imgs/icon-arrow-forward.svg';
import { ReactComponent as DeleteSVG } from 'src/css/imgs/icon-delete.svg';
import { ReactComponent as EditSVG } from 'src/css/imgs/icon-edit.svg';
import { ReactComponent as SaveSVG } from 'src/css/imgs/icon-save.svg';
import { EventQuestionType } from 'src/enums/EventQuestionType';

import QuestionForm from './question-form';

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

export default function SurveyQuestion({
  authToUpdate,
  index,
  eventQuestion,
  allQuestions,
  setQuestion,
  removeQuestion,
  moveQuestionUp,
  moveQuestionDown,
  isWorkshopSurvey,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const [editing, setEditing] = useState(false);
  function toggleEditing() {
    setEditing(!editing);
  }

  return (
    <li className="question-field">
      <p className="question-index">
        {index + 1}
        .
      </p>
      <div className="question-container">
        {editing ? (
          <QuestionForm
            question={eventQuestion}
            allQuestions={allQuestions}
            setQuestion={setQuestion}
            isWorkshopSurvey={isWorkshopSurvey}
          />
        ) : (
          <div className="question-form">
            <p className={`header ${!eventQuestion.question && 'missing'}`}>
              {eventQuestion.question ? eventQuestion.question : t('QUESTION MISSING')}
            </p>
            {(eventQuestion.type === EventQuestionType.SINGLE || eventQuestion.type === EventQuestionType.MULTIPLE) && (
              eventQuestion.answerOptions.map((option) => (
                <label key={`question_${eventQuestion.id || eventQuestion.tempId}-option_${option.id || option.tempId}`}>
                  <input
                    type={eventQuestion.type === EventQuestionType.SINGLE ? 'radio' : 'checkbox'}
                    value={option.answer}
                    disabled
                  />
                  {option.answer}
                </label>
              ))
            )}
            {eventQuestion.type === EventQuestionType.TEXT && (
              <textarea disabled />
            )}
            {eventQuestion.type === EventQuestionType.RATING && (
              <div className="ratings">
                {ratings.map((rating) => (
                  <div key={rating.name} className="rating">
                    <img src={rating.image} alt="" width="50" height="50" />
                    <p>{rating.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="action-buttons">
          {editing ? (
            <button className="edit-button" type="button" onClick={toggleEditing}>
              <SaveSVG className="icon" />
              <span>{t('Done')}</span>
            </button>
          ) : (
            <button className="edit-button" type="button" onClick={toggleEditing} disabled={!authToUpdate}>
              <EditSVG className="icon" />
              <span>{t('Edit')}</span>
            </button>
          )}
          <button className="delete-button" type="button" onClick={removeQuestion} disabled={!authToUpdate}>
            <DeleteSVG className="icon" />
            <span>{t('Delete')}</span>
          </button>
        </div>
      </div>
      <div className="move-buttons">
        <button className="move-button" type="button" onClick={moveQuestionUp} disabled={!authToUpdate}>
          <BackArrowSVG className="icon" />
        </button>
        <button className="move-button" type="button" onClick={moveQuestionDown} disabled={!authToUpdate}>
          <ForwardArrowSVG className="icon" />
        </button>
      </div>
    </li>
  );
}
