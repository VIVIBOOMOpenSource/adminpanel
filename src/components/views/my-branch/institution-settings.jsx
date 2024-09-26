import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './institution-settings.scss';

import Button from 'src/components/common/button/button';

import InstitutionApi from 'src/apis/viviboom/InstitutionApi';
import { toast } from 'react-toastify';
import InstitutionReduxActions from 'src/redux/institution/InstitutionReduxActions';

function InstitutionSettings({ authToUpdate }) {
  const { t } = useTranslation();
  const authToken = useSelector((state) => state.user?.authToken);
  const institution = useSelector((state) => state.institution);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(institution?.name);
  const [editMode, setEditMode] = useState('');
  const [allowChatFunction, setAllowChatFunction] = useState(institution?.isChatEnabled);

  const fields = [
    {
      key: 'Institution Name', isEditable: true, value: name, setState: setName,
    },
    { key: 'Country ISO', value: institution?.countryISO },
    { key: 'IANA Timezone', value: institution?.tzIANA },
  ];

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const requestParams = {
        authToken,
        name,
        institutionId: institution?.id,
        isChatEnabled: allowChatFunction,
      };
      await InstitutionApi.patch(requestParams);
      await InstitutionReduxActions.fetch();
      toast.success('Institution Details Saved!');
      setEditMode('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log(err);
    }
    setLoading(false);
  }, [allowChatFunction, authToken, institution?.id, name]);

  const handleAllowChat = (event) => {
    const { value } = event.target;
    if (value === 'Yes') {
      setAllowChatFunction(true);
    } else {
      setAllowChatFunction(false);
    }
  };

  return (
    <div className="institution-content">
      <div className="institution-details">
        <h2>{t('myBranch.Institution Details')}</h2>
        <div className="institution-ctn">
          {fields.map(({
            key, isEditable, value, setState,
          }) => (
            <div key={key} className="institution-detail">
              <label>{t(`myBranch.${key}`)}</label>
              <div className="input-item">
                <input type="text" disabled={!isEditable || editMode !== key} value={value} onChange={(e) => setState(e.target.value)} />
                <Button
                  type="button"
                  status={editMode !== key ? 'edit' : 'add'}
                  disabled={!isEditable}
                  onClick={() => setEditMode((prevKey) => (prevKey === key ? '' : key))}
                >
                  {t('common.edit')}
                </Button>
              </div>
            </div>
          ))}
          {authToUpdate && (
          <div className="chat-function-container">
            <h2>
              {t('Enable chat function for users')}
            </h2>
            <label>
              <input
                type="radio"
                name="allowChatFunction"
                value="Yes"
                checked={allowChatFunction}
                onChange={handleAllowChat}
              />
              {t('Yes! I would like users to be able to chat with each other')}
            </label>
            <label>
              <input
                type="radio"
                name="allowChatFunction"
                value="No"
                checked={!allowChatFunction}
                onChange={handleAllowChat}
              />
              {t('No, do not allow users to chat with each other')}
            </label>
          </div>
          )}
          <Button
            type="button"
            status={loading ? 'loading' : 'save'}
            onClick={handleSave}
            disabled={!authToUpdate}
          >
            {t('Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InstitutionSettings;
