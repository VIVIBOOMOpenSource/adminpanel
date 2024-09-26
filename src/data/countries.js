import Sg from 'src/css/imgs/sg.png';
import Ph from 'src/css/imgs/ph.png';
import Jp from 'src/css/imgs/jp.png';
import Lt from 'src/css/imgs/lt.png';
import Ee from 'src/css/imgs/ee.png';
import Us from 'src/css/imgs/us.png';
import Nz from 'src/css/imgs/nz.png';

const countryImages = {
  SG: Sg,
  PH: Ph,
  JP: Jp,
  LT: Lt,
  EE: Ee,
  US: Us,
  NZ: Nz,
};

const countries = [
  {
    label: 'Estonia',
    flag: '🇪🇪',
    code: 'EE',
  },
  {
    label: 'United States',
    flag: '🇺🇸',
    code: 'US',
  },
  {
    label: 'Japan',
    flag: '🇯🇵',
    code: 'JP',
  },
  {
    label: 'Lithuania',
    flag: '🇱🇹',
    code: 'LT',
  },
  {
    label: 'New Zealand',
    flag: '🇳🇿',
    code: 'NZ',
  },
  {
    label: 'Philippines',
    flag: '🇵🇭',
    code: 'PH',
  },
  {
    label: 'Singapore',
    flag: '🇸🇬',
    code: 'SG',
  },
];

const getCountryFlag = (countryISO) => countryImages[countryISO];

export { countries, getCountryFlag };
