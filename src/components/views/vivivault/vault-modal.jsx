import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import Config from 'src/config';

import './vault-modal.scss';

import Button from 'src/components/common/button/button';
import Modal from 'src/components/common/modal/modal';

import VivivaultApi from 'src/apis/viviboom/VivivaultApi';
import QRCode from 'react-qr-code';
import CarouselHeader from '../../common/carousel/carousel-header';
import Carousel from '../../common/carousel/carousel';
import arduinoCode from './arduino';

function VaultModal({
  show,
  handleClose,
  refreshVault,
  vault,
  authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'vivivault' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);
  const [vaultCode, setVaultCode] = useState('');
  const [unlockCode, setUnlockCode] = useState('2');
  const [serviceUUID, setServiceUUID] = useState('');
  const [switchCharacteristicUUID, setSwitchCharacteristicUUID] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [slide, setSlide] = useState(1);

  useEffect(() => {
    if (vault) {
      setVaultCode(vault.code);
      setServiceUUID(vault.ledServiceUUID);
      setSwitchCharacteristicUUID(vault.switchCharacteristicUUID);
      setAdminNotes(vault.adminNotes);
    }
  }, [vault]);

  const qrUrl = useMemo(
    () => `${Config.Common.MobileAppUrl}/vivivault/${encodeURIComponent(vaultCode)}`,
    [vaultCode],
  );

  const handleModalClose = useCallback(async () => {
    handleClose();
    setVaultCode('');
    setServiceUUID('');
    setSwitchCharacteristicUUID('');
    setAdminNotes('');
    setSlide(1);
    await refreshVault;
  }, [handleClose, refreshVault]);

  const deleteVault = useCallback(async () => {
    if (window.confirm(t('DELETE! Are you absolutely certain that you want to DELETE this Vivivault?'))) {
      setLoading(true);
      const requestBody = {
        authToken,
        vaultId: vault.id,
      };
      try {
        await VivivaultApi.deleteVault(requestBody);
        toast.success(t('Vivivault deleted'));
        await refreshVault();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  }, [authToken, vault, handleModalClose, refreshVault, t]);

  const saveVault = async () => {
    if (vaultCode === '') {
      toast.error(t('Please fill in the Vivivault code field'));
      return;
    }
    if (serviceUUID === '') {
      toast.error(t('Please fill in the service UUID field'));
      return;
    }
    if (switchCharacteristicUUID === '') {
      toast.error(t('Please fill in the switch characteristic UUID field'));
      return;
    }
    // default unlock code to 2 until arduino is tested for other unlock codes
    // if (unlockCode === '') {
    //   toast.error(t('Please fill in the unlock Code field'));
    //   return;
    // }
    const requestBody = {
      authToken,
      code: vaultCode,
      ledServiceUUID: serviceUUID,
      switchCharacteristicUUID,
      unlockCode,
      adminNotes,
    };
    setLoading(true);
    try {
      await VivivaultApi.post(requestBody);
      await refreshVault();
      handleModalClose();
      toast.success(t('Vivivault added'));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  };

  const updateVault = async () => {
    const requestBody = {
      authToken,
      vaultId: vault.id,
    };
    if (vault?.code !== vaultCode) requestBody.code = vaultCode;
    if (vault?.adminNotes !== adminNotes) requestBody.adminNotes = adminNotes;
    // default unlock code to 2 until arduino is tested for other unlock codes
    // if (vault?.unlockCode !== unlockCode) requestBody.unlockCode = unlockCode;

    setLoading(true);
    try {
      await VivivaultApi.patch(requestBody);
      await refreshVault();
      handleModalClose();
      toast.success(t('Vivivault modified'));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (vault) {
      await updateVault();
    } else {
      await saveVault();
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById(vault?.id);
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${vault?.code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadCode = () => {
    const code = arduinoCode(vault?.code, vault?.ledServiceUUID, vault?.switchCharacteristicUUID);
    const blob = new Blob([code]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${vault?.code}.ino`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal className="comment-modal" show={show} handleClose={handleModalClose}>
      <CarouselHeader className="entry-options" slideTo={slide}>
        <div onClick={() => { setSlide(1); }}>
          {t('Vivivault Details')}
        </div>
        <div onClick={() => { setSlide(2); }}>
          {t('Vivivault Assets')}
        </div>
      </CarouselHeader>
      <form onSubmit={handleSubmit}>
        <Carousel slideTo={slide}>
          <div>
            {vault ? (
              <div className="comment-modal-div">
                <h3>{t('Edit Vivivault')}</h3>
                <div className="item">
                  <label>{t('Vivivault Code')}</label>
                  <input type="text" defaultValue={vault?.code} value={vaultCode} disabled={!authToUpdate} onChange={(e) => { setVaultCode(e.target.value); }} />
                </div>

                <div className="item">
                  <label>{t('Service UUID')}</label>
                  <input type="text" defaultValue={vault?.ledServiceUUID} value={serviceUUID} disabled />
                </div>

                <div className="item">
                  <label>{t('Characteristic UUID')}</label>
                  <input type="text" defaultValue={vault?.switchCharacteristicUUID} value={switchCharacteristicUUID} disabled />
                </div>

                {/*
                <div className="item">
                  <label>{t('Unlock Code')}</label>
                  <input type="number" value={vault?.unlockCode || ''} disabled onChange={(e) => { setUnlockCode(e.target.value); }} /> */}
                {/* default unlock code to 2 until arduino is tested for other unlock codes */}
                {/* <input type="number" value={vault?.unlockCode || ''} disabled={!authToUpdate} onChange={(e) => { setUnlockCode(e.target.value); }} /> */}
                {/* </div> */}

                <div className="item">
                  <label>{t('Admin Notes')}</label>
                  <textarea type="text" defaultValue={vault?.adminNotes} value={adminNotes} disabled={!authToUpdate} onChange={(e) => { setAdminNotes(e.target.value); }} />
                </div>

                <div className="item">
                  <label>{t('Created At')}</label>
                  <text>{DateTime.fromISO(vault?.createdAt).toLocaleString(DateTime.DATETIME_MED)}</text>
                </div>
              </div>
            ) : (
              <div className="comment-modal-div">
                <h3>{t('Create Vivivault')}</h3>
                <div className="item">
                  <label>{t('Vivivault Code')}</label>
                  <input type="text" value={vaultCode} placeholder="Vivivault Code" disabled={!authToUpdate} onChange={(e) => { setVaultCode(e.target.value); }} />
                </div>

                <div className="item">
                  <label>{t('Service UUID')}</label>
                  <input type="text" value={serviceUUID} placeholder="Service UUID" disabled={!authToUpdate} onChange={(e) => { setServiceUUID(e.target.value); }} />
                  <div className="code-generator-button">
                    <Button disabled={!authToUpdate} status={loading ? 'loading' : 'update'} onClick={() => setServiceUUID(uuidv4())}>{t('Generate Service UUID')}</Button>
                  </div>
                </div>

                <div className="item">
                  <label>{t('Characteristic UUID')}</label>
                  <input type="text" value={switchCharacteristicUUID} placeholder="Characteristic UUID" disabled={!authToUpdate} onChange={(e) => { setSwitchCharacteristicUUID(e.target.value); }} />
                  <div className="code-generator-button">
                    <Button disabled={!authToUpdate} status={loading ? 'loading' : 'update'} onClick={() => setSwitchCharacteristicUUID(uuidv4())}>{t('Generate Characteristic UUID')}</Button>
                  </div>
                </div>

                {/* <div className="item">
                  <label>{t('Unlock Code')}</label>
                  <input type="number" defaultValue={vault?.unlockCode || 2} disabled onChange={(e) => { setUnlockCode(e.target.value); }} /> */}
                {/* default unlock code to 2 until arduino is tested for other unlock codes */}
                {/* <input type="number" value={vault?.unlockCode || ''} disabled={!authToUpdate} onChange={(e) => { setUnlockCode(e.target.value); }} /> */}
                {/* </div> */}

                <div className="item">
                  <label>{t('Admin Notes')}</label>
                  <textarea type="text" value={adminNotes} placeholder="Admin Notes" disabled={!authToUpdate} onChange={(e) => { setAdminNotes(e.target.value); }} />
                </div>
              </div>
            )}
          </div>
          <div>
            {vault ? (
              <>
                <div className="comment-modal-div">
                  <h3>{t('Vivivault QR Code')}</h3>
                  {(vaultCode === '') && (
                    <div className="empty-qr-code-text">
                      {t('This is an empty QR Code. Please fill in the fields in "Vivivault Details" to download the correct QR Code.')}
                    </div>
                  )}
                  <QRCode
                    id={vault?.id || 0}
                    size={256}
                    value={qrUrl}
                  />
                  <div className="download-button-container">
                    <Button className="download-button" onClick={downloadQR}>{t('Download QR Code')}</Button>
                  </div>
                </div>
                <div className="comment-modal-div">
                  <h3>{t('Vivivault Arduino File')}</h3>
                  <p>{t('This file is to be downloaded into the Arduino used for the Vivivault.')}</p>
                  <div className="download-button-container">
                    <Button className="download-button" onClick={downloadCode}>{t('Download Arduino File')}</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="comment-modal-div">
                {t('This section is only available after creating Vivivault.')}
                {' '}
              </div>
            )}

          </div>
        </Carousel>
        {vault ? (
          <div className="buttons">
            <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
            {slide === 1 && <Button disabled={!authToUpdate} status={loading ? 'loading' : 'delete'} onClick={deleteVault}>{t('Delete Vivivault')}</Button>}
          </div>
        ) : (
          <div className="button">
            <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
          </div>
        )}
      </form>
    </Modal>
  );
}

export default VaultModal;
