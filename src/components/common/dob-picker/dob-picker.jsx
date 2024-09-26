import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './dob-picker.scss';
import { DateTime } from 'luxon';

const startYear = 1990;
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const yearCount = new Date().getFullYear() - startYear + 1;
const years = Array(yearCount).fill(0).map((_, index) => startYear + index);

const days = Array.from({ length: 31 }, (_, index) => index + 1);

function daysInMonth(m, y) { // m is 0 indexed: 0-11
  switch (m) {
    case 1:
      return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
    case 8: case 3: case 5: case 10:
      return 30;
    default:
      return 31;
  }
}

function isValid(y, m, d) {
  return (m >= 0 && m < 12 && d > 0 && d <= daysInMonth(m, y));
}

function DobPicker({
  onChange, disabled, defaultValue, isMonthDayYear = false, ...rest
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const onYearChange = (e) => {
    const value = +e.target.value;
    setYear(value);
    if (day && (month || month === 0) && isValid(value, month, day)) {
      onChange(new Date(value, month, day));
    } else if (day && (month || month === 0) && !isValid(value, month, day)) {
      onChange(null);
    }
  };

  const onMonthChange = (e) => {
    const value = +e.target.value;
    setMonth(value);
    if (day && year && isValid(year, value, day)) {
      onChange(new Date(year, value, day));
    } else if (day && year && !isValid(year, value, day)) {
      onChange(null);
    }
  };

  const onDayChange = (e) => {
    const value = +e.target.value;
    setDay(value);
    if (year && (month || month === 0) && isValid(year, month, value)) {
      onChange(new Date(year, month, value));
    } else if (year && (month || month === 0) && !isValid(year, month, value)) {
      onChange(null);
    }
  };

  useEffect(() => {
    if (!year && !month && !day && defaultValue) {
      setYear(DateTime.fromISO(defaultValue).year);
      setMonth(DateTime.fromISO(defaultValue).month - 1);
      setDay(DateTime.fromISO(defaultValue).day);
    }
  }, [defaultValue]);

  return (
    <div>
      <div className="selector-container">
        {(isMonthDayYear) ? (
          <div {...rest}>
            <select
              onChange={onMonthChange}
              value={month}
              disabled={disabled}
              required
            >
              <option value="" hidden>{t('Month')}</option>
              {months.map((m, index) => (
                <option key={m} value={index}>{t(m)}</option>
              ))}
            </select>
            <select
              onChange={onDayChange}
              value={day}
              disabled={disabled}
              required
            >
              <option value="" hidden>{t('Day')}</option>
              {days.map((d) => (
                <option key={`day-${d}`} value={d}>{d}</option>
              ))}
            </select>
            <select
              onChange={onYearChange}
              value={year}
              disabled={disabled}
              required
            >
              <option value="" disabled hidden>{t('Year')}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        ) : (
          <div {...rest}>
            <select
              onChange={onYearChange}
              value={year}
              disabled={disabled}
              required
            >
              <option value="" disabled hidden>{t('Year')}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              onChange={onMonthChange}
              value={month}
              disabled={disabled}
              required
            >
              <option value="" disabled hidden>{t('Month')}</option>
              {months.map((m, index) => (
                <option key={m} value={index}>{t(m)}</option>
              ))}
            </select>
            <select
              onChange={onDayChange}
              value={day}
              disabled={disabled}
              required
            >
              <option value="" disabled hidden>{t('Day')}</option>
              {days.map((d) => (
                <option key={`day-${d}`} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
        {(year && (month || month === 0) && day && !isValid(year, month, day)) && <text className="note">**Invalid Date</text>}
      </div>
    </div>
  );
}

export default DobPicker;
