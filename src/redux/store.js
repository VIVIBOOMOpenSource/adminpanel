import { configureStore, nanoid, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import userReducer from './user';
import branchReducer from './branch';
import institutionReducer from './institution';

const encryptKey = String.fromCharCode(65, 117, 81, 84, 53, 72, 100, 104, 101, 122, 86, 116, 119, 79, 65, 73, 122, 97, 83, 122, 74, 72, 97, 113, 104, 108, 106, 95, 55, 108, 73, 121, 65, 105, 117, 108, 95, 51, 73);

let encryptSalt = localStorage.getItem('encryptSalt');
if (!encryptSalt) {
  encryptSalt = nanoid();
  localStorage.setItem('encryptSalt', encryptSalt);
}

const encryptor = encryptTransform({
  secretKey: `${encryptSalt}${encryptKey}`,
  onError: (e) => {
    console.log(`Redux persist encryptor error:\n${e}}`);
  },
});

const encryptConfig = (key) => ({
  timeout: 0,
  key,
  storage,
  transforms: [encryptor],
});

const rootReducer = combineReducers({
  user: persistReducer(encryptConfig('user'), userReducer),
  branch: branchReducer,
  institution: institutionReducer,
});

const persistedReducer = persistReducer(encryptConfig('root'), rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export default store;
