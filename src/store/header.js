import { useGlobal, useEffect, useState } from 'reactn';

import { clone } from '../utils/clone';

const useHeaderState = () => {
  const [header, setHeader] = useGlobal('header');
  const [checkHeader, setCheckHeader] = useState(false);

  const toggleMenu = () => {
    const headerClone = clone(header);
    headerClone.menuOpen = !headerClone.menuOpen;

    setHeader(headerClone);
  };

  const popstateListener = (href) => {
    setCheckHeader(true);
  };

  useEffect(() => {
    window.addEventListener('popstate', popstateListener);
    return () => {
      window.removeEventListener('popstate', popstateListener, false);
    };
  }, []);

  useEffect(() => {
    if (checkHeader) {
      if (header.menuOpen) {
        const headerClone = clone(header);
        headerClone.menuOpen = !headerClone.menuOpen;

        setHeader(headerClone);
      }
      setCheckHeader(false);
    }
  }, [checkHeader, header, setHeader]);

  return { header, toggleMenu };
};

export default useHeaderState;
