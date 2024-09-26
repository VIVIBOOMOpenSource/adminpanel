import React, { useState } from 'react';
import './navi-footer.scss';
import { useTranslation } from 'react-i18next';
import NaviLanguageModal from './navi-language-modal';
import { ReactComponent as LanguageSvg } from '../../css/imgs/icon-language.svg';

function NaviFooter() {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="navi-footer">
      <div
        className="navi-footer-button"
        onClick={() => {
          setShowLanguageModal(true);
        }}
      >
        <span className="icon">
          <LanguageSvg />
        </span>
        <span className="text">{t('navi.language')}</span>
      </div>
      <NaviLanguageModal
        show={showLanguageModal}
        handleClose={() => {
          setShowLanguageModal(false);
        }}
      />
    </div>
  );
}

export default NaviFooter;
