import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './branch-settings.scss';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';

import BranchApi from 'src/apis/viviboom/BranchApi';
import Button from 'src/components/common/button/button';

function BranchSettings({ authToUpdate }) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);
  const [loading, setLoading] = useState(false);
  const [allowVivicoinRewards, setAllowVivicoinRewards] = useState(branch.allowVivicoinRewards);
  const [allowVisitorAttendance, setAllowVisitorAttendance] = useState(branch.allowVisitorAttendance);
  const [allowEventBooking, setAllowEventBooking] = useState(branch.allowEventBooking);

  const handleSubmit = async () => {
    if (!allowVivicoinRewards && !allowVisitorAttendance && !allowEventBooking) return;

    const requestBody = {
      authToken,
      branchId: branch.id,
    };

    if (allowVivicoinRewards) requestBody.allowVivicoinRewards = allowVivicoinRewards;
    if (allowVisitorAttendance) requestBody.allowVisitorAttendance = allowVisitorAttendance;
    if (allowEventBooking) requestBody.allowEventBooking = allowEventBooking;

    setLoading(true);
    try {
      await BranchApi.patch(requestBody);
      await BranchReduxActions.fetch();
      setLoading(false);
      toast.success(('Changes saved!'));
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleAllowVivicoinRewards = (event) => {
    const { value } = event.target;
    if (value === 'Yes') {
      setAllowVivicoinRewards(true);
    } else {
      setAllowVivicoinRewards(false);
    }
  };

  const handleAllowVisitorsChange = (event) => {
    const { value } = event.target;
    if (value === 'Yes') {
      setAllowVisitorAttendance(true);
    } else {
      setAllowVisitorAttendance(false);
    }
  };

  const handleAllowEventBooking = (event) => {
    const { value } = event.target;
    if (value === 'Yes') {
      setAllowEventBooking(true);
    } else {
      setAllowEventBooking(false);
    }
  };

  return (
    <div className="branch-settings-container">
      {authToUpdate ? (
        <div className="branch-container">
          <h2>{t('Branch Details')}</h2>
          <div className="branch-settings-section">
            <div className="enable-settings-section">
              <h2>{t('Allow users to earn rewards')}</h2>
              <label>
                <input
                  type="radio"
                  name="allowVivicoinRewards"
                  value="Yes"
                  checked={allowVivicoinRewards}
                  onChange={handleAllowVivicoinRewards}
                />
                {t('Yes! I would like users to be able to earn rewards')}
              </label>
              <label>
                <input
                  type="radio"
                  name="allowVivicoinRewards"
                  value="No"
                  checked={!allowVivicoinRewards}
                  onChange={handleAllowVivicoinRewards}
                />
                {t('No, do not allow users to earn rewards')}
              </label>
            </div>
            <div className="enable-settings-section">
              <h2>{t('Allow visitors to visit branch')}</h2>
              <label>
                <input
                  type="radio"
                  name="allowVisitors"
                  value="Yes"
                  checked={allowVisitorAttendance}
                  onChange={handleAllowVisitorsChange}
                />
                {t('Yes, I would love for visitors to drop by!')}
              </label>
              <label>
                <input
                  type="radio"
                  name="allowVisitors"
                  value="No"
                  checked={!allowVisitorAttendance}
                  onChange={handleAllowVisitorsChange}
                />
                {t('No, we are unable to accommodate visitors.')}
              </label>
            </div>

            <div className="enable-settings-section">
              <h2>{t('Allow users to book events through VIVIBOOM')}</h2>
              <p>{t('Note: VIVIBOOM does not handle any monetary transaction at the moment.')}</p>
              <label>
                <input
                  type="radio"
                  name="allowEventBooking"
                  value="Yes"
                  checked={allowEventBooking}
                  onChange={handleAllowEventBooking}
                />
                {t('Yes! I would like users to book events through VIVIBOOM')}
              </label>
              <label>
                <input
                  type="radio"
                  name="allowEventBooking"
                  value="No"
                  checked={!allowEventBooking}
                  onChange={handleAllowEventBooking}
                />
                {t('No, do not allow users to book events through VIVIBOOM')}
              </label>
            </div>

            <div className="save-button-container">
              <Button
                status={loading ? 'loading' : 'save'}
                className="save-button"
                onClick={handleSubmit}
              >
                {t('Save changes')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1>{t('Your account status is insufficient to view this page. Please contact a local admin.')}</h1>
        </div>
      )}
    </div>
  );
}

export default BranchSettings;
