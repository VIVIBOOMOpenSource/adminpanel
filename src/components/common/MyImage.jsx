import axios from 'axios';

import React, {
  useCallback, useState, useEffect, memo,
} from 'react';
import { useSelector } from 'react-redux';
import SkeletonBox from './preloader/skeleton-box';

function MyImage({
  src, alt, width, params, preloadImage, defaultImage, isLoading,
}) {
  const authToken = useSelector((state) => state.user?.authToken);
  const [_src, setSrc] = useState(preloadImage);
  const [isImageLoading, setImageLoading] = useState(false);

  const fetchImage = useCallback(async () => {
    if (!src || !authToken) return;
    setImageLoading(true);
    try {
      const res = await axios.get(src, {
        headers: { 'auth-token': authToken },
        params: { width, ...params },
        responseType: 'blob',
      });
      setSrc(URL.createObjectURL(res.data));
    } catch (err) {
      setSrc(defaultImage);
      console.error(`<MyImage> ${src}`, err);
    }
    setImageLoading(false);
  }, [authToken, params, src, width, defaultImage]);

  useEffect(() => {
    if (src?.startsWith?.('http')) fetchImage();
    else if (src) setSrc(src);
    else setSrc(defaultImage);
  }, [src, fetchImage, defaultImage]);

  if (isLoading || isImageLoading) return preloadImage ? <img className="image" src={preloadImage} alt={alt || 'Loading...'} /> : <SkeletonBox />;

  return _src ? <img className="image" src={_src} alt={alt || 'Loading...'} /> : <SkeletonBox />;
}

export default MyImage;
