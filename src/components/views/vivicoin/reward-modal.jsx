import React, {
  useState, useCallback, useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import Config from 'src/config';

import './reward-modal.scss';

import Button from 'src/components/common/button/button';
import MyImage from 'src/components/common/MyImage';
import Modal from 'src/components/common/modal/modal';
import Loading from 'src/components/common/loading/loading';
import Pagination from 'src/components/common/pagination/pagination';

import VivicoinApi from 'src/apis/viviboom/VivicoinApi';
import UserApi from 'src/apis/viviboom/UserApi';
import PreloadImage from 'src/css/imgs/placeholder-square-s.jpeg';
import { ReactComponent as CopySvg } from 'src/css/imgs/icon-copy.svg';
import QRCode from 'react-qr-code';
import CarouselHeader from '../../common/carousel/carousel-header';
import Carousel from '../../common/carousel/carousel';
import PersonSvg from '../../../css/imgs/icon-person.svg';

const DEFAULT_REWARD_CODE_LENGTH = 10;
const DEFAULT_LIMIT = 9;

function RewardModal({
  show,
  handleClose,
  refreshReward,
  reward,
  authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'vivicoin' });
  const authToken = useSelector((state) => state.user.authToken);

  const [loading, setLoading] = useState(false);
  const [rewardCode, setRewardCode] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [expireAtDate, setExpireAtDate] = useState();
  const [rewardLink, setRewardLink] = useState('');

  const [rewardClaimedUsers, setRewardClaimedUsers] = useState();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [slide, setSlide] = useState(1);

  const handleModalClose = useCallback(() => {
    handleClose();
    setRewardCode('');
    setRewardAmount(0);
    setExpireAtDate();
    setRewardClaimedUsers();
    setPage(1);
  }, []);

  const deleteReward = useCallback(async () => {
    if (window.confirm(t('DELETE! Are you absolutely certain that you want to DELETE this reward?'))) {
      setLoading(true);
      const requestBody = {
        authToken,
        rewardId: reward.id,
      };
      try {
        await VivicoinApi.deleteReward(requestBody);
        toast.success(t('Reward deleted'));
        await refreshReward();
        handleModalClose();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  }, [authToken, reward, handleModalClose, refreshReward, t]);

  const generatedRewardCode = useCallback(async () => {
    const rewardsCode = DEFAULT_REWARD_CODE_LENGTH;
    setRewardCode(Math.random().toString(36).substring(2, rewardsCode + 2));
  }, []);

  const saveReward = async () => {
    if (rewardCode === '') {
      toast.error(t('Please create reward code'));
      return;
    }
    if (!rewardAmount) {
      toast.error(t('Please determine reward amount'));
      return;
    }
    const requestBody = {
      authToken,
      code: rewardCode,
      amount: rewardAmount,
    };

    if (expireAtDate) requestBody.expireAt = expireAtDate;

    setLoading(true);
    try {
      await VivicoinApi.postReward(requestBody);
      await refreshReward();
      handleModalClose();
      toast.success(t('Reward added'));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  };

  const updateReward = async () => {
    const requestBody = {
      authToken,
      rewardId: reward.id,
      code: rewardCode,
      amount: rewardAmount,
      expireAt: expireAtDate,
    };
    setLoading(true);
    try {
      await VivicoinApi.patchReward(requestBody);
      await refreshReward();
      handleModalClose();
      toast.success(t('Reward modified'));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reward) {
      await updateReward();
    } else {
      await saveReward();
    }
  };

  const getRewardClaimedUsers = useCallback(async (newPage = page) => {
    const requestParams = {
      authToken,
      rewardId: reward?.id,
      limit: DEFAULT_LIMIT,
      offset: (newPage - 1) * DEFAULT_LIMIT,
    };
    setLoading(true);
    try {
      const res = await UserApi.getList(requestParams);
      setRewardClaimedUsers(res.data?.users);
      setTotalPages(res.data?.totalPages);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, [authToken, page, reward]);

  const onCopy = () => {
    navigator.clipboard.writeText(rewardLink);
    toast.success('Reward link copied!');
  };

  const downloadQR = () => {
    const svgElement = document.getElementById(reward?.id);
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    const { outerHTML } = svgElement;
    const blob = new Blob([outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(blob);
    const image = new Image();
    image.src = blobURL;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      const png = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `${reward?.code}.png`;
      document.body.appendChild(link);
      link.href = png;
      link.click();
      document.body.removeChild(link);
    };
  };

  useEffect(() => {
    if (reward) {
      getRewardClaimedUsers();
      setRewardAmount(reward.amount);
      setRewardLink(`${Config.Common.MobileAppUrl}/reward/${encodeURIComponent(reward?.code)}`);
    }
  }, [getRewardClaimedUsers, reward]);

  return (
    <div>
      {reward ? (
        <Modal className="view-reward-modal" show={show} handleClose={handleModalClose}>
          <CarouselHeader className="entry-options" slideTo={slide}>
            <div onClick={() => { setSlide(1); }}>
              {t('Reward Details')}
            </div>
            <div onClick={() => { setSlide(2); }}>
              {t('Reward Assets')}
            </div>
          </CarouselHeader>
          <div className="reward-modal-div">
            <form onSubmit={handleSubmit}>
              <Carousel slideTo={slide}>
                <div>
                  <div className="item first">
                    <label>{t('Reward Code')}</label>
                    <text>{reward?.code || ' '}</text>
                  </div>

                  <div className="item">
                    <label>{t('Amount')}</label>
                    <input type="text" defaultValue={reward?.amount} value={rewardAmount} disabled={!authToUpdate} onChange={(e) => { setRewardAmount(e.target.value); }} />
                  </div>

                  <div className="item">
                    <label>{t('Created At')}</label>
                    <text>{DateTime.fromISO(reward?.createdAt).toLocaleString(DateTime.DATETIME_MED)}</text>
                  </div>

                  <div className="item">
                    <label>{t('Expire At')}</label>
                    <text>{reward?.expireAt ? (DateTime.fromISO(reward?.expireAt).toLocaleString(DateTime.DATETIME_MED)) : t('No Expiry Date')}</text>
                  </div>

                  <div className="item">
                    <label>{t('Reward Link')}</label>
                    <div className="reward-link-container" onClick={onCopy}>
                      <text>{rewardLink || t(' ')}</text>
                      <div className="item-icon"><CopySvg /></div>
                    </div>
                  </div>
                  <div className="item">
                    <label>{t('Claimed By')}</label>
                    <div className="reward-users-ctn">
                      <div className="reward-users-header">
                        <Pagination
                          page={page}
                          totalPages={totalPages}
                          setPage={setPage}
                        />
                      </div>
                      <Loading show={loading} size="32px" />
                      <ul className="reward-users-list">
                        {rewardClaimedUsers?.length > 0 ? (
                          rewardClaimedUsers?.map((v) => (
                            <li key={v.id}>
                              <div className="reward-users-info">
                                <MyImage src={v?.profileImageUri} alt={v?.username} preloadImage={PreloadImage} defaultImage={PersonSvg} />
                                <div>{v.username}</div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <div className="no-user-text">{t('This reward has not been claimed yet!')}</div>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3>{t('Reward QR Code')}</h3>
                  <QRCode
                    id={reward?.id}
                    size={256}
                    value={rewardLink}
                  />
                  <div className="download-button-container">
                    <Button className="download-button" onClick={downloadQR}>{t('Download QR Code')}</Button>
                  </div>
                </div>
              </Carousel>
              <div className="buttons">
                <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
                <Button disabled={!authToUpdate} status={loading ? 'loading' : 'delete'} onClick={deleteReward}>{t('Delete Reward')}</Button>
              </div>
            </form>
          </div>
        </Modal>
      ) : (
        <Modal className="create-reward-modal" show={show} handleClose={handleModalClose}>
          <div className="reward-modal-div">
            <h2>{t('Create Reward')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="item">
                <label>{t('Reward Code')}</label>
                <input type="text" placeholder="Reward Code" value={rewardCode} disabled={!authToUpdate} onChange={(e) => { setRewardCode(e.target.value); }} />
                <div className="code-generator-button">
                  <Button disabled={!authToUpdate} status={loading ? 'loading' : 'update'} onClick={generatedRewardCode}>{t('Generate New Code')}</Button>
                </div>
              </div>

              <div className="item">
                <label>{t('Amount')}</label>
                <input type="text" value={rewardAmount} disabled={!authToUpdate} onChange={(e) => { setRewardAmount(e.target.value); }} />
              </div>

              <div className="item">
                <label>{t('Expire At (Optional)')}</label>
                <input type="date" onChange={(e) => setExpireAtDate(e.target.value)} />
              </div>
              <div className="button">
                <Button type="submit" status={loading ? 'loading' : 'save'} value={t('Save')} />
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RewardModal;