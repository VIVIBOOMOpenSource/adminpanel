import React, {
  useState, useCallback,
} from 'react';
import './institution-modal.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import InstitutionApi from 'src/apis/viviboom/InstitutionApi';
import { DateTime } from 'luxon';
import Button from '../../common/button/button';
import Modal from '../../common/modal/modal';
import CarouselHeader from '../../common/carousel/carousel-header';
import Carousel from '../../common/carousel/carousel';

function InstitutionModal({
  show, handleClose, institution, onInstitutionDataChanged, authToCreate,
}) {
  const { t } = useTranslation();
  const loggedInUser = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const [slide, setSlide] = useState(1);

  const handleModalClose = useCallback(() => {
    // do other stuff
    setLoading(false);
    setSlide(1);
    handleClose();
  }, [handleClose]);

  const deleteInstitution = useCallback(async () => {
    setLoading(true);
    try {
      await InstitutionApi.deleteInstitution({ authToken: loggedInUser?.authToken, institutionId: institution.id });
      await onInstitutionDataChanged();
      handleModalClose();
    } catch (err) {
      toast.error(err.response?.message);
    }
    setLoading(false);
  }, [loggedInUser?.authToken, institution?.id, onInstitutionDataChanged, handleModalClose]);

  return (
    <Modal
      className="institution-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div className="form-container">
        <form>
          <CarouselHeader className="entry-options hlo" slideTo={slide}>
            <div onClick={() => { setSlide(1); }}>
              {t('Institution Info')}
            </div>
            <div onClick={() => { setSlide(2); }}>
              {t('Danger Zone')}
            </div>
          </CarouselHeader>
          <Carousel slideTo={slide}>
            <div>
              <div>
                <h3>{t('Institution Info')}</h3>
                <label>
                  {t('Institution Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('Institution Name')}
                  disabled
                  value={institution?.name}
                />

                <label>
                  {t('Country ISO')}
                </label>
                <input
                  type="text"
                  disabled
                  value={institution?.countryISO}
                />

                <label>{t('IANA Timezone (Continent/Region)')}</label>
                <input
                  type="text"
                  disabled
                  value={institution?.tzIANA}
                />

                <label>{t('Create Date')}</label>
                <p className="institution-value">{DateTime.fromISO(institution?.createdAt).toLocaleString(DateTime.DATETIME_MED)}</p>

                <label>{t('Owner Username')}</label>
                <p className="institution-value">{institution?.users?.[1]?.username || '-'}</p>

                <label>{t('Owner Name')}</label>
                <p className="institution-value">{institution?.users?.[1] ? `${institution?.users?.[0]?.givenName} ${institution?.users?.[0]?.familyName}` : '-'}</p>

                <label>{t('Owner Email')}</label>
                <p className="institution-value">{institution?.users?.[1]?.guardianEmail || '-'}</p>

                <label>{t('Tech Support Username')}</label>
                <p className="institution-value">{institution?.users?.[0]?.username || '-'}</p>

                <label>{t('Owner Email Verified')}</label>
                <p className="institution-value">{institution?.users?.[1]?.isEmailVerified ? 'Yes' : 'No'}</p>

                <label>{t('Owner Last Active')}</label>
                <p className="institution-value">{institution?.users?.[1]?.lastActiveAt ? DateTime.fromISO(institution?.users?.[0]?.lastActiveAt).toLocaleString(DateTime.DATETIME_MED) : '-'}</p>
              </div>
            </div>

            {institution ? (
              <div>
                <h3>{t('Delete Institution')}</h3>
                <Button
                  status={loading ? 'loading' : 'delete'}
                  onClick={() => {
                    if (window.confirm(t('Are you sure you want to delete this institution?'))) deleteInstitution();
                  }}
                  disabled={loading || !authToCreate}
                >
                  {t('Delete Institution')}
                </Button>
              </div>
            ) : (
              <div>
                <h3>{t('Cannot delete the institution as it does not exist')}</h3>
              </div>
            )}
          </Carousel>
        </form>
      </div>
    </Modal>
  );
}

export default InstitutionModal;
