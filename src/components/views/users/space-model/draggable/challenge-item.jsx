import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import MyImage from 'src/components/common/MyImage';
import './challenge-item.scss';

import DefaultChallengePicture from 'src/css/imgs/placeholder-square-s.jpeg';
import Star from 'src/css/imgs/profile/icon-star.png';
import StarOutline from 'src/css/imgs/profile/icon-star-outline.png';
import Clock from 'src/css/imgs/profile/icon-clock.png';

const DEFAULT_CHALLENGE_IMAGE_SIZE = 256;

const difficultyLevels = {
  BEGINNER: {
    stars: [Star, StarOutline, StarOutline],
    label: 'Beginner',
  },
  INTERMEDIATE: {
    stars: [Star, Star, StarOutline],
    label: 'Intermediate',
  },
  ADVANCED: {
    stars: [Star, Star, Star],
    label: 'Advanced',
  },
};

function ChallengeItem({
  challenge,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'spaceModel' });

  const challengeImageParams = useMemo(() => ({ suffix: 'png' }), []);

  const calculateDayHourMin = (time) => {
    let day = 0;
    let hour = 0;
    let minute = 0;

    let completionTime = time;
    if (completionTime >= 1440) {
      day = Math.floor(completionTime / 1440);
      completionTime -= Math.floor(completionTime / 1440) * 1440;
    }
    if (completionTime >= 60) {
      hour = Math.floor(completionTime / 60);
      completionTime -= Math.floor(completionTime / 60) * 60;
    }
    if (completionTime < 60) minute = completionTime;

    return { day, hour, minute };
  };

  const timeToComplete = useMemo(() => {
    const { day, hour, minute } = calculateDayHourMin(challenge?.timeToComplete || 0);
    return [day > 0 ? t('day', { count: day }) : null, hour > 0 ? t('hour', { count: hour }) : null, minute > 0 ? t('minute', { count: minute }) : null]
      .filter(Boolean)
      .join(' ');
  }, [challenge?.timeToComplete, t]);

  const challengeItemSub = (
    <div className="challenge-item-sub">
      <div className="challenge-image">
        <MyImage alt="challenge" src={challenge?.imageUri} defaultImage={DefaultChallengePicture} width={DEFAULT_CHALLENGE_IMAGE_SIZE} params={challengeImageParams} />
      </div>
      <div className="challenge-details">
        <div className="name">
          <div className="text">
            {challenge?.name}
          </div>
          <div className="desc">{challenge?.description}</div>
        </div>
      </div>
      <div className="earned-challenge-users">
        {challenge?.difficulty && (
        <div className="text description">
          <div className="difficulty">
            <div className="stars">
              {challenge?.difficulty && difficultyLevels[challenge.difficulty].stars.map((star, index) => (
                <img key={`star-${index.toString()}`} alt="logo" src={star} />
              ))}
            </div>
            <div className="level">
              {challenge?.difficulty && difficultyLevels[challenge?.difficulty].label}
            </div>
          </div>
        </div>
        )}

        {challenge?.timeToComplete && (
        <div className="text description">
          <div className="difficulty">
            <div className="stars">
              <img alt="logo" src={Clock} />
            </div>
            <div className="level">
              {timeToComplete}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );

  return <div className="profile-challenge-item">{challengeItemSub}</div>;
}

export default ChallengeItem;
