import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './user-badge.scss';

import Button from 'src/components/common/button/button';
import Pagination from 'src/components/common/pagination/pagination';
import Loading from 'src/components/common/loading/loading';
import MyImage from 'src/components/common/MyImage';
import BadgeSvg from 'src/css/imgs/icon-badge.svg';
import PreloadBadgeImage from 'src/css/imgs/placeholder-square-s.jpeg';

import BadgeApi from 'src/apis/viviboom/BadgeApi';
import BadgeCategoryApi from 'src/apis/viviboom/BadgeCategoryApi';
import UserApi from 'src/apis/viviboom/UserApi';

import { BadgeOrderType } from 'src/enums/BadgeOrderType';

const badgeImageParams = { suffix: 'png' };
const DEFAULT_LIMIT = 9;

// custom option component with badge image
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

function UserBadge({ userId, authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const loggedInUser = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [badgeCategories, setBadgeCategories] = useState([]); // badge categories
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedBadgeOption, setSelectedBadgeOption] = useState(null); // badges

  const [reason, setReason] = useState('');

  const [userAwardedBadges, setUserAwardedBadges] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // utility method
  const clearInputs = () => {
    setSelectedBadgeOption(null);
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

  const fetchUserAwardedBadges = useCallback(async (newPage = page) => {
    setLoading(true);
    try {
      const requestParams = {
        authToken: loggedInUser.authToken,
        awardedUserId: userId,
        order: BadgeOrderType.LATEST,
        limit: DEFAULT_LIMIT,
        offset: (newPage - 1) * DEFAULT_LIMIT,
      };

      const res = await BadgeApi.getList(requestParams);
      setUserAwardedBadges(res.data?.badges);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setLoading(false);
  }, [loggedInUser.authToken, page, userId]);

  const awardUserBadge = useCallback(async () => {
    if (!selectedBadgeOption) return toast.error(t('Please select a badge to award'));
    setLoading(true);
    try {
      await UserApi.postBadge({
        authToken: loggedInUser.authToken,
        userId,
        badgeId: selectedBadgeOption.value.id,
        reason,
      });
      toast.success(t('Badge awarded'));
      setPage(1);
      await fetchUserAwardedBadges(1);
      clearInputs();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    return setLoading(false);
  }, [fetchUserAwardedBadges, loggedInUser.authToken, reason, selectedBadgeOption, t, userId]);

  const removeUserBadge = (id) => async () => {
    if (window.confirm(t('Remove badge for this user?'))) {
      setLoading(true);
      try {
        await UserApi.deleteAwardedBadgeChallenge({
          authToken: loggedInUser.authToken,
          userId,
          userAwardedBadgeId: id,
        });
        toast.success(t('Badge removed'));
        setPage(1);
        await fetchUserAwardedBadges(1);
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
    if (userId) fetchUserAwardedBadges();
  }, [fetchUserAwardedBadges, userId]);

  useEffect(() => {
    clearInputs();
  }, [userId]);

  if (!userId) {
    return <div>{t('Create User before adding badges')}</div>;
  }

  return (
    <div className="user-badge">
      <div className="add-user-badge">
        <h2>
          {t('Award user a badge')}
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
            {t('Choose a badge')}
            :
          </label>
          <AsyncPaginate
            isClearable
            menuShouldScrollIntoView={false}
            debounceTimeout={300}
            cacheUniqs={[userId, selectedCategoryOption]}
            value={selectedBadgeOption}
            loadOptions={loadBadgeOptions}
            onChange={setSelectedBadgeOption}
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
        <Button parentClassName="award-badge-button" value="Award Badge" onClick={awardUserBadge}>
          {t('Award Badge')}
        </Button>
      </div>

      <div className="user-badges">
        <h3>
          {t('Awarded badges')}
          :
        </h3>
        {userAwardedBadges.length ? (
          <div className="user-badges-ctn">
            <div className="user-badges-header">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            <Loading show={loading} size="32px" />
            <ul className="user-badges-list">
              {userAwardedBadges.map((v) => (
                <li key={`user_${userId}-awarded-badge_${v.id}`}>
                  <div className="badge-info">
                    <MyImage src={v?.imageUri} alt={v?.name} preloadImage={PreloadBadgeImage} defaultImage={BadgeSvg} width={128} params={badgeImageParams} />
                    <div>{v.name}</div>
                  </div>
                  <Button status={loading ? 'loading' : 'minus'} parentClassName="badge-button" onClick={removeUserBadge(v.id)} disabled={!authToUpdate} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>{t('User has not been awarded badge yet.')}</div>
        )}
      </div>
    </div>
  );
}

export default UserBadge;
