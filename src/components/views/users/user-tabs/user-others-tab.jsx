import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import UserApi from 'src/apis/viviboom/UserApi';
import VivicoinApi from 'src/apis/viviboom/VivicoinApi';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';
import Button from 'src/components/common/button/button';

import StaffRolePrivilegeFeatureType from 'src/enums/StaffRolePrivilegeFeatureType';
import StaffRolePrivilegeLevel from 'src/enums/StaffRolePrivilegeLevel';
import { WalletStatusType } from 'src/enums/WalletStatusType';

import './user-others-tab.scss';

const DEFAULT_LIMIT = 9;

function UserOthersTab({ user, onUserDataChanged }) {
  const { t } = useTranslation('translation', { keyPrefix: 'user' });
  const branch = useSelector((state) => state.branch);
  const loggedInUser = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [bookingQuota, setBookingQuota] = useState(null);

  const [wallet, setWallet] = useState();
  const [walletStatus, setWalletStatus] = useState();
  const [walletBalanceDelta, setWalletBalanceDelta] = useState(0);
  const [isAdd, setIsAdd] = useState(true);
  const [uuidCode, setUuidCode] = useState(uuidv4());

  const [usersClaimedReward, setUsersClaimedReward] = useState();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isCreateUser = !user;
  const hasWallet = !!wallet;

  const authToUpdateWallet = useMemo(
    () => branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.WALLET] && branch.userStaffRolePrivilegesHt[StaffRolePrivilegeFeatureType.WALLET] >= StaffRolePrivilegeLevel.UPDATE,
    [branch.userStaffRolePrivilegesHt],
  );

  const fetchUserBookingQuota = useCallback(async () => {
    if (user?.id) {
      const userBookingQuotaRes = await UserApi.getUserBookingQuota({ authToken: loggedInUser.authToken, userId: user.id });
      const {
        weekdaysUsedQuota, weekendsUsedQuota, weekdaysUnusedQuota, weekendsUnusedQuota,
      } = userBookingQuotaRes.data.userBookingQuota;
      setBookingQuota({
        weekdaysUsedQuota, weekendsUsedQuota, weekdaysUnusedQuota, weekendsUnusedQuota,
      });
    } else {
      setBookingQuota(null);
    }
  }, [user?.id, loggedInUser.authToken]);

  const resetWallet = useCallback((w) => {
    setWalletBalanceDelta(0);
    setIsAdd(true);
    setUuidCode(uuidv4());
    setWallet(w);
    setWalletStatus(w?.status);
  }, []);

  const createWallet = useCallback(async () => {
    if (hasWallet) return;

    const requestParams = {
      authToken: loggedInUser.authToken,
      userId: user?.id,
      status: WalletStatusType.ACTIVE,
    };

    setLoading(true);
    try {
      const res = await VivicoinApi.postWallet(requestParams);
      const walletRes = await VivicoinApi.getWallet({ authToken: loggedInUser.authToken, walletId: res.data.walletId });
      resetWallet(walletRes.data.wallet);
      onUserDataChanged();
    } catch (err) {
      toast.error(t('Fail to create wallet'));
      console.log(err);
    }

    setLoading(false);
  }, [hasWallet, loggedInUser.authToken, onUserDataChanged, resetWallet, t, user?.id]);

  const fetchRewardsClaimed = useCallback(async (newPage = page) => {
    if (!user?.id) return;
    const requestParams = {
      authToken: loggedInUser.authToken,
      userId: user?.id,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };
    setLoading(true);
    try {
      const res = await VivicoinApi.getRewardList(requestParams);
      setUsersClaimedReward(res.data?.rewards);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, [loggedInUser, page, user?.id]);

  const updateWalletDetails = useCallback(async () => {
    if (!hasWallet) return;

    setLoading(true);
    const requestParams = {
      authToken: loggedInUser.authToken,
      walletId: wallet?.id,
      clientRequestUuid: uuidCode,
    };

    if (wallet?.status !== walletStatus) {
      requestParams.status = walletStatus;
    }
    if (walletBalanceDelta && !isAdd) {
      requestParams.balanceDelta = -walletBalanceDelta;
    }
    if (walletBalanceDelta && isAdd) {
      requestParams.balanceDelta = walletBalanceDelta;
    }

    try {
      await VivicoinApi.patchWallet(requestParams);
      onUserDataChanged();
      const walletRes = await VivicoinApi.getWallet({ authToken: loggedInUser.authToken, walletId: wallet.id });
      resetWallet(walletRes.data.wallet);
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  }, [hasWallet, isAdd, loggedInUser.authToken, onUserDataChanged, resetWallet, uuidCode, wallet?.id, wallet?.status, walletBalanceDelta, walletStatus]);

  useEffect(() => {
    resetWallet(user?.wallet);
  }, [resetWallet, user?.wallet, user?.id]);

  useEffect(() => {
    fetchUserBookingQuota();
  }, [fetchUserBookingQuota]);

  useEffect(() => {
    fetchRewardsClaimed();
  }, [fetchRewardsClaimed]);

  return (
    <div className="user-other-tab">
      <h3>{t('Event Quota')}</h3>
      {isCreateUser && t('Create User before checking user booking quota')}
      {
        bookingQuota
          && (
            <label>
              {t("Current month's consumed quota")}
              :
              <br />
              {`${t('weekdays')}: ${bookingQuota?.weekdaysUsedQuota} / ${+bookingQuota.weekdaysUsedQuota + bookingQuota.weekdaysUnusedQuota}`}
              <br />
              {`${t('weekends')}: ${bookingQuota?.weekendsUsedQuota} / ${+bookingQuota.weekendsUsedQuota + bookingQuota.weekendsUnusedQuota}`}
              <br />
              <br />
              {' '}
            </label>
          )
      }
      {!isCreateUser && hasWallet && (
        <div className="wallet-section">
          <h3>{t('Wallet')}</h3>
          <div className="item">
            <div className="wallet-balance-container">
              <p>
                {t('Wallet Balance')}
              </p>
              <input
                type="number"
                value={wallet?.balance}
                disabled
              />
            </div>
          </div>
          {isAdd !== undefined && (
          <div className="item">
            <div className="balance-button-container">
              <label>
                <input type="radio" checked={isAdd} onChange={(e) => setIsAdd(e.target.checked)} />
                {t('Add')}
              </label>
              <label>
                <input type="radio" checked={!isAdd} onChange={(e) => setIsAdd(!e.target.checked)} />
                {t('Deduct')}
              </label>
            </div>
            <div className="wallet-balance-container">
              {isAdd ? <p>{t('Amount to Add')}</p> : <p>{t('Amount to Deduct')}</p>}
              <input
                type="number"
                min={0}
                value={walletBalanceDelta}
                onChange={(e) => setWalletBalanceDelta(Number(e.target.value))}
                disabled={loading || !authToUpdateWallet}
              />
            </div>
          </div>
          )}
          <h3>{t('Wallet Status')}</h3>
          <div className="item">
            <select
              disabled={loading || !authToUpdateWallet}
              onChange={(e) => setWalletStatus(e.target.value)}
              value={walletStatus}
            >
              <option value="ACTIVE">{t('ACTIVE')}</option>
              <option value="INACTIVE">{t('INACTIVE')}</option>
              <option value="SUSPENDED">{t('SUSPENDED')}</option>
            </select>
          </div>
          <Button status={loading ? 'loading' : 'save'} disabled={loading || !authToUpdateWallet} onClick={updateWalletDetails}>{t('Update Wallet')}</Button>
          <div className="item">
            <h3 className="wallet-section-title">{t('Rewards Claimed')}</h3>
            <div className="user-claimed-rewards-ctn">
              <div className="user-claimed-rewards-header">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              </div>
              <Loading show={loading} size="32px" />
              <div className="user-claimed-rewards-title">
                <p>{t('Reward Code')}</p>
                <p>{t('Reward Amount')}</p>
              </div>
              <ul className="user-claimed-rewards-list">
                {usersClaimedReward?.length > 0 ? (
                  usersClaimedReward?.map((v) => (
                    <li key={v.id}>
                      <div className="user-claimed-rewards-info">
                        <p>{v.code}</p>
                        <p>{v.amount}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="no-reward-text">{t('No claimed rewards')}</div>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      {!isCreateUser && !hasWallet && (
        <div className="wallet-section">
          <h3>{t('Create User Wallet')}</h3>
          <Button disabled={!authToUpdateWallet} onClick={createWallet}>
            {t('Create Wallet')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserOthersTab;
