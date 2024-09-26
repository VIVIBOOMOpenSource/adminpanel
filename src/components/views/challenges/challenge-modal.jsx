import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AvatarImageCropper from 'react-avatar-image-cropper';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

import './challenge-modal.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';
import MyImage from 'src/components/common/MyImage';

import { BadgeDifficultyType } from 'src/enums/BadgeDifficultyType';

import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import EmbeddedYoutubeLinkManipulator from 'src/utils/embeddedYoutubeLinkManipulator';
import { getBase64 } from 'src/utils/object';

import ChallengeApi from 'src/apis/viviboom/ChallengeApi';
import EditorApi from 'src/apis/viviboom/EditorApi';
import ChallengeBadges from './challenge-badges';

const badgeDifficultyOptions = [
  { value: BadgeDifficultyType.BEGINNER, label: 'Beginner' },
  { value: BadgeDifficultyType.INTERMEDIATE, label: 'Intermediate' },
  { value: BadgeDifficultyType.ADVANCED, label: 'Advanced' },
];

function getArrayForUpdate(prevArr, arr) {
  return [
    // new items
    ...arr.filter((item1) => !prevArr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id })),
    // deleted items
    ...prevArr.filter((item1) => !arr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, isDelete: true })),
  ];
}

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function ChallengeModal({
  show,
  handleClose,
  refreshChallenges,
  challenge,
  allBadgeCategories,
  authToCreate,
  authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const user = useSelector((state) => state.user);

  const [tab, setTab] = useState(1);

  const [loading, setLoading] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [imageUri, setImageUri] = useState(null);
  const [coverImageUri, setCoverImageUri] = useState(null);
  const [badgeCategoryOptions, setBadgeCategoryOptions] = useState([]);
  const [difficulty, setDifficulty] = useState(null);

  const [dayToComplete, setDayToComplete] = useState(0);
  const [hourToComplete, setHourToComplete] = useState(0);
  const [minutesToComplete, setMinutesToComplete] = useState(0);

  const [isSelfEarning, setIsSelfEarning] = useState(false);

  // challenge contents
  const [materialEditorState, setMaterialEditorState] = useState(EditorState.createEmpty());
  const [contentEditorState, setContentEditorState] = useState(EditorState.createEmpty());
  const [tipEditorState, setTipEditorState] = useState(EditorState.createEmpty());
  const [questionEditorState, setQuestionEditorState] = useState(EditorState.createEmpty());

  const isNewChallenge = useMemo(() => !challenge, [challenge]);

  async function uploadImageCallBack(image) {
    const response = await EditorApi.postImage({ authToken: user.authToken, file: image });

    return { data: { link: response.data.url } };
  }

  // load data, if exists
  useEffect(() => {
    if (challenge) {
      setName(challenge.name);
      setDescription(challenge.description || '');
      setImageUri(challenge.imageUri || null);
      setCoverImageUri(challenge.coverImageUri || null);
      setIsSelfEarning(challenge.isSelfEarning);
      setDifficulty(badgeDifficultyOptions.find((option) => option.value === challenge?.difficulty) || null);
      setBadgeCategoryOptions(challenge.categories?.map((category) => ({ value: category.id, label: category.name })));

      try {
        if (challenge.materialContent) setMaterialEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(challenge.materialContent))));
        if (challenge.content) setContentEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(challenge.content))));
        if (challenge.tipContent) setTipEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(challenge.tipContent))));
        if (challenge.questionContent) setQuestionEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(challenge.questionContent))));
      } catch (err) {
        toast.error(t('Content is malformed. Please tell a crew member about this'));
      }

      let completionTime = challenge.timeToComplete ?? 0;
      if (completionTime >= 1440) {
        const dayRequired = Math.floor(completionTime / 1440, 10);
        setDayToComplete(dayRequired);
        completionTime -= dayRequired * 1440;
      }
      if (completionTime >= 60) {
        const hourRequired = Math.floor(completionTime / 60, 10);
        setHourToComplete(hourRequired);
        completionTime -= hourRequired * 60;
      }
      if (completionTime < 60) setMinutesToComplete(completionTime);
    }
  }, [show, challenge, t]);

  const handleModalClose = () => {
    setTab(1);
    setLoading(false);
    setName('');
    setDescription('');
    setIsSelfEarning(false);
    setShowUploadImage(false);
    setImageUri(null);
    setCoverImageUri(null);
    setDifficulty(null);
    setDayToComplete(0);
    setHourToComplete(0);
    setMinutesToComplete(0);
    setBadgeCategoryOptions([]);
    setMaterialEditorState(EditorState.createEmpty());
    setContentEditorState(EditorState.createEmpty());
    setTipEditorState(EditorState.createEmpty());
    setQuestionEditorState(EditorState.createEmpty());
    handleClose();
  };

  const saveChallenge = async (isPublished) => {
    // validation
    if (isPublished && !name) return toast.error(t('The name of the challenge is required'));
    if (isPublished && !imageUri) return toast.error(t('An image is required for this challenge'));

    const days = Number(dayToComplete);
    const hours = Number(hourToComplete);
    const minutes = Number(minutesToComplete);
    let calculatedTime = 0;

    calculatedTime = minutes + (hours * 60) + (days * 24 * 60);

    setLoading(true);
    try {
      if (!challenge) {
        // mandatory fields
        const requestBody = {
          authToken: user.authToken,
          createdByUserId: user.id,
          isSelfEarning,
          isPublished,
        };
        // optional fields
        if (description) requestBody.description = description;
        if (badgeCategoryOptions) requestBody.badgeCategoryIds = badgeCategoryOptions.map((b) => b.value);
        if (imageUri) requestBody.imageBase64 = imageUri;
        if (name) requestBody.name = name;

        if (difficulty) requestBody.difficulty = difficulty.value;
        if (calculatedTime) requestBody.timeToComplete = calculatedTime;
        if (coverImageUri) requestBody.coverImageBase64 = coverImageUri;

        const editorContent = contentEditorState.getCurrentContent();
        if (editorContent.hasText()) requestBody.content = JSON.stringify(convertToRaw(editorContent));

        const materialEditorContent = materialEditorState.getCurrentContent();
        if (materialEditorContent.hasText()) requestBody.materialContent = JSON.stringify(convertToRaw(materialEditorContent));

        const tipEditorContent = tipEditorState.getCurrentContent();
        if (tipEditorContent.hasText()) requestBody.tipContent = JSON.stringify(convertToRaw(tipEditorContent));

        const questionEditorContent = questionEditorState.getCurrentContent();
        if (questionEditorContent.hasText()) requestBody.questionContent = JSON.stringify(convertToRaw(questionEditorContent));

        await ChallengeApi.post(requestBody);
        toast.success(t('Challenge created'));
      } else {
        const requestBody = {
          authToken: user.authToken,
          challengeId: challenge.id,
          isSelfEarning,
          isPublished,
          badgeCategories: getArrayForUpdate(challenge.categories, badgeCategoryOptions.map((option) => ({ id: option.value }))),
        };

        if (description) requestBody.description = description;
        if (name) requestBody.name = name;

        if (difficulty) requestBody.difficulty = difficulty.value;
        if (calculatedTime) requestBody.timeToComplete = calculatedTime;

        const editorContent = contentEditorState.getCurrentContent();
        if (editorContent.hasText()) requestBody.content = JSON.stringify(convertToRaw(editorContent));

        const materialEditorContent = materialEditorState.getCurrentContent();
        if (materialEditorContent.hasText()) requestBody.materialContent = JSON.stringify(convertToRaw(materialEditorContent));

        const tipEditorContent = tipEditorState.getCurrentContent();
        if (tipEditorContent.hasText()) requestBody.tipContent = JSON.stringify(convertToRaw(tipEditorContent));

        const questionEditorContent = questionEditorState.getCurrentContent();
        if (questionEditorContent.hasText()) requestBody.questionContent = JSON.stringify(convertToRaw(questionEditorContent));

        // replace challenge images
        if (imageUri && !imageUri.startsWith('http')) {
          await ChallengeApi.putImage({
            authToken: user.authToken, challengeId: challenge.id, file: imageUri, imageType: 'image',
          });
        }
        if (coverImageUri && !coverImageUri.startsWith('http')) {
          await ChallengeApi.putImage({
            authToken: user.authToken, challengeId: challenge.id, file: coverImageUri, imageType: 'cover-image',
          });
        }
        await ChallengeApi.patch(requestBody);
        toast.success(t('Challenge edited'));
      }
      await refreshChallenges();
      handleModalClose();
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    return setLoading(false);
  };

  const handleSaveChallenge = (isPublished) => async (e) => {
    e.preventDefault();
    await saveChallenge(isPublished);
  };

  const deleteChallenge = async () => {
    if (window.confirm(`${t('Delete Challenge')}?`)) {
      setLoading(true);
      try {
        await ChallengeApi.deleteChallenge({ authToken: user.authToken, challengeId: challenge.id });
        toast.success(t('Challenge deleted'));
        await refreshChallenges();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const applyImage = (croppedImage) => {
    getBase64(croppedImage, (base64) => {
      if (base64) setImageUri(base64);
      setShowUploadImage(false);
    });
  };

  const coverImageParamsMemoed = useMemo(() => ({ width: 512 }), []);

  return (
    <Modal
      className="challenge-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <CarouselHeader slideTo={tab}>
          <div onClick={() => setTab(1)}>{t('Challenge Info')}</div>
          <div onClick={() => setTab(2)}>{t('Challenge Images')}</div>
          <div onClick={() => setTab(3)}>{t('How To Complete')}</div>
          <div onClick={() => setTab(4)}>{t('Badges')}</div>
          <div onClick={() => setTab(5)}>{t(isNewChallenge ? 'Save / Publish' : 'Danger Zone')}</div>
        </CarouselHeader>
        <Carousel slideTo={tab}>
          <div>
            <h3>{t(isNewChallenge ? 'Add a New Challenge' : 'Modify Challenge')}</h3>
            <div>
              <label>
                {t('Challenge Name')}
                *
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="Text"
                disabled={!authToUpdate}
                placeholder={t('Come up with a compelling title for your challenge...')}
              />
            </div>

            <div className="challenge-description">
              <label>{t('Challenge Description')}</label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                disabled={!authToUpdate}
                placeholder={t('Provide the narrative or explanation for this challenge in about 100 words')}
              />
            </div>
            {challenge?.createdByUser && (
              <div>
                <label>{`${t('Challenge Creator')}: ${challenge?.createdByUser?.name}`}</label>
                <br />
              </div>
            )}

            <div className="challenge-category">
              <label>{t('Challenge Categories')}</label>
              <Select
                onChange={setBadgeCategoryOptions}
                isMulti
                isClearable
                options={allBadgeCategories.map((category) => ({ value: category.id, label: category.name }))}
                value={badgeCategoryOptions}
                placeholder={t('What categories does this challenge belong to?')}
              />
            </div>

            <div className="badge-difficulty">
              <label>{t('Challenge Difficulty')}</label>
              <Select
                onChange={setDifficulty}
                isClearable
                options={badgeDifficultyOptions}
                value={difficulty}
                placeholder={t('How difficult is it to complete this challenge?')}
              />
            </div>

            <div className="time-to-complete">
              <label>{t('Estimated Time to Complete')}</label>
              <div className="time-to-complete-input-container">
                <div className="time-to-complete-input-sub-container">
                  <input
                    onChange={(e) => setDayToComplete(e.target.value)}
                    value={dayToComplete}
                    type="number"
                    disabled={!authToUpdate}
                  />
                  <div>{t('days')}</div>
                </div>
                <div className="time-to-complete-input-sub-container">
                  <input
                    onChange={(e) => setHourToComplete(e.target.value)}
                    value={hourToComplete}
                    type="number"
                    disabled={!authToUpdate}
                  />
                  <div>{t('hours')}</div>
                </div>
                <div className="time-to-complete-input-sub-container">
                  <input
                    onChange={(e) => setMinutesToComplete(e.target.value)}
                    value={minutesToComplete}
                    type="number"
                    disabled={!authToUpdate}
                  />
                  <div>{t('minutes')}</div>
                </div>
              </div>
            </div>

            <div className="challenge-self-earning">
              <input
                type="checkbox"
                id="checkbox"
                className="self-earning-checkbox"
                onChange={(e) => setIsSelfEarning(!isSelfEarning)}
                checked={isSelfEarning}
              />
              <div className="self-earning-label">
                {t('Make this challenge self-earning')}
              </div>
            </div>
            <h6 className="self-earning-description">{t('Enabling this allows the challenge to be awarded to VIVINAUTS without the need for staff approval')}</h6>
          </div>
          <div>
            {showUploadImage && (
              <>
                <div className="dimmed-background" />
                <div className="cropper-challenge">
                  <AvatarImageCropper apply={applyImage} />
                  <label className="button" onClick={() => setShowUploadImage(false)}>
                    {t('Cancel')}
                  </label>
                </div>
              </>
            )}
            <div className="image">
              <h3>
                {t('Thumbnail Image')}
                *
              </h3>
              <MyImage src={imageUri} alt="Challenge Thumbnail Image" preloadImage={PreloadBadgeImage} width={256} />
              {authToUpdate && (
                <label className="button image-button" onClick={() => setShowUploadImage(true)}>
                  {t('Upload Thumbnail Image')}
                </label>
              )}
            </div>

            <div className="cover-image">
              <h3>{t('Cover Image')}</h3>
              <MyImage src={coverImageUri || challenge?.coverImageUri} params={coverImageParamsMemoed} />
              <label className="button image-button">
                {t('Upload Cover Image')}
                <input
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg"
                  onChange={(e) => {
                    const file = e.currentTarget.files.length >= 1 ? e.currentTarget.files[0] : null;
                    if (file.size > MAX_IMAGE_SIZE) {
                      toast.error(t('File is too large. Max File size: 8MB'));
                    } else {
                      getBase64(file, (base64) => {
                        if (base64) setCoverImageUri(base64);
                      });
                    }
                  }}
                  disabled={loading || !authToUpdate}
                />
              </label>
            </div>
          </div>
          <div className="how-to">
            <h3>{t('Tools & Materials')}</h3>
            <Editor
              editorState={materialEditorState}
              toolbarClassName="toolbar"
              wrapperClassName="wrapper"
              editorClassName="editor"
              toolbarHidden={false}
              readOnly={!authToUpdate}
              onEditorStateChange={setMaterialEditorState}
              placeholder="What will you use to complete this challenge? Could you provide information on the amounts of materials and tools required?"
              toolbar={{
                embedded: {
                  embedCallback: EmbeddedYoutubeLinkManipulator,
                  popupClassName: 'rdw-embed-popup', // classnames are for align out of bound popups
                },
                emoji: {
                  popupClassName: 'rdw-emoji-popup',
                },
                image: {
                  popupClassName: 'rdw-image-popup',
                  previewImage: true,
                  uploadEnabled: true,
                  uploadCallback: uploadImageCallBack,
                },
              }}
            />
            <h3>{t('How to complete this challenge?')}</h3>
            <Editor
              editorState={contentEditorState}
              toolbarClassName="toolbar"
              wrapperClassName="wrapper"
              editorClassName="editor"
              toolbarHidden={false}
              readOnly={!authToUpdate}
              onEditorStateChange={setContentEditorState}
              placeholder="Please add step-by-step instructions here with clear illustration in the form of pictures or videos"
              toolbar={{
                embedded: {
                  embedCallback: EmbeddedYoutubeLinkManipulator,
                  popupClassName: 'rdw-embed-popup', // classnames are for align out of bound popups
                },
                emoji: {
                  popupClassName: 'rdw-emoji-popup',
                },
                image: {
                  popupClassName: 'rdw-image-popup',
                  previewImage: true,
                  uploadEnabled: true,
                  uploadCallback: uploadImageCallBack,
                },
              }}
            />
            <h3>{t('Useful Tips')}</h3>
            <Editor
              editorState={tipEditorState}
              toolbarClassName="toolbar"
              wrapperClassName="wrapper"
              editorClassName="editor"
              toolbarHidden={false}
              readOnly={!authToUpdate}
              onEditorStateChange={setTipEditorState}
              placeholder="Provide useful tips (if any)"
              toolbar={{
                embedded: {
                  embedCallback: EmbeddedYoutubeLinkManipulator,
                  popupClassName: 'rdw-embed-popup', // classnames are for align out of bound popups
                },
                emoji: {
                  popupClassName: 'rdw-emoji-popup',
                },
                image: {
                  popupClassName: 'rdw-image-popup',
                  previewImage: true,
                  uploadEnabled: true,
                  uploadCallback: uploadImageCallBack,
                },
              }}
            />
            <h3>{t('Commonly Asked Questions')}</h3>
            <Editor
              editorState={questionEditorState}
              toolbarClassName="toolbar"
              wrapperClassName="wrapper"
              editorClassName="editor"
              toolbarHidden={false}
              readOnly={!authToUpdate}
              onEditorStateChange={setQuestionEditorState}
              placeholder="Provide commonly asked questions and answers (if any)"
              toolbar={{
                embedded: {
                  embedCallback: EmbeddedYoutubeLinkManipulator,
                  popupClassName: 'rdw-embed-popup', // classnames are for align out of bound popups
                },
                emoji: {
                  popupClassName: 'rdw-emoji-popup',
                },
                image: {
                  popupClassName: 'rdw-image-popup',
                  previewImage: true,
                  uploadEnabled: true,
                  uploadCallback: uploadImageCallBack,
                },
              }}
            />
          </div>
          <div>
            <ChallengeBadges challengeId={challenge?.id} authToUpdate={authToUpdate} />
          </div>
          <div>
            {challenge && (
              <div>
                <h3>{t('Delete Challenge')}</h3>
                <Button
                  parentClassName="delete-challenge"
                  onClick={deleteChallenge}
                  disabled={!authToCreate}
                  status="delete"
                >
                  {t('Delete Challenge')}
                </Button>
              </div>
            )}
          </div>
        </Carousel>

        <div className={(isNewChallenge && tab <= 4) || (!isNewChallenge && tab >= 4) ? 'hide-save-buttons' : 'save-buttons'}>
          {!challenge?.isPublished && (
            <Button
              status={loading ? 'loading' : 'save'}
              type="submit"
              parentClassName="submit-btn"
              disabled={!authToUpdate}
              onClick={handleSaveChallenge(false)}
              value="Save as Draft"
            />
          )}
          <Button
            status={loading ? 'loading' : 'save'}
            type="submit"
            parentClassName="submit-btn"
            disabled={!authToUpdate}
            onClick={handleSaveChallenge(true)}
            value={!challenge?.isPublished ? 'Publish' : 'Save'}
          />
        </div>
      </div>
    </Modal>
  );
}

export default ChallengeModal;
