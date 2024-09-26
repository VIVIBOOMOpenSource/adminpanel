import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './starter-criteria.scss';

import Button from 'src/components/common/button/button';

import BranchApi from 'src/apis/viviboom/BranchApi';
import BranchReduxActions from 'src/redux/branch/BranchReduxActions';
import StarterBadgeCriteria from './starter-badge-criteria';
import StarterChallengeCriteria from './starter-challenge-criteria';

function getArrayForUpdate(prevArr, arr) {
  return [
    // new items
    ...arr.filter((item1) => !prevArr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id })),
    // deleted items
    ...prevArr.filter((item1) => !arr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, isDelete: true })),
  ];
}

function StarterCriteria({
  authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'myBranch' });
  const authToken = useSelector((state) => state.user?.authToken);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);

  const [prevStarterBadges, setPrevStarterBadges] = useState([]);
  const [prevStarterChallenges, setPrevStarterChallenges] = useState([]);

  const [starterBadges, setStarterBadges] = useState([]);
  const [starterBadgeRequirementCount, setStarterBadgeRequirementCount] = useState(branch?.starterBadgeRequirementCount);

  const [starterChallenges, setStarterChallenges] = useState([]);
  const [starterChallengeRequirementCount, setStarterChallengeRequirementCount] = useState(branch?.starterChallengeRequirementCount);

  const [starterAttendanceRequirementCount, setStarterAttendanceRequirementCount] = useState(branch?.starterAttendanceRequirementCount);

  const [isEdited, setIsEdited] = useState(false);

  const [warningMessage, setWarningMessage] = useState('');

  const isStarterCriteriaEnabled = useMemo(() => starterBadgeRequirementCount > 0 || starterChallengeRequirementCount > 0 || starterAttendanceRequirementCount > 0, [starterAttendanceRequirementCount, starterBadgeRequirementCount, starterChallengeRequirementCount]);

  const fetchStarterBadges = useCallback(async () => {
    if (!authToken) return;
    setPrevStarterBadges([]);

    const requestParams = {
      authToken,
      branchId: branch.id,
      isChallenge: false,
    };

    setLoading(true);
    try {
      const res = await BranchApi.getStarterBadgesList(requestParams);
      setPrevStarterBadges(res.data?.badges);
      setStarterBadges(res.data?.badges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, []);

  const fetchStarterChallenges = useCallback(async () => {
    if (!authToken) return;
    setPrevStarterBadges([]);

    const requestParams = {
      authToken,
      branchId: branch.id,
      isChallenge: true,
    };

    setLoading(true);
    try {
      const res = await BranchApi.getStarterBadgesList(requestParams);
      setPrevStarterChallenges(res.data?.badges);
      setStarterChallenges(res.data?.badges);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setLoading(false);
  }, []);

  const editStarterBadgesChallenges = async () => {
    let editList = [];
    editList = getArrayForUpdate(prevStarterBadges, starterBadges);
    editList = [...editList, ...getArrayForUpdate(prevStarterChallenges, starterChallenges)];
    if (editList.length) {
      try {
        const requestBody = {
          authToken,
          branchId: branch.id,
          badges: editList,
        };
        await BranchApi.patchStarterBadge(requestBody);
      } catch (err) {
        console.log(err);
        toast.error(err);
      }
    }
  };

  const editRequirementCount = async () => {
    if (starterBadgeRequirementCount !== branch?.starterBadgeRequirementCount
        || starterChallengeRequirementCount !== branch?.starterChallengeRequirementCount
        || starterAttendanceRequirementCount !== branch?.starterAttendanceRequirementCount) {
      const requestBody = {
        authToken,
        branchId: branch.id,
        starterBadgeRequirementCount,
        starterChallengeRequirementCount,
        starterAttendanceRequirementCount,
      };
      try {
        await BranchApi.patch(requestBody);
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
    }
  };

  const clearStarterBadgesChallengesInputs = async () => {
    setStarterBadges(prevStarterBadges);
    setStarterChallenges(prevStarterChallenges);

    setIsEdited(false);
  };

  const disableStarterCriteria = async () => {
    setLoading(true);
    try {
      const requestBody = {
        authToken,
        branchId: branch.id,
        starterBadgeRequirementCount: 0,
        starterChallengeRequirementCount: 0,
        starterAttendanceRequirementCount: 0,
      };
      await BranchApi.patch(requestBody);
      await BranchReduxActions.fetch();
      toast.success(t('Membership Criteria Disabled'));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    return setLoading(false);
  };

  const toggleStarterCriteriaEnableStatus = async () => {
    if (isStarterCriteriaEnabled) {
      const disableMessage = 'By disabling the membership enrollment criteria, new users will be assigned Vivinaut status. Are you sure you would like to disable the membership enrollment criteria?';

      if (window.confirm(disableMessage)) {
        await disableStarterCriteria();
        await clearStarterBadgesChallengesInputs();
        setStarterBadgeRequirementCount(0);
        setStarterChallengeRequirementCount(0);
        setStarterAttendanceRequirementCount(0);
      }
    } else {
      await fetchStarterBadges();
      await fetchStarterChallenges();
      setStarterBadgeRequirementCount(1);
      setStarterChallengeRequirementCount(1);
      setStarterAttendanceRequirementCount(1);
    }
  };

  const renderRequirementWarning = useCallback(() => {
    if (!isEdited) return <div />;
    if (starterBadgeRequirementCount === '' || starterChallengeRequirementCount === '' || starterAttendanceRequirementCount === '') setWarningMessage(t('Requirement cannot be empty'));
    else if (starterBadgeRequirementCount > starterBadges.length) setWarningMessage(t('Minimum number of badge required is currently higher than the number of badges added. Please add more badges!'));
    else if (starterChallengeRequirementCount > starterChallenges.length) setWarningMessage(t('Minimum number of challenge required is currently higher than the number of challenges added. Please add more challenges!'));
    else if (starterBadgeRequirementCount < 0) setWarningMessage(t('Number of required {{ countType }} cannot be less than 0', { countType: 'badges' }));
    else if (starterChallengeRequirementCount < 0) setWarningMessage(t('Number of required {{ countType }} cannot be less than 0', { countType: 'challenges' }));
    else if (starterAttendanceRequirementCount < 0) setWarningMessage(t('Number of required {{ countType }} cannot be less than 0', { countType: 'events' }));
    else setWarningMessage('');
  }, [isEdited, starterBadgeRequirementCount, starterBadges.length, t, starterChallengeRequirementCount, starterChallenges.length, starterAttendanceRequirementCount]);

  const handleUpdateAllUserStatus = async () => {
    setLoading(true);
    try {
      await BranchApi.postUserStatusUpdate({ authToken, branchId: branch.id });
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  };

  const handleConfirmEdit = async () => {
    setLoading(true);
    renderRequirementWarning();
    await editStarterBadgesChallenges();
    await editRequirementCount();
    await handleUpdateAllUserStatus();
    toast.success(t('Membership Criteria Edited Successfully'));
    setLoading(false);
    setIsEdited(false);
  };

  const handleCancelEdit = async () => {
    await clearStarterBadgesChallengesInputs();
    setStarterBadgeRequirementCount(branch?.starterBadgeRequirementCount);
    setStarterChallengeRequirementCount(branch?.starterChallengeRequirementCount);
    setStarterAttendanceRequirementCount(branch?.starterAttendanceRequirementCount);
  };

  useEffect(() => {
    setStarterBadgeRequirementCount(branch?.starterBadgeRequirementCount);
    setStarterChallengeRequirementCount(branch?.starterChallengeRequirementCount);
    setStarterAttendanceRequirementCount(branch?.starterAttendanceRequirementCount);
  }, [branch?.starterBadgeRequirementCount, branch?.starterChallengeRequirementCount, branch?.starterAttendanceRequirementCount]);

  useEffect(() => {
    fetchStarterBadges();
  }, [fetchStarterBadges]);

  useEffect(() => {
    fetchStarterChallenges();
  }, [fetchStarterChallenges]);

  useEffect(() => {
    renderRequirementWarning();
  }, [renderRequirementWarning]);

  return (
    <div className="starter-criteria-page">
      <div className="starter-criteria-header">
        <div className="starter-criteria-header-title">{t('Membership Criteria')}</div>
        <div className="header-button">
          <Button
            className="button"
            disabled={!authToUpdate}
            onClick={() => toggleStarterCriteriaEnableStatus()}
          >
            {t(isStarterCriteriaEnabled ? 'Disable Membership Criteria' : 'Enable Membership Criteria')}
          </Button>
        </div>
      </div>
      {isStarterCriteriaEnabled && (
        <div className="starter-criteria-content">
          <div className="starter-criteria-description-title">{t('Membership Criteria Description')}</div>
          <div className="starter-criteria-description">{t('By updating the criterias below, all existing Explorers will be promoted to Vivinaut status if they meet the criteria')}</div>
          <div className="starter-criteria-note">
            {t('Note: Existing Vivinauts WILL NOT be demoted to Explorer status if they did not meet the criteria')}
          </div>
          <div className="event-requirement-container">
            <div className="event-requirement-title">{t('Events Requirement')}</div>
            <div className="section-title">{t('Number of Attended Events Required')}</div>
            <p className="section-description">{t('Number of events Explorers must attend before becoming a Vivinaut')}</p>
            <div className="event-requirement-inputs">
              <input
                type="number"
                value={starterAttendanceRequirementCount}
                onChange={(e) => {
                  setStarterAttendanceRequirementCount(e.target.value);
                  setIsEdited(true);
                }}
                min="0"
              />
            </div>
          </div>

          <StarterBadgeCriteria
            authToUpdate={authToUpdate}
            starterBadgeRequirementCount={starterBadgeRequirementCount}
            setStarterBadgeRequirementCount={setStarterBadgeRequirementCount}
            setIsEdited={setIsEdited}
            starterBadges={starterBadges}
            setStarterBadges={setStarterBadges}
            loading={loading}
          />

          <StarterChallengeCriteria
            authToUpdate={authToUpdate}
            starterChallengeRequirementCount={starterChallengeRequirementCount}
            setStarterChallengeRequirementCount={setStarterChallengeRequirementCount}
            setIsEdited={setIsEdited}
            starterChallenges={starterChallenges}
            setStarterChallenges={setStarterChallenges}
            loading={loading}
          />

            {isEdited && (
              <div className="submit">
                {warningMessage !== '' && (
                <div>
                  <h4 className="warning-message">{warningMessage}</h4>
                </div>
                )}
                <div className="edit-buttons">
                  <Button
                    type="button"
                    className="edit-button"
                    onClick={() => handleCancelEdit()}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    type="button"
                    className="edit-button"
                    onClick={() => handleConfirmEdit()}
                    disabled={warningMessage !== ''}
                  >
                    {t('Confirm Edit')}
                  </Button>
                </div>
              </div>
            )}
        </div>
      )}
      {!isStarterCriteriaEnabled && (
        <div className="starter-criteria-disabled-content">
          <h2>{t('Membership Criteria have been disabled for this branch')}</h2>
        </div>
      )}
    </div>
  );
}

export default StarterCriteria;
