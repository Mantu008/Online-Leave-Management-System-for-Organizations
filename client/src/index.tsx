import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { store } from './store';
import { sessionExpired } from './store/slices/authSlice';
import { configureHttp } from './services/http';
import App from './App';
import './index.css';

configureHttp({
  getToken: () => store.getState().auth.token,
  onSessionExpired: (message) => store.dispatch(sessionExpired(message)),
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider maxSnack={3} autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <App />
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>
);
