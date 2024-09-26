import React, {
  useState, useEffect, useCallback,
  useMemo,
} from 'react';
import './branch-modal.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BranchApi from 'src/apis/viviboom/BranchApi';
import * as ct from 'countries-and-timezones';
import UserReduxActions from 'src/redux/user/UserReduxActions';
import Button from '../../common/button/button';
import Modal from '../../common/modal/modal';
import CarouselHeader from '../../common/carousel/carousel-header';
import Carousel from '../../common/carousel/carousel';

const { getCode, getName, getNames } = require('country-list');

function BranchModal({
  show, handleClose, branch, onBranchDataChanged, authToUpdate, authToCreate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'branch' });
  const loggedInUser = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const [branchEdit, setBranchEdit] = useState();

  const [countryTimezones, setCountryTimeZones] = useState(ct.getAllTimezones());
  const [countries, setCountries] = useState(getNames().sort());

  const [slide, setSlide] = useState(1);

  useEffect(() => {
    if (branch) setBranchEdit(structuredClone(branch));
  }, [branch]);

  const handleModalClose = useCallback(() => {
    // do other stuff
    setLoading(false);
    setSlide(1);
    setBranchEdit({
      branchId: branch?.id, tzIANA: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Singapore', countryISO: 'SG',
    });
    handleClose();
  }, [branch?.id, handleClose]);

  const postPatchBranchDetails = useCallback(async () => {
    const requestParams = {};

    // branch name
    if (!branchEdit?.name) {
      toast.error(t('required', { name: t('Name') }));
      return;
    }
    // branch code
    if (branchEdit?.code?.length > 0 && branchEdit?.code?.length < 6) {
      toast.error(t('Sign up code needs to be 6 characters long'));
      return;
    }
    if (branch) {
      requestParams.branchId = branch?.id;
    }
    if (branchEdit?.name !== branch?.name) {
      requestParams.name = branchEdit?.name;
    }
    if (branchEdit?.code !== branch?.code) {
      requestParams.code = branchEdit?.code;
    }
    if (branchEdit?.countryISO !== branch?.countryISO) {
      requestParams.countryISO = branchEdit?.countryISO.toUpperCase();
    }
    if (branchEdit?.tzIANA !== branch?.tzIANA) {
      requestParams.tzIANA = branchEdit?.tzIANA;
    }

    setLoading(true);
    if (Object.keys(requestParams).length > 0) {
      try {
        if (!branch) {
          await BranchApi.post({ authToken: loggedInUser.authToken, ...requestParams });
          toast.success(t(loggedInUser.institutionId === 1 ? 'Branch created!' : 'Classes created!'));
        } else {
          await BranchApi.patch({ authToken: loggedInUser.authToken, ...requestParams });
          toast.success(t(loggedInUser.institutionId === 1 ? 'Branch saved!' : 'Classes saved!'));
        }
        await UserReduxActions.fetch();
        await UserReduxActions.cacheUniqueStaffRoleBranches();
        handleModalClose();
      } catch (err) {
        toast(err?.response?.data?.message || err.message);
        setLoading(false);
      }
    }

    onBranchDataChanged();
    setLoading(false);
  }, [branchEdit?.name, branchEdit?.code, branchEdit?.countryISO, branchEdit?.tzIANA, branch, onBranchDataChanged, t, handleModalClose, loggedInUser?.authToken, loggedInUser?.institutionId]);

  const deleteBranch = useCallback(async () => {
    setLoading(true);
    try {
      await BranchApi.deleteBranch({ authToken: loggedInUser?.authToken, branchId: branch.id });
      await UserReduxActions.fetch();
      await UserReduxActions.cacheUniqueStaffRoleBranches();
      await onBranchDataChanged();
      handleModalClose();
    } catch (err) {
      toast.error(err.response?.message);
    }
    setLoading(false);
  }, [loggedInUser?.authToken, branch?.id, onBranchDataChanged, handleModalClose]);

  const onSubmitForm = useCallback(async (evt) => {
    evt.preventDefault();
    await postPatchBranchDetails();
  }, [postPatchBranchDetails]);

  const country = useMemo(() => getName(branchEdit?.countryISO || 'SG'), [branchEdit?.countryISO]);

  return (
    <Modal
      className="branch-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div className="form-container">
        <form onSubmit={onSubmitForm}>
          <CarouselHeader className="entry-options hlo" slideTo={slide}>
            <div onClick={() => { setSlide(1); }}>
              {t(loggedInUser.institutionId === 1 ? 'Branch Info' : 'Class Info')}
            </div>
            <div onClick={() => { setSlide(2); }}>
              {t('Danger Zone')}
            </div>
          </CarouselHeader>
          <Carousel slideTo={slide}>
            <div>
              <div>
                <h3>{t(loggedInUser.institutionId === 1 ? 'Branch Info' : 'Class Info')}</h3>
                <label>
                  {t(loggedInUser.institutionId === 1 ? 'Branch Name' : 'Class Name')}
                  {!branch && '*'}
                </label>
                <input
                  type="text"
                  placeholder={t(loggedInUser.institutionId === 1 ? 'Branch Name' : 'Class Name')}
                  disabled={loading || !authToUpdate}
                  onChange={(e) => { setBranchEdit({ ...branchEdit, name: e.target.value }); }}
                  value={branchEdit?.name || ''}
                />

                <label>
                  {t(loggedInUser.institutionId === 1 ? 'Branch Code (Optional)' : 'Class Code (Optional)')}
                </label>
                {!branch && <div className="branch-code-desc">{t('You may proceed with creation without custom code')}</div>}
                <input
                  type="text"
                  placeholder={t(loggedInUser.institutionId === 1 ? 'Branch Code must be made of 6 alphanumeric characters' : 'Class Code must be made of 6 alphanumeric characters')}
                  disabled={loading || !authToUpdate}
                  onChange={(e) => { setBranchEdit({ ...branchEdit, code: e.target.value }); }}
                  value={branchEdit?.code || ''}
                  maxLength={6}
                  minLength={6}
                />

                <label>
                  {t('Country')}
                  *
                </label>
                <select
                  disabled={loading || !authToUpdate || branch}
                  onChange={(e) => {
                    const isoCode = getCode(e.target.value);
                    setBranchEdit({ ...branchEdit, countryISO: isoCode, tzIANA: ct.getCountry(isoCode)?.timezones[0] });
                  }}
                  value={country}
                >
                  {countries.map((v) => (
                    <option
                      key={v}
                      value={v}
                    >
                      {v}
                    </option>
                  ))}
                </select>

                <label>
                  {t('Country ISO')}
                </label>
                <input
                  type="text"
                  placeholder={t('Country ISO')}
                  disabled={loading || !authToUpdate || branch}
                  value={branchEdit?.countryISO || 'SG'}
                />

                <label>{t('IANA Timezone (Continent/Region)')}</label>
                <select
                  disabled={loading || !authToUpdate || branch}
                  onChange={(e) => {
                    setBranchEdit({ ...branchEdit, tzIANA: e.target.value });
                  }}
                  value={branchEdit?.tzIANA || 'Asia/Singapore'}
                >
                  {Object.keys(countryTimezones).map((v) => (
                    <option
                      key={v}
                      value={v}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {branch ? (
              <div>
                <h3>{t(loggedInUser.institutionId === 1 ? 'Delete Branch' : 'Delete Class')}</h3>
                <Button
                  status={loading ? 'loading' : 'delete'}
                  onClick={() => {
                    if (!branch) alert(t('This is a new branch'));
                    if (window.confirm(t(loggedInUser.institutionId === 1 ? 'Are you sure you want to delete this branch?' : 'Are you sure you want to delete this class?'))) deleteBranch();
                  }}
                  disabled={loading || !authToCreate}
                >
                  {t(loggedInUser.institutionId === 1 ? 'Delete Branch' : 'Delete Class')}
                </Button>
              </div>
            ) : (
              <div>
                <h3>{t(loggedInUser.institutionId === 1 ? 'Cannot delete the branch as it does not exist' : 'Cannot delete the class as it does not exist')}</h3>
              </div>
            )}
          </Carousel>

          <div className={slide === 2 ? 'hide-save-button' : ''}>
            <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default BranchModal;
