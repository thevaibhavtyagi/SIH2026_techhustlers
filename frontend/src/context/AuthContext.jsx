import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authApi, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const errorMessage = (err) => err?.response?.data?.message || 'Something went wrong. Please try again.';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // The refresh token is single-use (rotated on every call), so two
  // concurrent calls — e.g. React StrictMode's double-invoked mount effect —
  // would race: one rotates it and wins, the other reuses the now-revoked
  // token and 401s, potentially clobbering state after the winner already
  // succeeded. Guard so the effect's body only ever actually runs once.
  const didInit = useRef(false);

  // On first load there's no access token in memory (it's never persisted),
  // so silently try to mint a new one from the httpOnly refresh cookie.
  // A 401 here just means "not logged in" — not an error to surface.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        const { accessToken, user } = await authApi.refresh();
        setAccessToken(accessToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch {
        setAccessToken(null);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const login = async (email, password, role) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { user, accessToken } = await authApi.login(email, password, role);
      setAccessToken(accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, user };
    } catch (err) {
      const message = errorMessage(err);
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — proceed to clear local state regardless.
    }
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
