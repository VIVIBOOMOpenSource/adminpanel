import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AvatarImageCropper from 'react-avatar-image-cropper';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

import './badge-modal.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';

import { BadgeDifficultyType } from 'src/enums/BadgeDifficultyType';

import EmbeddedYoutubeLinkManipulator from 'src/utils/embeddedYoutubeLinkManipulator';
import { getBase64 } from 'src/utils/object';

import MyImage from 'src/components/common/MyImage';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import EditorApi from 'src/apis/viviboom/EditorApi';

import BadgeChallenges from './badge-challenges';

const badgeImageParams = { suffix: 'png' };

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

function BadgeModal({
  show,
  handleClose,
  refreshBadges,
  badge,
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

  // badge contents
  const [materialEditorState, setMaterialEditorState] = useState(EditorState.createEmpty());
  const [contentEditorState, setContentEditorState] = useState(EditorState.createEmpty());
  const [tipEditorState, setTipEditorState] = useState(EditorState.createEmpty());
  const [questionEditorState, setQuestionEditorState] = useState(EditorState.createEmpty());

  const isNewBadge = useMemo(() => !badge, [badge]);

  async function uploadImageCallBack(image) {
    const response = await EditorApi.postImage({ authToken: user.authToken, file: image });

    return { data: { link: response.data.url } };
  }

  // load data, if exists
  useEffect(() => {
    if (badge) {
      setName(badge.name);
      setDescription(badge.description || '');
      setImageUri(badge.imageUri || null);
      setCoverImageUri(badge.coverImageUri || null);
      setIsSelfEarning(badge.isSelfEarning);
      setDifficulty(badgeDifficultyOptions.find((option) => option.value === badge?.difficulty) || null);
      setBadgeCategoryOptions(badge.categories?.map((category) => ({ value: category.id, label: category.name })));

      try {
        if (badge.materialContent) setMaterialEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(badge.materialContent))));
        if (badge.content) setContentEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(badge.content))));
        if (badge.tipContent) setTipEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(badge.tipContent))));
        if (badge.questionContent) setQuestionEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(badge.questionContent))));
      } catch (err) {
        toast.error(t('Content is malformed. Please tell a crew member about this'));
      }

      let completionTime = badge.timeToComplete ?? 0;
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
  }, [show, badge, t]);

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

  const saveBadge = async (isPublished) => {
    // validation
    if (isPublished && !name) return toast.error(t('The name of the badge is required'));
    if (isPublished && !imageUri) return toast.error(t('An image is required for this badge'));

    const days = Number(dayToComplete);
    const hours = Number(hourToComplete);
    const minutes = Number(minutesToComplete);
    let calculatedTime = 0;

    calculatedTime = minutes + (hours * 60) + (days * 24 * 60);

    setLoading(true);
    try {
      if (!badge) {
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

        await BadgeApi.post(requestBody);
        toast.success(t('Badge created'));
      } else {
        const requestBody = {
          authToken: user.authToken,
          badgeId: badge.id,
          isSelfEarning,
          isPublished,
          badgeCategories: getArrayForUpdate(badge.categories, badgeCategoryOptions.map((option) => ({ id: option.value }))),
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

        // replace badge images
        if (imageUri && !imageUri.startsWith('http')) {
          await BadgeApi.putImage({
            authToken: user.authToken, badgeId: badge.id, file: imageUri, imageType: 'image',
          });
        }
        if (coverImageUri && !coverImageUri.startsWith('http')) {
          await BadgeApi.putImage({
            authToken: user.authToken, badgeId: badge.id, file: coverImageUri, imageType: 'cover-image',
          });
        }
        await BadgeApi.patch(requestBody);
        toast.success(t('Badge edited'));
      }
      await refreshBadges();
      handleModalClose();
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    return setLoading(false);
  };

  const handleSaveBadge = (isPublished) => async (e) => {
    e.preventDefault();
    await saveBadge(isPublished);
  };

  const deleteBadge = async () => {
    if (window.confirm(`${t('Delete Badge')}?`)) {
      setLoading(true);
      try {
        await BadgeApi.deleteBadge({ authToken: user.authToken, badgeId: badge.id });
        toast.success(t('Badge deleted'));
        await refreshBadges();
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
      className="badge-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <CarouselHeader slideTo={tab}>
          <div onClick={() => setTab(1)}>{t('Badge Info')}</div>
          <div onClick={() => setTab(2)}>{t('Badge Images')}</div>
          <div onClick={() => setTab(3)}>{t('How To Earn')}</div>
          <div onClick={() => setTab(4)}>{t('Challenges')}</div>
          <div onClick={() => setTab(5)}>{t(isNewBadge ? 'Save / Publish' : 'Danger Zone')}</div>
        </CarouselHeader>
        <Carousel slideTo={tab}>
          <div>
            <h3>{t(isNewBadge ? 'Add a New Badge' : 'Modify Badge')}</h3>
            <div>
              <label>
                {t('Badge Name')}
                *
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="Text"
                disabled={!authToUpdate}
                placeholder={t('Come up with a compelling title for your badge...')}
              />
            </div>

            <div className="badge-description">
              <label>{t('Badge Description')}</label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                disabled={!authToUpdate}
                placeholder={t('Provide the narrative or explanation for this badge in about 100 words')}
              />
            </div>
            {badge?.createdByUser && (
              <div>
                <label>{`${t('Badge Creator')}: ${badge?.createdByUser?.name}`}</label>
                <br />
              </div>
            )}

            <div className="badge-category">
              <label>{t('Badge Categories')}</label>
              <Select
                onChange={setBadgeCategoryOptions}
                isMulti
                isClearable
                options={allBadgeCategories.map((category) => ({ value: category.id, label: category.name }))}
                value={badgeCategoryOptions}
                placeholder={t('What categories does this badge belong to?')}
              />
            </div>

            <div className="badge-difficulty">
              <label>{t('Badge Difficulty')}</label>
              <Select
                onChange={setDifficulty}
                isClearable
                options={badgeDifficultyOptions}
                value={difficulty}
                placeholder={t('How difficult is it to complete this badge?')}
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

            <div className="badge-self-earning">
              <input
                type="checkbox"
                id="checkbox"
                className="self-earning-checkbox"
                onChange={() => setIsSelfEarning(!isSelfEarning)}
                checked={isSelfEarning}
              />
              <div className="self-earning-label">
                {t('Make this badge self-earning')}
              </div>
            </div>
            <h6 className="self-earning-description">{t('Enabling this allows the badge to be awarded to VIVINAUTS without the need for staff approval')}</h6>
          </div>
          <div>
            {showUploadImage && (
              <>
                <div className="dimmed-background" />
                <div className="cropper-badge">
                  <AvatarImageCropper apply={applyImage} />
                  <label className="button" onClick={() => setShowUploadImage(false)}>
                    {t('Cancel')}
                  </label>
                </div>
              </>
            )}
            <div className="image">
              <h3 className="badge-image-title">
                {t('Badge Image')}
                *
              </h3>
              <div className="badge-image-text">{t('Recommended image size: 100 x 100 pixels')}</div>
              <div className="badge-image-text">{t('Accepted file types: .jpg, .jpeg, .png')}</div>
              <div className="badge-image-sub-text">{t('**Resolution size greater than 100 x 100 pixels is accepted. (e.g. 256 x 256 pixels)')}</div>
              <MyImage src={imageUri} alt="Badge Image" preloadImage={PreloadBadgeImage} params={badgeImageParams} width={128} />
              {authToUpdate && (
                <label className="button image-button" onClick={() => setShowUploadImage(true)}>
                  {t('Upload Badge Image')}
                </label>
              )}
            </div>

            <div className="cover-image">
              <h3 className="badge-image-title">{t('Cover Image')}</h3>
              <div className="badge-image-text">{t('Accepted file types: .jpg, .jpeg, .png')}</div>
              <MyImage src={coverImageUri || badge?.coverImageUri} params={coverImageParamsMemoed} />
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
              placeholder="What will you use to complete this badge? Could you provide information on the amounts of materials and tools required?"
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
            <h3>{t('How to earn this badge?')}</h3>
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
            <BadgeChallenges badgeId={badge?.id} authToUpdate={authToUpdate} />
          </div>
          <div>
            {badge && (
              <div>
                <h3>{t('Delete Badge')}</h3>
                <Button
                  parentClassName="delete-badge"
                  onClick={deleteBadge}
                  disabled={!authToCreate}
                  status="delete"
                >
                  {t('Delete Badge')}
                </Button>
              </div>
            )}
          </div>
        </Carousel>
        <div className={(isNewBadge && tab <= 4) || (!isNewBadge && tab >= 4) ? 'hide-save-buttons' : 'save-buttons'}>
          {!badge?.isPublished && (
            <Button
              status={loading ? 'loading' : 'save'}
              type="submit"
              parentClassName="submit-btn"
              disabled={!authToUpdate}
              onClick={handleSaveBadge(false)}
              value="Save as Draft"
            />
          )}
          <Button
            status={loading ? 'loading' : 'save'}
            type="submit"
            parentClassName="submit-btn"
            disabled={!authToUpdate}
            onClick={handleSaveBadge(true)}
            value={!badge?.isPublished ? 'Publish' : 'Save'}
          />
        </div>
      </div>
    </Modal>
  );
}

export default BadgeModal;
