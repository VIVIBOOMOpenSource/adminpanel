import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './vivicoin.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import VivicoinApi from 'src/apis/viviboom/VivicoinApi';

import RewardModal from './reward-modal';

const DEFAULT_LIMIT = 20;

const searchBys = ['Reward Code'];

const filterTabs = {
  Rewards: { isFlagged: false },
};

function Vivicoins({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'vivicoin' });
  const authToken = useSelector((state) => state.user.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showNewReward, setShowNewReward] = useState(null);

  const [filterTabKey, setFilterTabKey] = useState('Rewards');
  const [keywords, setKeywords] = useState('');
  const [searchBy, setSearchBy] = useState(searchBys[0]);
  const [isActive, setIsActive] = useState(undefined);

  const [rewards, setRewards] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRewards = useCallback(async (newPage = page) => {
    setRewards([]);

    const requestParams = {
      authToken,
      userBranchId: branch.id,
      isActive,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };

    setLoading(true);
    try {
      if (searchBy === 'Reward Code') {
        requestParams.code = keywords;
      }
      const res = await VivicoinApi.getRewardList(requestParams);
      setRewards(res.data?.rewards);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [page, authToken, isActive, searchBy, keywords, branch]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    await fetchRewards(1);
  };
  const handleFilterTabClick = (key) => () => {
    setPage(1);
    setTotalPages(1);
    setKeywords('');
    setFilterTabKey(key);
  };

  const handleOrderChange = async (e) => {
    if (e.target.value === 'All') {
      setIsActive(undefined);
    } else {
      setIsActive(e.target.value);
    }
    setPage(1);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchRewards(1);
  }, [fetchRewards]);

  return (
    <div className="vivicoin">
      <div className="vivicoin-container">
        <div className="vivicoin-category-content">
          <h1>{t('Vivicoin')}</h1>
          <ul className="user-sort hlo">
            {Object.keys(filterTabs).map((key) => (
              <li key={`tab-${key}`} className={(key === filterTabKey) ? 'active' : ''} value={key} onClick={handleFilterTabClick(key)}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className="vivicoin-content">
          {branch.allowVivicoinRewards ? (
            <div>
              <div className="vivicoin-header">
                <div className="search-container">
                  <form onSubmit={handleSearchSubmit}>
                    {searchBy === 'Reward Code' && <input type="text" value={keywords} placeholder="Search reward code..." onChange={(e) => setKeywords(e.target.value)} />}
                    <select value={isActive} onChange={handleOrderChange}>
                      <option value={null}>{t('All')}</option>
                      <option value={false}>{t('Expired')}</option>
                    </select>
                    <Button type="submit" status="search" value="Search" className="button" />
                    <Button
                      status="add"
                      className="button"
                      disabled={!authToCreate}
                      onClick={() => {
                        setSelectedReward(null);
                        setShowNewReward(true);
                      }}
                    >
                      {t('New')}
                    </Button>
                  </form>
                </div>
              </div>
              <div className="content-table">
                <table>
                  <thead>
                    <tr className="header">
                      <th>{t('Reward Code')}</th>
                      <th>{t('Reward Amount')}</th>
                      <th>{t('Created Date')}</th>
                      <th>{t('Expire At')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((v) => (
                      <tr key={`reward_${v.id}`} onClick={() => setSelectedReward(v)}>
                        <td>{v.code}</td>
                        <td>{v.amount}</td>
                        <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                        <td>{v.expireAt ? DateTime.fromISO(v.expireAt).toLocaleString(DateTime.DATETIME_MED) : t('No Expiry Date')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Loading show={loading} size="40px" />
                {!rewards.length && <div className="no-results">{t('No Results')}</div>}
                <div className="comments-footer">
                  <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
              </div>
            </div>
          ) : (
            <div className="disabled-reward-text">
              <h1 className="reward-label">{t('Rewards Settings')}</h1>
              <h1>{t('Rewards Function have been disabled for this branch')}</h1>
            </div>
          )}
        </div>
      </div>

      <RewardModal
        show={!!selectedReward || showNewReward}
        handleClose={() => {
          setSelectedReward(null);
          setShowNewReward(false);
        }}
        reward={selectedReward}
        refreshReward={fetchRewards}
        authToCreate={authToCreate}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Vivicoins;
