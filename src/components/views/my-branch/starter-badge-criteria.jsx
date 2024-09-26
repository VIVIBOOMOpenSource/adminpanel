import React, { useState, useEffect, useCallback } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { components } from 'react-select';
import './starter-badge-criteria.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import BadgeSvg from 'src/css/imgs/icon-badge.svg';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import { ReactComponent as DownArrowSVG } from 'src/css/imgs/icon-chevron-down.svg';
import { ReactComponent as UpArrowSVG } from 'src/css/imgs/icon-chevron-up.svg';
import { useSelector } from 'react-redux';
import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import BadgeApi from 'src/apis/viviboom/BadgeApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const badgeImageParams = { suffix: 'png' };
const DEFAULT_LIMIT = 20;

function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.imageUri} alt={value?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={128} params={badgeImageParams} />
        {children}
      </div>
    </components.Option>
  );
}

function StarterBadgeCriteria({
  authToUpdate,
  starterBadgeRequirementCount,
  setStarterBadgeRequirementCount,
  setIsEdited,
  starterBadges,
  setStarterBadges,
  loading,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const authToken = useSelector((state) => state.user?.authToken);
  const [badgeOptions, setBadgeOptions] = useState([]);
  const [allBadgeOptions, setAllBadgeOptions] = useState([]);
  const [isShowStarterBadge, setIsShowStarterBadge] = useState(false);
  const [selectedBadgeOption, setSelectedBadgeOption] = useState(null);

  const fetchAllBadgesOptions = useCallback(async () => {
    try {
      const requestParams = {
        authToken,
        order: BadgeOrderType.LATEST,
      };

      const res = await BadgeApi.getList(requestParams);
      const { badges } = res.data;
      const filteredBadges = badges.filter((badge) => !starterBadges.find((sb) => sb.id === badge.id));
      setAllBadgeOptions(filteredBadges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  }, [authToken, starterBadges]);

  const fetchBadgeOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };
      if (keywords) requestParams.keywords = keywords;

      const res = await BadgeApi.getList(requestParams);
      const { badges, count } = res.data;
      const filteredBadges = badges.filter((badge) => !starterBadges.find((rb) => rb.id === badge.id));
      const generalOptions = [{ id: -1, name: t('Add all badges') }];
      const filteredBadgesOptions = filteredBadges?.length > 0 ? [...generalOptions, ...filteredBadges] : filteredBadges;
      setBadgeOptions(filteredBadgesOptions);

      return {
        options: filteredBadgesOptions.map((b) => ({ value: b, label: b.name })),
        hasMore: prevOptions.length + badges.length < count,
      };
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }

    return {
      options: [],
      hasMore: false,
    };
  };

  const removeNewStarterBadges = async (badgeId) => {
    const updatedStarterBadges = starterBadges.filter((rb) => rb.id !== badgeId);
    setStarterBadges(updatedStarterBadges);

    setIsEdited(true);
  };

  const removeAllStarterBadges = async () => {
    setStarterBadges([]);
    setIsEdited(true);
  };

  const handleAddNewStarterBadges = () => {
    if (selectedBadgeOption.label === 'Add all badges') {
      setStarterBadges(allBadgeOptions);
    } else {
      const newBadge = badgeOptions.find((c) => c.id === selectedBadgeOption.value.id);
      const updatedStarterBadges = [...starterBadges, newBadge];
      setStarterBadges(updatedStarterBadges);
    }
    setIsEdited(true);
    setIsShowStarterBadge(true);
    setSelectedBadgeOption(null);
  };

  useEffect(() => {
    fetchAllBadgesOptions();
  }, []);

  return (
    <div>
      <div className="badge-requirement-container">
        <div className="badge-requirement-title">{t('Starter Badge Requirements')}</div>
        <div className="section-title">{t('Number of Starter Badges Required')}</div>
        <p className="section-description">{t('Number of badges Explorers must earn before becoming a Vivinaut')}</p>
        <div className="badge-requirement-inputs">
          <input
            type="number"
            value={starterBadgeRequirementCount}
            onChange={(e) => {
              setStarterBadgeRequirementCount(e.target.value);
              setIsEdited(true);
            }}
            min="0"
          />
        </div>
      </div>
      <div className="add-badge">
        <div className="section-title">{t('Add starter badge')}</div>
        <p className="section-description">{t('Selected badges Explorers can earn from before becoming a Vivinaut')}</p>
        <div className="add-inputs">
          <AsyncPaginate
            className="badge-dropdown"
            isClearable
            maxMenuHeight={200}
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            value={selectedBadgeOption}
            loadOptions={fetchBadgeOptions}
            onChange={setSelectedBadgeOption}
            components={{ Option }}
            cacheUniqs={[starterBadges]}
            isDisabled={!authToUpdate}
          />
          <Button status="add" onClick={handleAddNewStarterBadges} disabled={!selectedBadgeOption} />
        </div>
      </div>
      <div className="starter-badges-display">
        <div className="starter-badges">
          <div className={isShowStarterBadge ? 'user-badges-shown-header' : 'user-badges-hidden-header'} onClick={() => setIsShowStarterBadge(!isShowStarterBadge)}>
            <div className="user-badges-header-text">{t('Selected Starter Badges')}</div>
            <div>
              {isShowStarterBadge ? <UpArrowSVG className="show-hide-badges-button" /> : <DownArrowSVG className="show-hide-badges-button" />}
            </div>
          </div>
          {isShowStarterBadge
                && (
                <div className="user-badges-list-container">
                  <Loading show={loading} size="32px" />
                  {starterBadges?.length > 0 ? (
                    <>
                      <ul className="user-badges-list">
                        {starterBadges.map((v) => (
                          <li key={`starter_criteria_badge_${v.id}`}>
                            <div className="badge-info">
                              <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={128} params={badgeImageParams} />
                              <div>{v.name}</div>
                            </div>
                            <Button
                              status={loading ? 'loading' : ''}
                              parentClassName="badge-button"
                              onClick={() => removeNewStarterBadges(v.id)}
                            >
                              {t('Remove Badge')}
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        status={loading ? 'loading' : ''}
                        parentClassName="badge-button"
                        onClick={() => removeAllStarterBadges()}
                      >
                        {t('Remove All Badges')}
                      </Button>
                    </>
                  ) : (
                    <div className="empty-list-description">{t('No starter badges selected')}</div>
                  )}
                </div>
                )}
        </div>
      </div>
    </div>
  );
}

export default StarterBadgeCriteria;
