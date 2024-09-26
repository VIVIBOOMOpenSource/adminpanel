/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef } from 'react';
import SkeletonBox from './preloader/skeleton-box';

function MyVideo({
  src, alt, params, defaultImage, isLoading, control, autoplay, ...rest
}) {
  const videoRef = useRef();

  const fullSrc = params && src ? `${src}?${new URLSearchParams(params).toString()}` : src;

  useEffect(() => {
    videoRef.current?.load();
  }, [src]);

  if (isLoading) return <SkeletonBox />;

  return src ? (
    <video controls={control} ref={videoRef} autoPlay={autoplay} {...rest}>
      <source src={fullSrc} />
    </video>
  ) : <img src={defaultImage} alt={alt || 'default video'} />;
}

export default MyVideo;
