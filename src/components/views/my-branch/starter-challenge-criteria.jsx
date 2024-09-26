import React, { useState, useEffect, useCallback } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { components } from 'react-select';
import './starter-challenge-criteria.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import BadgeSvg from 'src/css/imgs/icon-badge.svg';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import { ReactComponent as DownArrowSVG } from 'src/css/imgs/icon-chevron-down.svg';
import { ReactComponent as UpArrowSVG } from 'src/css/imgs/icon-chevron-up.svg';
import { useSelector } from 'react-redux';
import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import { toast } from 'react-toastify';
import ChallengeApi from 'src/apis/viviboom/ChallengeApi';
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

function StarterChallengeCriteria({
  authToUpdate,
  starterChallengeRequirementCount,
  setStarterChallengeRequirementCount,
  setIsEdited,
  starterChallenges,
  setStarterChallenges,
  loading,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const authToken = useSelector((state) => state.user?.authToken);
  const [challengeOptions, setChallengeOptions] = useState([]);
  const [allChallengeOptions, setAllChallengeOptions] = useState([]);
  const [isShowStarterChallenge, setIsShowStarterChallenge] = useState(false);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState(null);

  const fetchAllChallengesOptions = useCallback(async () => {
    try {
      const requestParams = {
        authToken,
        order: BadgeOrderType.LATEST,
      };

      const res = await ChallengeApi.getList(requestParams);
      const { challenges } = res.data;
      const filteredChallenges = challenges.filter((badge) => !starterChallenges.find((sb) => sb.id === badge.id));
      setAllChallengeOptions(filteredChallenges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  }, [authToken, starterChallenges]);

  const fetchChallengeOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };
      if (keywords) requestParams.keywords = keywords;

      const res = await ChallengeApi.getList(requestParams);
      const { challenges, count } = res.data;
      const filteredChallenges = challenges.filter((challenge) => !starterChallenges.find((rc) => rc.id === challenge.id));
      const generalOptions = [{ id: -1, name: t('Add all challenges') }];
      const filteredChallengesOptions = filteredChallenges?.length > 0 ? [...generalOptions, ...filteredChallenges] : filteredChallenges;
      setChallengeOptions(filteredChallengesOptions);

      return {
        options: filteredChallengesOptions.map((c) => ({ value: c, label: c.name })),
        hasMore: prevOptions.length + challenges.length < count,
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

  const removeNewStarterChallenges = async (challengeId) => {
    const updatedStarterChallenges = starterChallenges.filter((rc) => rc.id !== challengeId);
    setStarterChallenges(updatedStarterChallenges);

    setIsEdited(true);
  };

  const removeAllStarterChallenges = async () => {
    setStarterChallenges([]);

    setIsEdited(true);
  };

  const handleAddNewStarterChallenges = () => {
    if (selectedChallengeOption.label === 'Add all challenges') {
      setStarterChallenges(allChallengeOptions);
    } else {
      const newChallenge = challengeOptions.find((c) => c.id === selectedChallengeOption.value.id);
      const updatedStarterChallenges = [...starterChallenges, newChallenge];
      setStarterChallenges(updatedStarterChallenges);
    }
    setIsEdited(true);
    setIsShowStarterChallenge(true);
    setSelectedChallengeOption(null);
  };

  useEffect(() => {
    fetchAllChallengesOptions();
  }, []);

  return (
    <div>
      <div className="challenge-requirement-container">
        <div className="challenge-requirement-title">{t('Starter Challenge Requirement')}</div>
        <div className="section-title">{t('Number of Starter Challenges Required')}</div>
        <p className="section-description">{t('Number of challenges Explorers must earn before becoming a Vivinaut')}</p>
        <div className="challenge-requirement-inputs">
          <input
            type="number"
            value={starterChallengeRequirementCount}
            onChange={(e) => {
              setStarterChallengeRequirementCount(e.target.value);
              setIsEdited(true);
            }}
            min="0"
          />
        </div>
      </div>
      <div className="add-challenge">
        <div className="section-title">{t('Add starter challenge')}</div>
        <p className="section-description">{t('Selected challenges Explorers can earn from before becoming a Vivinaut')}</p>
        <div className="add-inputs">
          <AsyncPaginate
            className="challenge-dropdown"
            isClearable
            maxMenuHeight={200}
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            value={selectedChallengeOption}
            loadOptions={fetchChallengeOptions}
            onChange={setSelectedChallengeOption}
            components={{ Option }}
            cacheUniqs={[starterChallenges]}
            isDisabled={!authToUpdate}
          />
          <Button status="add" onClick={handleAddNewStarterChallenges} disabled={!selectedChallengeOption} />
        </div>
      </div>
      <div className="starter-challenges-display">
        <div className="starter-challenges">
          <div className={isShowStarterChallenge ? 'user-challenges-shown-header' : 'user-challenges-hidden-header'} onClick={() => setIsShowStarterChallenge(!isShowStarterChallenge)}>
            <div className="user-challenges-header-text">{t('Selected Starter Challenges')}</div>
            <div>
              {isShowStarterChallenge ? <UpArrowSVG className="show-hide-challenges-button" /> : <DownArrowSVG className="show-hide-challenges-button" />}
            </div>
          </div>
          {isShowStarterChallenge
              && (
              <div className="user-challenges-list-container">
                <Loading show={loading} size="32px" />
                {starterChallenges?.length > 0 ? (
                  <>
                    <ul className="user-challenges-list">
                      {starterChallenges.map((v) => (
                        <li key={`starter_criteria_challenge_${v.id}`}>
                          <div className="challenge-info">
                            <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={128} params={badgeImageParams} />
                            <div className="challenge-title">{v.name}</div>
                          </div>
                          <Button
                            status={loading ? 'loading' : ''}
                            parentClassName="challenge-button"
                            onClick={() => removeNewStarterChallenges(v.id)}
                          >
                            {t('Remove Challenge')}
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <Button
                      status={loading ? 'loading' : ''}
                      parentClassName="challenge-button"
                      onClick={() => removeAllStarterChallenges()}
                    >
                      {t('Remove All Challenges')}
                    </Button>
                  </>
                ) : (
                  <div className="empty-list-description">{t('No starter challenges selected')}</div>
                )}
              </div>
              )}
        </div>
      </div>
    </div>
  );
}

export default StarterChallengeCriteria;
