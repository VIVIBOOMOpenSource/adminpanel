import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

history.listen((location, action) => {
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event('popstate'));
});

export default history;