import React, { useState, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import './quota-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';

import EventQuotaApi from 'src/apis/viviboom/EventQuotaApi';

const DEFAULT_WEEKDAY_QUOTA = 999;
const DEFAULT_WEEKEND_QUOTA = 2;

const monthOptions = [
  { value: 1, text: 'January' },
  { value: 2, text: 'February' },
  { value: 3, text: 'March' },
  { value: 4, text: 'April' },
  { value: 5, text: 'May' },
  { value: 6, text: 'June' },
  { value: 7, text: 'July' },
  { value: 8, text: 'August' },
  { value: 9, text: 'September' },
  { value: 10, text: 'October' },
  { value: 11, text: 'November' },
  { value: 12, text: 'December' },
];

const currentDate = DateTime.now();

function QuotaModal({
  show, handleClose, refreshQuota, eventQuota, authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'quota' });
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(1);

  const [month, setMonth] = useState(currentDate.month);

  const [isBulkCreate, setBulkCreate] = useState(false);
  const [endRepeatMonth, setEndRepeatMonth] = useState(currentDate.month);

  const [year, setYear] = useState(currentDate.year);

  const [weekdays, setWeekdays] = useState(DEFAULT_WEEKDAY_QUOTA);
  const [weekends, setWeekends] = useState(DEFAULT_WEEKEND_QUOTA);

  // load data (if necessary)
  useEffect(() => {
    if (eventQuota) {
      setMonth(eventQuota.month);
      setYear(eventQuota.year);
      setWeekdays(eventQuota.weekdays);
      setWeekends(eventQuota.weekends);
    }
  }, [eventQuota]);

  const handleModalClose = () => {
    setTab(1);

    setMonth(currentDate.month);
    setBulkCreate(false);
    setEndRepeatMonth(currentDate.month);
    setYear(currentDate.year);
    setWeekdays(DEFAULT_WEEKDAY_QUOTA);
    setWeekends(DEFAULT_WEEKEND_QUOTA);
    handleClose();
  };

  const saveEventQuota = useCallback(async () => {
    // Validation
    if (weekdays < 0) return toast.error(t('Number of weekdays allocated cannot be less than 0.'));
    if (weekends < 0) return toast.error(t('Number of weekends allocated cannot be less than 0.'));

    setLoading(true);

    try {
      if (!eventQuota) {
        // mandatory fileds
        const requestBody = {
          authToken,
          month,
          year,
          weekdays,
          weekends,
          countryISO: branch.countryISO,
        };
        // optional fields
        if (isBulkCreate && endRepeatMonth > month) requestBody.endRepeatMonth = endRepeatMonth;

        await EventQuotaApi.post(requestBody);
        toast.success(t('Event quota created'));
        await refreshQuota(1);
      } else {
        const requestBody = {
          authToken,
          eventQuotaId: eventQuota.id,
          weekdays,
          weekends,
        };
        await EventQuotaApi.patch(requestBody);
        toast.success(t('Event quota edited'));
        await refreshQuota();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message); // duplicate entry
      console.log(err);
    }
    return setLoading(false);
  }, [authToken, branch, endRepeatMonth, eventQuota, isBulkCreate, month, refreshQuota, weekdays, weekends, year, t]);

  const deleteQuota = async () => {
    if (window.confirm(t('Are you sure you want to delete this quota?'))) {
      setLoading(true);
      try {
        await EventQuotaApi.deleteEventQuota({
          authToken,
          eventQuotaId: eventQuota.id,
        });
        toast.success(t('Event quota deleted'));
        await refreshQuota();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const newValue = Number(e.target.value);
    setMonth(newValue);
    if (endRepeatMonth < newValue) setEndRepeatMonth(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveEventQuota();
    handleModalClose();
  };

  return (
    <Modal
      className="quota-modal"
      show={show}
      handleClose={handleModalClose}
    >
      {!eventQuota ? (
        <form onSubmit={handleSubmit}>
          <div>
            <h3>{t('Quota Data')}</h3>
            <div className="form-item">
              <label>{t(isBulkCreate ? 'Start Month' : 'Month')}</label>
              <select onChange={handleMonthChange} value={month}>
                {monthOptions.map((option) => <option key={`start_${option.text}`} value={option.value}>{t(option.text)}</option>)}
              </select>
              <label>
                <input type="checkbox" checked={isBulkCreate} onChange={(e) => setBulkCreate(e.target.checked)} />
                {' '}
                {t('create the same quota for multiple months?')}
              </label>
            </div>
            {isBulkCreate && (
              <div className="form-item">
                <label>{t('End Month')}</label>
                <select
                  onChange={(e) => setEndRepeatMonth(Number(e.target.value))}
                  value={endRepeatMonth}
                >
                  {monthOptions
                    .filter((option) => option.value >= month)
                    .map((option) => <option key={`end_${option.text}`} value={option.value}>{t(option.text)}</option>)}
                </select>
              </div>
            )}
            <div className="form-item">
              <label>{t('Year')}</label>
              <input
                type="number"
                onChange={(e) => setYear(Number(e.target.value))}
                value={year}
              />
            </div>
            <div className="form-item">
              <label>{t('Weekdays')}</label>
              <input
                type="number"
                disabled={loading}
                onChange={(e) => setWeekdays(Number(e.target.value))}
                value={weekdays}
              />
            </div>
            <div className="form-item">
              <label>{t('Weekends')}</label>
              <input
                type="number"
                disabled={loading}
                onChange={(e) => setWeekends(Number(e.target.value))}
                value={weekends}
              />
            </div>
          </div>
          <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} disabled={!authToUpdate} />
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <CarouselHeader className="entry-options hlo" slideTo={tab}>
            <div onClick={() => setTab(1)}>{t('Quota Data')}</div>
            <div onClick={() => setTab(2)}>{t('Danger Zone')}</div>
          </CarouselHeader>
          <Carousel slideTo={tab}>
            <div>
              <h3>{t('Quota Data')}</h3>
              <div className="form-item">
                <label>{t('Month')}</label>
                <select disabled value={month}>
                  {monthOptions.map((option) => <option key={`month_${option.text}`} value={option.value}>{t(option.text)}</option>)}
                </select>
              </div>
              <div className="form-item">
                <label>{t('Year')}</label>
                <input type="number" disabled value={year} />
              </div>
              <div className="form-item">
                <label>{t('Weekdays')}</label>
                <input
                  type="number"
                  disabled={loading || !authToUpdate}
                  onChange={(e) => setWeekdays(Number(e.target.value))}
                  value={weekdays}
                />
              </div>
              <div className="form-item">
                <label>{t('Weekends')}</label>
                <input
                  type="number"
                  disabled={loading || !authToUpdate}
                  onChange={(e) => setWeekends(Number(e.target.value))}
                  value={weekends}
                />
              </div>
              <div className={tab > 1 ? 'hide' : ''}>
                <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} disabled={!authToUpdate} />
              </div>
            </div>
            <div>
              <h3>{t('Danger Zone')}</h3>
              <Button
                status={loading ? 'loading' : 'delete'}
                onClick={deleteQuota}
                disabled={!authToUpdate}
              >
                {t('Delete Quota')}
              </Button>
            </div>
          </Carousel>
        </form>
      )}
    </Modal>
  );
}
export default QuotaModal;
