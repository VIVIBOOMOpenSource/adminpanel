import React from 'react';
import './user-question-responses.scss';
import { useTranslation } from 'react-i18next';

function UserQuestionResponses({ responses, eventQuestionId, index }) {
  const { t } = useTranslation('translation', { keyPrefix: 'userBooking' });

  const question = responses[eventQuestionId][0];
  return (
    <div className="workshop-question">
      <h4>
        {index + 1}
        {'. '}
        {`(${t(question.type.toLowerCase())}) ${question.question}`}
      </h4>
      {responses[eventQuestionId].map((resp) => (
        <div className="workshop-answer" key={`event-question_${eventQuestionId}-response_${resp.id}`}>
          <label>
            •
            {resp.response}
          </label>
        </div>
      ))}
    </div>
  );
}

export default UserQuestionResponses;
