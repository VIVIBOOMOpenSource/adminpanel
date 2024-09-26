import React from 'react';
import './navi-language-modal.scss';
import Modal from 'src/components/common/modal/modal';
import i18n from 'src/translations/i18n';
import { availableLanguages } from 'src/translations/all';

function NaviLanguageModal({ show, handleClose }) {
  const handleLanguageClick = (code) => () => {
    localStorage.setItem('lang', code);
    const lang = localStorage.getItem('lang');
    i18n.changeLanguage(lang);
    handleClose();
  };

  return (
    <Modal className="navi-language-modal" show={show} handleClose={handleClose}>
      <div>
        <h2>{i18n.t('navi.changeLanguage')}</h2>
        <ul className="available-languages-list">
          {availableLanguages.map((d) => (
            <li key={`lan_${d.code}`} onClick={handleLanguageClick(d.code)}>
              {d.nativeName}
              {' '}
              /
              {d.name}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default NaviLanguageModal;
