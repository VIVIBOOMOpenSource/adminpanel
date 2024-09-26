import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './badge-challenges.scss';

import Button from 'src/components/common/button/button';
import Pagination from 'src/components/common/pagination/pagination';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';
import ChallengeApi from 'src/apis/viviboom/ChallengeApi';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';

const DEFAULT_LIMIT = 9;

// custom option component with badge image
function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.imageUri} alt={value?.name} preloadImage={PreloadBadgeImage} defaultImage={PreloadBadgeImage} width={256} />
        {children}
      </div>
    </components.Option>
  );
}

function BadgeChallenges({ badgeId, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const loggedInUser = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [badgeCategories, setBadgeCategories] = useState([]); // badge categories
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState(null); // challenges

  const [badgeChallenges, setBadgeChallenges] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // utility method
  const clearInputs = () => {
    setSelectedChallengeOption(null);
    setSelectedCategoryOption(null);
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

  const fetchBadgeChallenges = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        challengeBadgeId: badgeId,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await ChallengeApi.getList(requestParams);
      setBadgeChallenges(res.data?.challenges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [badgeId, loggedInUser.authToken, page]);

  const addBadgeChallenge = useCallback(async () => {
    if (!selectedChallengeOption) return toast.error(t('Please select a challenge to add'));
    setLoading(true);
    try {
      await BadgeApi.patch({
        authToken: loggedInUser.authToken,
        badgeId,
        challenges: [{ id: selectedChallengeOption.value.id }],
      });
      toast.success(t('Challenge added'));
      setPage(1);
      await fetchBadgeChallenges(1);
      clearInputs();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    return setLoading(false);
  }, [badgeId, fetchBadgeChallenges, loggedInUser?.authToken, selectedChallengeOption, t]);

  const removeBadgeChallenge = (id) => async () => {
    if (window.confirm(t('Remove challenge for this badge?'))) {
      setLoading(true);
      try {
        await BadgeApi.patch({
          authToken: loggedInUser.authToken,
          badgeId,
          challenges: [{ id, isDelete: true }],
        });
        toast.success(t('Challenge removed'));
        setPage(1);
        await fetchBadgeChallenges(1);
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
        options: challenges.map((c) => ({ value: c, label: c.name })),
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
    if (badgeId) fetchBadgeChallenges();
  }, [badgeId, fetchBadgeChallenges]);

  useEffect(() => {
    clearInputs();
  }, [badgeId]);

  if (!badgeId) {
    return <div>{t('Create badge before adding challenges')}</div>;
  }

  return (
    <div className="badge-challenges">
      <div className="add-challenges">
        <h2>
          {t('addChallenge')}
          :
        </h2>
        <div className="select-ctn">
          <label>
            {t('Choose a category (optional)')}
            :
          </label>
          <Select
            isClearable
            maxMenuHeight={200}
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
            cacheUniqs={[badgeId, selectedCategoryOption]}
            value={selectedChallengeOption}
            loadOptions={loadChallengeOptions}
            onChange={setSelectedChallengeOption}
            components={{ Option }}
            isDisabled={!authToUpdate}
          />
        </div>
        <Button parentClassName="add-button" value="Add Challenge" onClick={addBadgeChallenge}>
          {t('Add Challenge')}
        </Button>
      </div>

      <div className="badge-challenges">
        <h2>
          {t('Added Challenges')}
        </h2>
        {badgeChallenges?.length ? (
          <div className="badge-challenges-ctn">
            <div className="badge-challenges-header">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            <Loading show={loading} size="32px" />
            <ul className="badge-challenges-list">
              {badgeChallenges?.map((v) => (
                <li key={`badge${badgeId}-challenge_${v.id}`}>
                  <div className="badge-info">
                    <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={PreloadBadgeImage} width={256} />
                    <div>{v.name}</div>
                  </div>
                  <Button status={loading ? 'loading' : 'minus'} parentClassName="badge-button" onClick={removeBadgeChallenge(v.id)} disabled={!authToUpdate} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>{t('No challenge has been added to this badge yet.')}</div>
        )}
      </div>
    </div>
  );
}

export default BadgeChallenges;
