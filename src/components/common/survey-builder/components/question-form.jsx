import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './question-form.css';

import { ReactComponent as AddSVG } from 'src/css/imgs/icon-add.svg';
import { ReactComponent as BackArrowSVG } from 'src/css/imgs/icon-arrow-back.svg';
import { ReactComponent as ForwardArrowSVG } from 'src/css/imgs/icon-arrow-forward.svg';
import { ReactComponent as DeleteSVG } from 'src/css/imgs/icon-delete.svg';
import { EventQuestionType, eventQuestionTypes } from 'src/enums/EventQuestionType';

import ListController from './list-controller';

export default function QuestionForm({
  question, allQuestions, setQuestion, isWorkshopSurvey,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const [newOptionCount, setNewOptionCount] = useState(1);

  function handleChangeText(e) {
    setQuestion({ ...question, question: e.target.value });
  }

  function handleChangeType(e) {
    setQuestion({
      ...question,
      type: e.target.value,
      question: e.target.value === EventQuestionType.RATING ? 'How was the session?' : question.question,
    });
  }

  function setOptions(answerOptions) {
    setQuestion({ ...question, answerOptions });
  }

  const listController = new ListController(question.answerOptions, setOptions);

  function handleAddOption() {
    setNewOptionCount((cnt) => cnt + 1);
    listController.add({ answer: '', tempId: -newOptionCount });
  }

  return (
    <div className="question-form">
      <label className="header">
        {t('Question')}
        :
      </label>
      {question.type !== EventQuestionType.RATING ? (
        <input
          className="question-input"
          type="text"
          value={question.question}
          onChange={handleChangeText}
          placeholder={t('your question')}
        />
      ) : (
        <p>How was the session?</p>
      )}

      <label className="header" htmlFor="question-type">
        {t('Type')}
        :
      </label>
      <select id="question-type" value={question.type} onChange={handleChangeType}>
        {eventQuestionTypes.filter((type) => {
          // Only show RATING type for checkout forms
          if (isWorkshopSurvey) return type !== EventQuestionType.RATING;
          return true;
        }).map((type) => (
          <option key={type} value={type}>
            {t(type.toLowerCase())}
          </option>
        ))}
      </select>

      {question.type && (question.type === EventQuestionType.SINGLE || question.type === EventQuestionType.MULTIPLE) && (
        <fieldset>
          <legend className="header">{t('Options')}</legend>

          {question.answerOptions.map((option, i) => (
            <div className="option" key={`question_${question?.id || question?.tempId}_new-option_${option?.id || option.tempId}`}>
              <input
                type="text"
                placeholder={t('Enter option')}
                value={option?.answer}
                className="options"
                onChange={(e) => listController.set(i, { ...option, answer: e.target.value })}
              />
              <div className="option-buttons">
                <button className="move-button" type="button" onClick={() => listController.moveUp(i)}>
                  <BackArrowSVG className="icon" />
                </button>
                <button className="move-button" type="button" onClick={() => listController.moveDown(i)}>
                  <ForwardArrowSVG className="icon" />
                </button>
                <button className="delete-button" type="button" onClick={() => listController.remove(i)}>
                  <DeleteSVG className="icon" />
                </button>
              </div>
            </div>
          ))}
          <p className="add-option">
            <button className="save-button" type="button" onClick={handleAddOption}>
              <AddSVG className="icon" />
              {t('Add Option')}
            </button>
          </p>
        </fieldset>
      )}
    </div>
  );
}
