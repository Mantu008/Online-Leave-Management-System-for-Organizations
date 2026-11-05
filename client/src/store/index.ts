import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { logout, STORAGE_KEYS } from './slices/authSlice';
import notificationReducer, { clearNotifications } from './slices/notificationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({ reducer: rootReducer, preloadedState });

  // Persist the session for this browser tab, and drop per-user notifications
  // when the session ends. Kept out of reducers so they stay pure.
  let previous = store.getState().auth;
  store.subscribe(() => {
    const { auth } = store.getState();
    if (auth.token === previous.token && auth.user === previous.user) return;
    try {
      if (auth.token && auth.user) {
        sessionStorage.setItem(STORAGE_KEYS.token, auth.token);
        sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.token);
        sessionStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch {
      // Storage can be unavailable (private mode); the in-memory session still works.
    }
    if (previous.token && !auth.token) store.dispatch(clearNotifications());
    previous = auth;
  });

  return store;
}

export const store = createStore();

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export { logout };
