import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import './vivivault.scss';

import Button from 'src/components/common/button/button';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import VivivaultApi from 'src/apis/viviboom/VivivaultApi';
import VaultModal from './vault-modal';

const DEFAULT_LIMIT = 20;

const filterTabs = {
  'Vivivault Details': { isFlagged: false },
};

function Vivivault({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'vivivault' });
  const authToken = useSelector((state) => state.user.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [showNewVaults, setShowNewVaults] = useState(null);

  const [filterTabKey, setFilterTabKey] = useState('Vivivault Details');
  const [searchBy, setSearchBy] = useState('');

  const [vaults, setVaults] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVaults = useCallback(async (newPage = page) => {
    setVaults([]);

    const requestParams = {
      authToken,
      branchId: branch.id,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
      keywords: searchBy,
      verboseAttributes: ['branch'],
    };

    setLoading(true);
    try {
      if (searchBy === 'Vault Code') {
        requestParams.code = searchBy;
      }
      const res = await VivivaultApi.getList(requestParams);
      setVaults(res.data?.vaults);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, [page, authToken, searchBy, branch]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    setPage(1);
    setTotalPages(1);
    await fetchVaults(1);
  };
  const handleFilterTabClick = (key) => () => {
    setPage(1);
    setTotalPages(1);
    setSearchBy('');
    setFilterTabKey(key);
  };

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);
  // for redux states
  useEffect(() => {
    setPage(1);
    fetchVaults(1);
  }, [fetchVaults]);

  return (
    <div className="vivivault">
      <div className="vivivault-container">
        <div className="vivivault-category-content">
          <h1>{t('Vivivault')}</h1>
          <ul className="user-sort hlo">
            {Object.keys(filterTabs).map((key) => (
              <li key={`tab-${key}`} className={(key === filterTabKey) ? 'active' : ''} value={key} onClick={handleFilterTabClick(key)}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className="vivivault-content">
          <div>
            <div className="vivivault-header">
              <div className="search-container">
                <form onSubmit={handleSearchSubmit}>
                  <input type="text" value={searchBy} placeholder="Search vault code..." onChange={(e) => setSearchBy(e.target.value)} />
                  <Button type="submit" status="search" value="Search" className="button" />
                  <Button
                    status="add"
                    className="button"
                    disabled={!authToCreate}
                    onClick={() => {
                      setSelectedVault(null);
                      setShowNewVaults(true);
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
                    <th>{t('Vivivault Code')}</th>
                    <th>{t('Branch')}</th>
                    <th>{t('Service UUID')}</th>
                    <th>{t('Characteristic UUID')}</th>
                    {/* <th>{t('Unlock Code')}</th> */}
                    <th>{t('Created Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vaults.map((v) => (
                    <tr key={`vault_${v.id}`} onClick={() => setSelectedVault(v)}>
                      <td>{v.code}</td>
                      <td>{v.branch?.name}</td>
                      <td>{v.ledServiceUUID}</td>
                      <td>{v.switchCharacteristicUUID}</td>
                      {/* <td>{v.unlockCode}</td> */}
                      <td>{DateTime.fromISO(v.createdAt).toLocaleString(DateTime.DATETIME_MED)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Loading show={loading} size="40px" />
              {!vaults.length && <div className="no-results">{t('No Results')}</div>}
              <div className="comments-footer">
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <VaultModal
        show={!!selectedVault || showNewVaults}
        handleClose={() => {
          setSelectedVault(null);
          setShowNewVaults(false);
        }}
        vault={selectedVault}
        refreshVault={fetchVaults}
        authToUpdate={authToUpdate}
      />
    </div>
  );
}

export default Vivivault;
