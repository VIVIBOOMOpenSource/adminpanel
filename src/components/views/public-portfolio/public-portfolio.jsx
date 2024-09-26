import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './public-portfolio.scss';

import PortfolioApi from 'src/apis/viviboom/PortfolioApi';
import Pagination from 'src/components/common/pagination/pagination';
import Button from 'src/components/common/button/button';
import Config from 'src/config';
import CreatePortfolio from './create-portfolio';

const DEFAULT_LIMIT = 20;

const filterTabs = {
  All: {},
  Live: { isPublished: true },
  Drafts: { isPublished: false },
};

function PublicPortfolio() {
  const { t } = useTranslation('translation', { keyPrefix: 'publicPortfolio' });
  const { state } = useLocation();
  const user = useSelector((s) => s.user);
  const [filterTabKey, setFilterTabKey] = useState('All');
  const [keywordInput, setKeywordInput] = useState();
  const [keywords, setKeywords] = useState();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  const [isCreatePortfolio, setCreatePortfolio] = useState(!!state?.isCreate);

  const fetchPortfolios = useCallback(async () => {
    if (isCreatePortfolio) return;

    const requestParams = {
      authToken: user.authToken,
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
      verboseAttributes: ['createdByUser'],
      ...filterTabs[filterTabKey],
    };

    if (keywords) requestParams.keywords = keywords;

    try {
      const res = await PortfolioApi.getList(requestParams);
      setPortfolios(res.data?.portfolios);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  }, [filterTabKey, isCreatePortfolio, keywords, page, user.authToken]);

  const handleFilterTabClick = (key) => {
    setPage(1);
    setTotalPages(1);
    setFilterTabKey(key);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setKeywords(keywordInput);
    setFilterTabKey('All');
    setPage(1);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <div className="public-portfolio">
      {!isCreatePortfolio && !selectedPortfolio && (
        <>
          <div className="public-portfolio-category-content">
            <h1>{t('Public Portfolio')}</h1>
            <ul className="user-sort hlo">
              {Object.keys(filterTabs).map((key) => (
                <li
                  key={key}
                  className={key === filterTabKey ? 'active' : ''}
                  onClick={() => handleFilterTabClick(key)}
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
          <div className="public-portfolio-content">
            <div className="public-portfolio-header">
              <input
                className="search-portfolios"
                type="text"
                value={keywordInput}
                placeholder={t('Search Portfolios')}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
              <Button type="submit" onClick={handleSearch} status="search" value={t('Search')} className="button" />
              <div className="portfolio-add">
                <Button status="add" className="button" onClick={() => setCreatePortfolio(true)}>
                  {t('New Portfolio Page')}
                </Button>
              </div>
            </div>
            <div className="public-portfolio-list">
              <table>
                <thead>
                  <tr className="header">
                    <th>{t('Page')}</th>
                    <th>{t('Link')}</th>
                    <th>{t('Created By')}</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.map((v) => {
                    const link = `${Config.Common.FrontEndUrl}/page/${v.code}`;
                    return (
                      <tr key={`public-page_${v.id}`} onClick={() => setSelectedPortfolio(v)}>
                        <td>{v.code}</td>
                        <td>{!v.isPublished ? '(draft)' : link}</td>
                        <td>{v.createdByUser?.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!portfolios?.length && <div className="no-results">{t('No Public Pages Created')}</div>}
              <div className="public-portfolio-footer">
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
              </div>
            </div>
          </div>
        </>
      )}
      {(isCreatePortfolio || !!selectedPortfolio) && <CreatePortfolio onBack={() => { setSelectedPortfolio(null); setCreatePortfolio(false); }} portfolio={selectedPortfolio} refresh={fetchPortfolios} />}
    </div>
  );
}

export default PublicPortfolio;
