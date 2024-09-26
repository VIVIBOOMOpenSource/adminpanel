import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './user-challenge.scss';

import Button from 'src/components/common/button/button';
import Pagination from 'src/components/common/pagination/pagination';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import ChallengeSvg from 'src/css/imgs/icon-badge.svg';
import PreloadChallengeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';
import UserApi from 'src/apis/viviboom/UserApi';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';
import ChallengeApi from 'src/apis/viviboom/ChallengeApi';

const challengeImageParams = { suffix: 'png' };
const DEFAULT_LIMIT = 9;

// custom option component with badge image
function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.imageUri} alt={value?.name} preloadImage={PreloadChallengeImage} defaultImage={ChallengeSvg} width={128} params={challengeImageParams} />
        {children}
      </div>
    </components.Option>
  );
}

function UserChallenge({ userId, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const loggedInUser = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [badgeCategories, setBadgeCategories] = useState([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState(null);

  const [reason, setReason] = useState('');

  const [userAwardedChallenges, setUserAwardedChallenges] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // utility method
  const clearInputs = () => {
    setSelectedChallengeOption(null);
    setSelectedCategoryOption(null);
    setReason('');
  };

  const fetchCategories = useCallback(async () => {
    if (!loggedInUser.authToken) return;
    try {
      const res = await BadgeCategoryApi.getList({ authToken: loggedInUser.authToken });
      setBadgeCategories(res.data?.badgeCategories?.map((b) => ({ value: b.id, label: b.name })));
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  }, [loggedInUser]);

  const fetchUserAwardedChallenges = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        awardedUserId: userId,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await ChallengeApi.getList(requestParams);
      setUserAwardedChallenges(res.data?.challenges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [loggedInUser.authToken, page, userId]);

  const awardUserChallenge = useCallback(async () => {
    if (!selectedChallengeOption) return toast.error(t('Please select a challenge to award'));
    setLoading(true);
    try {
      await UserApi.postBadge({
        authToken: loggedInUser.authToken,
        userId,
        badgeId: selectedChallengeOption.value.id,
        reason,
      });
      toast.success(t('Challenge awarded'));
      setPage(1);
      await fetchUserAwardedChallenges(1);
      clearInputs();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    return setLoading(false);
  }, [fetchUserAwardedChallenges, loggedInUser.authToken, reason, selectedChallengeOption, t, userId]);

  const removeUserChallenge = (id) => async () => {
    if (window.confirm(t('Remove challenge for this user?'))) {
      setLoading(true);
      try {
        await UserApi.deleteAwardedBadgeChallenge({
          authToken: loggedInUser.authToken,
          userId,
          userAwardedBadgeId: id,
        });
        toast.success(t('Challenge removed'));
        setPage(1);
        await fetchUserAwardedChallenges(1);
      } catch (err) {
        console.error(err);
        toast.error(err);
      }
      setLoading(false);
    }
  };

  const loadChallengeOptions = async (keywords, prevOptions) => {
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: prevOptions.length,
      };
      // if badgeCategoryId is undefined, fetch all badges, else:
      if (selectedCategoryOption) requestParams.badgeCategoryId = selectedCategoryOption.value;
      if (keywords) requestParams.keywords = keywords;

      const res = await ChallengeApi.getList(requestParams);
      const { challenges, count } = res.data;
      return {
        options: challenges.map((b) => ({ value: b, label: b.name })),
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (userId) fetchUserAwardedChallenges();
  }, [fetchUserAwardedChallenges, userId]);

  useEffect(() => {
    clearInputs();
  }, [userId]);

  if (!userId) {
    return <div>{t('Create User before adding challenges')}</div>;
  }

  return (
    <div className="user-challenge">
      <div className="add-user-challenge">
        <h2>
          {t('Award user a challenge')}
          :
        </h2>
        <div className="select-ctn">
          <label>
            {t('Choose a badge category (optional)')}
            :
          </label>
          <Select
            isClearable
            menuShouldScrollIntoView={false}
            value={selectedCategoryOption}
            options={badgeCategories}
            onChange={setSelectedCategoryOption}
            isDisabled={!authToUpdate}
          />
        </div>
        <div className="select-ctn">
          <label>
            {t('Choose a challenge')}
            :
          </label>
          <AsyncPaginate
            isClearable
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            cacheUniqs={[userId, selectedCategoryOption]}
            value={selectedChallengeOption}
            loadOptions={loadChallengeOptions}
            onChange={setSelectedChallengeOption}
            components={{ Option }}
            isDisabled={!authToUpdate}
          />
        </div>
        <div className="text-ctn">
          <label>
            {t('Reason to award (optional)')}
            :
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} disabled={!authToUpdate} />
        </div>
        <Button parentClassName="award-challenge-button" value="Award Challenge" onClick={awardUserChallenge}>
          {t('Award Challenge')}
        </Button>
      </div>

      <div className="user-challenges">
        <h3>
          {t('Awarded challenges')}
          :
        </h3>
        {userAwardedChallenges.length ? (
          <div className="user-challenges-ctn">
            <div className="user-challenges-header">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            <Loading show={loading} size="32px" />
            <ul className="user-challenges-list">
              {userAwardedChallenges.map((v) => (
                <li key={`user_${userId}_awarded_challenge_${v.id}`}>
                  <div className="challenge-info">
                    <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadChallengeImage} defaultImage={ChallengeSvg} width={128} params={challengeImageParams} />
                    <div>{v.name}</div>
                  </div>
                  <Button status={loading ? 'loading' : 'minus'} parentClassName="challenge-button" onClick={removeUserChallenge(v.id)} disabled={!authToUpdate} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>{t('User has not been awarded challenge yet.')}</div>
        )}
      </div>
    </div>
  );
}

export default UserChallenge;
