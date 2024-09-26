import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './challenge-badges.scss';

import Button from 'src/components/common/button/button';
import Pagination from 'src/components/common/pagination/pagination';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';
import BadgeSvg from 'src/css/imgs/icon-badge.svg';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';
import ChallengeApi from 'src/apis/viviboom/ChallengeApi';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';

const DEFAULT_LIMIT = 9;
const badgeImageParams = { suffix: 'png' };

// custom option component with badge image
function Option({ value, children, ...props }) {
  return (
    <components.Option {...props}>
      <div className="custom-option">
        <MyImage src={value?.imageUri} alt={value?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} params={badgeImageParams} width={128} />
        {children}
      </div>
    </components.Option>
  );
}

function ChallengeBadges({ challengeId, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'badge' });
  const loggedInUser = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [badgeCategories, setBadgeCategories] = useState([]); // badge categories
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedBadgeOption, setSelectedBadgeOption] = useState(null); // badges

  const [challengeBadges, setChallengeBadges] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // utility method
  const clearInputs = () => {
    setSelectedBadgeOption(null);
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

  const fetchChallengeBadges = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        challengeId,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await BadgeApi.getList(requestParams);
      setChallengeBadges(res.data?.badges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [challengeId, loggedInUser.authToken, page]);

  const addChallengeBadge = useCallback(async () => {
    if (!selectedBadgeOption) return toast.error(t('Please select a badge to add'));
    setLoading(true);
    try {
      await ChallengeApi.patch({
        authToken: loggedInUser.authToken,
        challengeId,
        challengeBadges: [{ id: selectedBadgeOption.value.id }],
      });
      toast.success(t('Badge added'));
      setPage(1);
      await fetchChallengeBadges(1);
      clearInputs();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    return setLoading(false);
  }, [challengeId, fetchChallengeBadges, loggedInUser.authToken, selectedBadgeOption, t]);

  const removeChallengeBadge = (id) => async () => {
    if (window.confirm(t('Remove badge for this challenge?'))) {
      setLoading(true);
      try {
        await ChallengeApi.patch({
          authToken: loggedInUser.authToken,
          challengeId,
          challengeBadges: [{ id, isDelete: true }],
        });
        toast.success(t('Badge removed'));
        setPage(1);
        await fetchChallengeBadges(1);
      } catch (err) {
        console.error(err);
        toast.error(err);
      }
      setLoading(false);
    }
  };

  const loadBadgeOptions = async (keywords, prevOptions) => {
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

      const res = await BadgeApi.getList(requestParams);
      const { badges, count } = res.data;
      return {
        options: badges.map((b) => ({ value: b, label: b.name })),
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (challengeId) fetchChallengeBadges();
  }, [challengeId, fetchChallengeBadges]);

  useEffect(() => {
    clearInputs();
  }, [challengeId]);

  if (!challengeId) {
    return <div>{t('Create challenge before adding badges')}</div>;
  }

  return (
    <div className="challenge-badges">
      <div className="add-badges">
        <h2>
          {t('addBadge')}
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
            {t('Choose a badge')}
            :
          </label>
          <AsyncPaginate
            isClearable
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            cacheUniqs={[challengeId, selectedCategoryOption]}
            value={selectedBadgeOption}
            loadOptions={loadBadgeOptions}
            onChange={setSelectedBadgeOption}
            components={{ Option }}
            isDisabled={!authToUpdate}
          />
        </div>
        <Button parentClassName="add-button" value="Add Badge" onClick={addChallengeBadge}>
          {t('Add Badge')}
        </Button>
      </div>

      <div className="challenge-badges">
        <h2>
          {t('Added Badges')}
        </h2>
        {challengeBadges?.length ? (
          <div className="challenge-badges-ctn">
            <div className="challenge-badges-header">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            <Loading show={loading} size="32px" />
            <ul className="challenge-badges-list">
              {challengeBadges?.map((v) => (
                <li key={`challenge${challengeId}-badge_${v.id}`}>
                  <div className="badge-info">
                    <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} params={badgeImageParams} width={128} />
                    <div>{v.name}</div>
                  </div>
                  <Button status={loading ? 'loading' : 'minus'} parentClassName="badge-button" onClick={removeChallengeBadge(v.id)} disabled={!authToUpdate} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>{t('No badge has been added to this challenge yet.')}</div>
        )}
      </div>
    </div>
  );
}

export default ChallengeBadges;
