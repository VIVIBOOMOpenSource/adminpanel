import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './quota.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import EventQuotaApi from 'src/apis/viviboom/EventQuotaApi';

import QuotaModal from './quota-modal';

const startYear = 2021;

const filterTabs = {
  'All Quota': {},
  ...Array(new Date().getFullYear() - startYear + 1)
    .fill().map((_, index) => startYear + index)
    .reduce((prev, cur) => ({ ...prev, [cur]: { year: cur } }), []), // populate years from startYear to now
};

const DEFAULT_LIMIT = 20;

function Quota({ authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'quota' });
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [showNewQuota, setShowNewQuota] = useState(false);

  const [filterTabKey, setFilterTabKey] = useState('All Quota');

  const [eventQuotas, setEventQuotas] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEventQuotas = useCallback(async (newPage = page) => {
    if (!authToken) return;

    const requestParams = {
      authToken,
      countryISO: branch.countryISO,
      ...filterTabs[filterTabKey],
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };

    setLoading(true);
    try {
      const res = await EventQuotaApi.getList(requestParams);
      setEventQuotas(res.data?.eventQuotas);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [authToken, branch, filterTabKey, page]);

  useEffect(() => {
    fetchEventQuotas();
  }, [filterTabKey, page]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchEventQuotas(1);
  }, [branch]);

  return (
    <div className="quota">
      <div className="quota-container">
        <div className="quota-category-content">
          <h1>{t('Quotas')}</h1>
          <ul className="user-sort hlo">
            {Object.keys(filterTabs).reverse().map((key) => (
              <li
                key={key}
                className={key === filterTabKey ? 'active' : ''}
                value={key}
                onClick={() => {
                  setFilterTabKey(key);
                  setPage(1);
                  setTotalPages(1);
                }}
              >
                {key === 'All Quota' ? t('All Quota') : key}
              </li>
            ))}
          </ul>
        </div>
        <div className="quota-content">
          <div className="quota-header">
            <div className="quota-search" />
            <div className="quota-add">
              <Button
                status="add"
                className="button"
                disabled={!authToUpdate}
                onClick={() => setShowNewQuota(true)}
              >
                {t('New Quota')}
              </Button>
            </div>
          </div>

          <div className="quota-list">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Country')}</th>
                  <th>{t('Month')}</th>
                  <th>{t('Weekday Quota')}</th>
                  <th>{t('Weekend Quota')}</th>
                  <th>{t('Created Date')}</th>
                  <th>{t('Updated Date')}</th>
                </tr>
              </thead>
              <tbody>
                {eventQuotas.map((v) => (
                  <tr
                    key={`event-quota_${v.id}`}
                    onClick={() => setSelectedQuota(v)}
                  >
                    <td>{v.countryISO}</td>
                    <td>{`${DateTime.local(2017, v.month, 1).monthShort} ${v.year}`}</td>
                    <td>{v.weekdays}</td>
                    <td>{v.weekends}</td>
                    <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                    <td>{DateTime.fromISO(v.updatedAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {!eventQuotas?.length && <div className="no-results">{t('No Results')}</div>}
            <div className="quota-footer">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      <QuotaModal
        show={selectedQuota || showNewQuota}
        handleClose={() => {
          setSelectedQuota(null);
          setShowNewQuota(false);
        }}
        refreshQuota={fetchEventQuotas}
        eventQuota={selectedQuota}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Quota;
