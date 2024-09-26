import { useEffect } from 'react';

const useOutsideClick = (ref, callback) => {
  const handleClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('click', handleClick);
    };
  });
};

export default useOutsideClick;
