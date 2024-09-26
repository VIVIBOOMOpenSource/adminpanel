import './event-facilitators.scss';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import Button from 'src/components/common/button/button';
import { ReactComponent as DeleteSvg } from 'src/css/imgs/icon-delete.svg';
import { ReactComponent as EditSvg } from 'src/css/imgs/icon-edit.svg';
import DefaultProfilePicture from 'src/css/imgs/profile/default-profile-picture.png';
import MyImage from 'src/components/common/MyImage';
import Modal from 'src/components/common/modal/modal';
import UserApi from 'src/apis/viviboom/UserApi';

const MAX_COUNT = 10;
const DEFAULT_LIMIT = 20;
const DEFAULT_PROFILE_WIDTH = 128;

function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.profileImageUri} alt={value?.name} preloadImage={DefaultProfilePicture} defaultImage={DefaultProfilePicture} width={64} />
        {children}
      </div>
    </components.Option>
  );
}

function EventFacilitators({ facilitators, setFacilitators, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const authToken = useSelector((state) => state?.user?.authToken);

  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState(null);
  const [selectedUserOption, setSelectedUserOption] = useState(null);
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [isNewFacilitator, setNewFacilitator] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  const loadUserOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };

      if (keywords) requestParams.username = keywords;

      const res = await UserApi.getList(requestParams);
      const { users, count } = res.data;
      return {
        options: users.filter((u) => !facilitators?.find((f) => f.userId === u.id)).map((u) => ({
          value: {
            id: u.id, name: u.givenName, profileImageUri: u.profileImageUri,
          },
          label: `${u.username}, ${u.name}`,
        })),
        hasMore: prevOptions.length + users.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  // handlers
  const handleModalClose = () => {
    setName('');
    setSkills('');
    setSelectedUserOption(null);
    setModalErrorMessage('');
    setNewFacilitator(false);
    setSelectedFacilitatorId(null);
  };

  const handleDelete = (facilitatorId) => () => {
    if (!window.confirm(t('Are you sure you want to delete this facilitator?'))) {
      return;
    }
    setFacilitators(facilitators.filter((facilitator) => facilitator.id !== facilitatorId));
  };

  const handleConfirm = () => {
    setModalErrorMessage('');
    if (!selectedUserOption && !name) {
      setModalErrorMessage(t('Please add a user or name for this facilitator'));
      return;
    }
    if (isNewFacilitator) {
      setFacilitators([...facilitators, {
        id: -(facilitators.length + 1), userId: selectedUserOption?.value?.id, name: selectedUserOption?.value?.name || name, skills, profileImageUri: selectedUserOption?.value?.profileImageUri,
      }]);
    } else if (selectedFacilitatorId) {
      const newFacilitators = [...facilitators];
      const facilitatorIndex = newFacilitators.findIndex((facilitator) => facilitator.id === selectedFacilitatorId);
      newFacilitators[facilitatorIndex] = {
        ...newFacilitators[facilitatorIndex], userId: selectedUserOption?.value?.id, name: selectedUserOption?.value?.name || name, skills,
      };
      setFacilitators(newFacilitators);
    } else {
      return;
    }
    handleModalClose();
  };

  const handleEdit = (index) => () => {
    if (facilitators[index].userId) {
      setSelectedUserOption({
        value: {
          id: facilitators[index].userId, name: facilitators[index].name, profileImageUri: facilitators[index].profileImageUri,
        },
        label: facilitators[index].name,
      });
    } else {
      setName(facilitators[index].name || '');
    }
    setSkills(facilitators[index].skills || '');
    setSelectedFacilitatorId(facilitators[index].id);
  };

  return (
    <>
      <div className="event-facilitators">
        <h3 className="heading">{t('Event Facilitators')}</h3>
        <p className="subtitle">
          {t('facilitatorLimit', { count: MAX_COUNT })}
        </p>
        <div className="item-row">
          {facilitators?.length > 0 && (
            <ul className="facilitators-container">
              {facilitators.map((v, idx) => (
                <li key={`event-facilitator_${v.id}`}>
                  <MyImage
                    alt={`event-facilitator_${v.id}`}
                    src={v.profileImageUri}
                    defaultImage={DefaultProfilePicture}
                    width={DEFAULT_PROFILE_WIDTH}
                  />
                  <p className="facilitator-name">{v.name}</p>
                  <p className="facilitator-skills">
                    {v.skills || '-'}
                  </p>
                  <div className="op-buttons">
                    <button type="button" className={!authToUpdate ? 'edit-button greyed' : 'edit-button'} disabled={!authToUpdate} onClick={handleEdit(idx)}>
                      <EditSvg />
                    </button>
                    <button type="button" className={!authToUpdate ? 'delete-button greyed' : 'delete-button'} disabled={!authToUpdate} onClick={handleDelete(v.id)}>
                      <DeleteSvg />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="add-facilitator">
            <label className={facilitators?.length >= MAX_COUNT ? 'add-button greyed' : 'add-button'} onClick={() => setNewFacilitator(true)}>
              <div className="text">
                +
                {' '}
                {t('Add Facilitators')}
              </div>
            </label>
            {facilitators?.length >= MAX_COUNT && (
              <p style={{ textAlign: 'center', color: 'red', marginTop: 5 }}>
                {t('Only 10 facilitators can be added')}
              </p>
            )}
          </div>
        </div>
      </div>
      <Modal className="facilitator-modal" show={!!selectedFacilitatorId || isNewFacilitator} handleClose={handleModalClose}>
        <div className="facilitator-modal-container">
          <h4>{t(isNewFacilitator ? 'New Facilitator' : 'Edit Facilitator')}</h4>
          <div className="facilitator-selects">
            <div className="facilitator-select">
              <p className="label">{t('Facilitator')}</p>
              <AsyncPaginate
                isDisabled={!authToUpdate}
                isClearable={!selectedFacilitatorId}
                cacheUniqs={[isNewFacilitator, selectedFacilitatorId]}
                debounceTimeout={300}
                value={selectedUserOption}
                loadOptions={loadUserOptions}
                onChange={setSelectedUserOption}
                components={{ Option }}
                placeholder={t('selectUsers')}
                className="facilitator-dropdown"
              />
            </div>
            <div className="separator-text">
              -
              {' '}
              {t('Or, simply add a name below')}
              {' '}
              -
            </div>
            <div className="facilitator-select">
              <p className="label" />
              <input value={name} placeholder={t('Name')} onChange={(e) => setName(e.target.value)} maxLength={30} />
            </div>
            <div className="facilitator-select skills">
              <p className="label">{t('Skills')}</p>
              <input value={skills} placeholder={t('skills')} onChange={(e) => setSkills(e.target.value)} maxLength={200} />
            </div>
            <p className="modal-error-message">{modalErrorMessage}</p>
            <Button parentClassName="facilitator-button" onClick={handleConfirm}>{t('Confirm')}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
export default EventFacilitators;
