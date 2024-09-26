import React, {
  useState, useEffect, useCallback,
} from 'react';
import './branches.scss';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import BranchApi from 'src/apis/viviboom/BranchApi';
import Button from '../../common/button/button';
import Loading from '../../common/loading/loading';

import BranchModal from './branch-modal';
import Pagination from '../../common/pagination/pagination';

const filterTypes = {
  name: 'Branch Name',
  code: 'Branch Sign-up Code',
  createdAt: 'Created Date',
};

const sortingOrderTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

const QUERY_ROW_COUNT = 100;

function Branches({ authToUpdate, authToCreate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'branch' });
  const user = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('name');
  const [queryOrder, setQueryOrder] = useState('ASC');

  const [queryBranchResult, setQueryBranchesResult] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isShowBranchModal, setIsShowBranchModal] = useState(false);
  const [modalBranchToShow, setModalBranchShowBranch] = useState();

  const constructSearchParams = useCallback(() => {
    const params = {
      authToken: user.authToken,
      limit: QUERY_ROW_COUNT,
      offset: ((curPage || 1) - 1) * QUERY_ROW_COUNT,
      orderKey: queryType,
      orderDirection: queryOrder,
    };
    if (query) {
      params[queryType] = query;
    }
    return params;
  }, [curPage, query, queryOrder, queryType, user.authToken]);

  const searchBranches = useCallback(async () => {
    if (!user.authToken) return;
    const params = constructSearchParams();
    setLoading(true);
    try {
      const res = await BranchApi.getList(params);
      setQueryBranchesResult(res.data?.branches);
      setTotalPages(res.data?.totalPages);
    } catch (e) {
      if (e.response?.data?.message) toast(e.response?.data?.message);
      else toast(t('Fail to fetch data'));
    }
    setLoading(false);
  }, [constructSearchParams, t, user.authToken]);

  useEffect(() => { searchBranches(); }, [searchBranches]);

  return (
    <div className="branches-comp">
      <div className="users-container">
        <div className="users-container-center">
          <div className="users-container-top">
            <div className="users-search">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchBranches();
                }}
              >
                <input
                  type="text"
                  value={query}
                  placeholder={t(user.institutionId === 1 ? 'Search Branches' : 'Search Classes')}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                />
                <select
                  value={queryType}
                  onChange={(e) => {
                    setQueryType(e.target.value);
                  }}
                >
                  {Object.keys(filterTypes).map((key) => (
                    <option key={key} value={key}>
                      {t(filterTypes[key])}
                    </option>
                  ))}
                </select>
                <select
                  value={queryOrder}
                  onChange={(e) => {
                    setQueryOrder(e.target.value);
                  }}
                >
                  {Object.keys(sortingOrderTypes).map((key) => (
                    <option key={key} value={key}>
                      {t(sortingOrderTypes[key])}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  status="search"
                  value={t('Search')}
                  className="button"
                />
              </form>
            </div>
            <div className="users-add">
              <Button
                status="add"
                className="button"
                onClick={() => {
                  setModalBranchShowBranch(null);
                  setIsShowBranchModal(true);
                }}
                disabled={!authToCreate}
              >
                {t(user.institutionId === 1 ? 'New Branch' : 'New Class')}
              </Button>
            </div>
          </div>
          <div className="users-main">
            <table>
              <thead>
                <tr className="header">
                  <th>{t(user.institutionId === 1 ? 'Branch Name' : 'Class Name')}</th>
                  <th>{t(user.institutionId === 1 ? 'Branch Sign-up Code' : 'Class Sign-up Code')}</th>
                  <th>{t('Created Date')}</th>
                </tr>
              </thead>
              <tbody>
                {!loading
                  && queryBranchResult?.map((queriedBranch) => (
                    <tr
                      key={queriedBranch.id}
                      onClick={() => {
                        setModalBranchShowBranch(queriedBranch);
                        setIsShowBranchModal(true);
                      }}
                    >
                      <td>
                        <div>{queriedBranch?.name}</div>
                      </td>
                      <td>
                        {queriedBranch?.code || t('No Code Found')}
                      </td>
                      <td>
                        {DateTime.fromISO(queriedBranch?.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {queryBranchResult?.length !== 0 ? (
              ''
            ) : (
              <div className="no-results">{t('No Results')}</div>
            )}
            <div className="users-main-footer">
              <Pagination
                page={curPage}
                totalPages={totalPages}
                setPage={setCurPage}
              />
            </div>
          </div>
        </div>
      </div>

      <BranchModal
        show={isShowBranchModal}
        handleClose={() => {
          setModalBranchShowBranch(null);
          setIsShowBranchModal(false);
        }}
        onBranchDataChanged={searchBranches}
        branch={modalBranchToShow}
        authToUpdate={authToUpdate}
        authToCreate={authToCreate}
      />
    </div>
  );
}

export default Branches;
