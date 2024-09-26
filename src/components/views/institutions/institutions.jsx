import React, {
  useState, useEffect, useCallback,
} from 'react';
import './institutions.scss';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import InstitutionApi from 'src/apis/viviboom/InstitutionApi';
import Button from '../../common/button/button';
import Loading from '../../common/loading/loading';

import InstitutionModal from './institution-modal';
import Pagination from '../../common/pagination/pagination';

const filterTypes = {
  keywords: 'Institution Name',
  createdAt: 'Created Date',
};

const sortingOrderTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

const QUERY_ROW_COUNT = 20;

function Institutions({ authToUpdate, authToCreate }) {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('createdAt');
  const [queryOrder, setQueryOrder] = useState('ASC');

  const [queryInstitutionsResult, setQueryInstitutionsResult] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isShowInstitutionModal, setIsShowInstitutionModal] = useState(false);
  const [modalInstitutionToShow, setModalInstitutionShowInstitution] = useState();

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

  const searchInstitutions = useCallback(async () => {
    if (!user.authToken || user.branchId !== 1 || !authToCreate) return; // only admin from vivita can view
    const params = constructSearchParams();
    setLoading(true);
    try {
      const res = await InstitutionApi.getList(params);
      setQueryInstitutionsResult(res.data?.institutions);
      setTotalPages(res.data?.totalPages);
    } catch (e) {
      if (e.response?.data?.message) toast(e.response?.data?.message);
      else toast(t('Fail to fetch data'));
    }
    setLoading(false);
  }, [authToCreate, constructSearchParams, t, user.authToken, user.branchId]);

  useEffect(() => {
    searchInstitutions();
  }, [searchInstitutions]);

  if (user.branchId !== 1 || !authToCreate) return null; // only admin from vivita can view

  return (
    <div className="institutions-comp">
      <div className="users-container">
        <div className="users-container-center">
          <div className="users-container-top">
            <div className="users-search">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchInstitutions();
                }}
              >
                <input
                  type="text"
                  value={query}
                  placeholder={t(user.institutionId === 1 ? 'Search Institutions' : 'Search Classes')}
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
          </div>
          <div className="users-main">
            <table>
              <thead>
                <tr className="header">
                  <th>{t('Institution Name')}</th>
                  <th>{t('Country')}</th>
                  <th>{t('Owner Username')}</th>
                  <th>{t('Owner Email')}</th>
                  <th>{t('Tech Support Username')}</th>
                  <th>{t('Created Date')}</th>
                </tr>
              </thead>
              <tbody>
                {!loading
                  && queryInstitutionsResult?.map((queriedInstitution) => (
                    <tr
                      key={queriedInstitution.id}
                      onClick={() => {
                        setModalInstitutionShowInstitution(queriedInstitution);
                        setIsShowInstitutionModal(true);
                      }}
                    >
                      <td>
                        <div>{queriedInstitution?.name}</div>
                      </td>
                      <td>
                        <div>{queriedInstitution?.countryISO}</div>
                      </td>
                      <td>
                        <div>{queriedInstitution?.users?.[1]?.username || '-'}</div>
                      </td>
                      <td>
                        <div>{queriedInstitution?.users?.[1]?.guardianEmail || '-'}</div>
                      </td>
                      <td>
                        <div>{queriedInstitution?.users?.[0]?.username || '-'}</div>
                      </td>
                      <td>
                        {DateTime.fromISO(queriedInstitution?.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Loading show={loading} size="40px" />
            {queryInstitutionsResult?.length ? (
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

      <InstitutionModal
        show={isShowInstitutionModal}
        handleClose={() => {
          setModalInstitutionShowInstitution(null);
          setIsShowInstitutionModal(false);
        }}
        onInstitutionDataChanged={searchInstitutions}
        institution={modalInstitutionToShow}
        authToUpdate={authToUpdate}
        authToCreate={authToCreate}
      />
    </div>
  );
}

export default Institutions;
