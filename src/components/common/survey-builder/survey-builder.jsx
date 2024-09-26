import React, { useEffect, useState } from 'react';
import AvatarImageCropper from 'react-avatar-image-cropper';
import { useTranslation } from 'react-i18next';

import './survey-builder.scss';

import MyImage from 'src/components/common/MyImage';
import { ReactComponent as AddSVG } from 'src/css/imgs/icon-add.svg';
import { getBase64 } from 'src/utils/object';
import { EventQuestionType } from 'src/enums/EventQuestionType';

import { EventQuestionDestinationType } from 'src/enums/EventQuestionDestinationType';
import EventFacilitators from 'src/components/views/bookings/event-facilitators';
import SurveyDescription from './components/survey-description';
import SurveyTitle from './components/survey-title';
import SurveyQuestion from './components/survey-question';
import ListController from './components/list-controller';
import Button from '../button/button';

const defaultCheckoutQuestions = [
  {
    tempId: 1,
    type: EventQuestionType.RATING,
    destination: EventQuestionDestinationType.CHECKOUT,
    question: 'How was the session?',
    answerOptions: [],
  },
  {
    tempId: 2,
    type: EventQuestionType.TEXT,
    destination: EventQuestionDestinationType.CHECKOUT,
    question: 'Feedback for the session:',
    answerOptions: [],
  },
];

export default function SurveyBuilder({
  isCreateEvent, authToUpdate, title, description, imageUri, facilitators, questions, setDescription, setImageUri, setFacilitators, setQuestions, isWorkshopSurvey,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [newQuestionCount, setNewQuestionCount] = useState(1);

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeQuestions = (e) => {
    setQuestions(e);
  };

  const listController = new ListController(questions, handleChangeQuestions);

  const handleAddEventQuestion = () => {
    listController.add({
      tempId: -newQuestionCount,
      type: EventQuestionType.SINGLE,
      destination: isWorkshopSurvey ? EventQuestionDestinationType.BOOKING : EventQuestionDestinationType.CHECKOUT,
      question: '',
      answerOptions: [],
    });
    setNewQuestionCount((cnt) => cnt + 1);
  };

  const applyImage = (croppedImage) => {
    getBase64(croppedImage, (base64) => {
      if (base64) setImageUri(base64);
      setShowUploadImage(false);
    });
  };

  // Set default checkout questions when creating event
  useEffect(() => {
    if (isCreateEvent && !isWorkshopSurvey && questions.length === 0) {
      setQuestions(defaultCheckoutQuestions);
    }
  }, [isCreateEvent, isWorkshopSurvey, questions, setQuestions]);

  return (
    <div className="small-container survey-builder">
      {isWorkshopSurvey && (
        <>
          <SurveyTitle title={title} />

          {showUploadImage && (
          <>
            <div className="dimmed-background" onClick={() => setShowUploadImage(false)} />
            <div className="cropper-workshop">
              <AvatarImageCropper apply={applyImage} />
              <label className="button" onClick={() => setShowUploadImage(false)}>
                {t('Cancel')}
              </label>
            </div>
          </>
          )}

          <h3 className="heading">{t('Event Image')}</h3>
          <div className="image">
            {imageUri ? <MyImage src={imageUri} alt="Event Image" /> : (
              <div className="no-image">
                (
                {t('No event image added')}
                )
              </div>
            )}
            <Button parentClassName="button" onClick={() => setShowUploadImage(true)} disabled={!authToUpdate}>
              {t('Upload Event Image (Recommended Image Size 720x480)')}
            </Button>
          </div>
          <EventFacilitators facilitators={facilitators} setFacilitators={setFacilitators} authToUpdate={authToUpdate} />
          <SurveyDescription description={description} handleChangeDescription={handleChangeDescription} authToUpdate={authToUpdate} />
        </>
      )}
      <div className="questions-ctn">
        <h3 className="heading">{t(isWorkshopSurvey ? 'Event Registration Questions' : 'Event Checkout Questions')}</h3>
        <ol className="question-list">
          {questions.map((question, i) => (
            <SurveyQuestion
              authToUpdate={authToUpdate}
              index={i}
              key={`event-question_${question?.id || -i}`}
              eventQuestion={question}
              allQuestions={questions}
              setQuestion={(q) => listController.set(i, q)}
              removeQuestion={() => listController.remove(i)}
              moveQuestionUp={() => listController.moveUp(i)}
              moveQuestionDown={() => listController.moveDown(i)}
              isWorkshopSurvey={isWorkshopSurvey}
            />
          ))}
          {!questions.length && <div className="no-question">{t(isWorkshopSurvey ? 'noQuestion' : 'noCheckoutQuestion')}</div>}
        </ol>
        {!authToUpdate && <h6>{t('*You are not authorized to edit this form.')}</h6>}
        <button className="save-button" type="button" onClick={handleAddEventQuestion} disabled={!authToUpdate}>
          <AddSVG className="icon" />
          {t('Add Question')}
        </button>
      </div>
    </div>
  );
}
