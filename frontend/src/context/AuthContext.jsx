import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authApi, setAccessToken } from '../services/api';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

// ---------- Demo users (fallback when backend is unreachable) ----------
const DEMO_USERS = [
  {
    email: 'admin@mpladsdrishti.gov.in',
    password: 'Admin@123',
    user: {
      id: 'demo-admin-001',
      name: 'Dr. Arun Mehta',
      email: 'admin@mpladsdrishti.gov.in',
      role: ROLES.ADMIN,
      designation: 'MoSPI Admin',
      department: 'Ministry of Statistics & Programme Implementation',
    },
  },
  {
    email: 'dm.varanasi@mpladsdrishti.gov.in',
    password: 'DM@123',
    user: {
      id: 'demo-dm-001',
      name: 'Smt. Priya Sharma',
      email: 'dm.varanasi@mpladsdrishti.gov.in',
      role: ROLES.DISTRICT_NODAL,
      designation: 'District Magistrate',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
    },
  },
  {
    email: 'mp.varanasi@mpladsdrishti.gov.in',
    password: 'MP@123',
    user: {
      id: 'demo-mp-001',
      name: 'Shri Ramesh Tiwari',
      email: 'mp.varanasi@mpladsdrishti.gov.in',
      role: ROLES.MP,
      designation: 'Member of Parliament',
      constituency: 'Varanasi',
      state: 'Uttar Pradesh',
    },
  },
];

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

// Returns a matching demo user or null.
const matchDemoUser = (email, password, role) => {
  const match = DEMO_USERS.find(
    (d) => d.email === email && d.password === password && d.user.role === role,
  );
  return match ? match.user : null;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const didInit = useRef(false);

  // On first load, try to restore session from refresh cookie (backend)
  // or from localStorage (demo fallback).
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        const { accessToken, user } = await authApi.refresh();
        setAccessToken(accessToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch {
        // Backend unreachable — check for a demo session in localStorage.
        const stored = localStorage.getItem('mplads_demo_user');
        if (stored) {
          try {
            dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(stored) });
          } catch {
            localStorage.removeItem('mplads_demo_user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          setAccessToken(null);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    })();
  }, []);

  const login = async (email, password, role) => {
    dispatch({ type: 'CLEAR_ERROR' });

    // 1. Try the real backend first.
    try {
      const { user, accessToken } = await authApi.login(email, password, role);
      setAccessToken(accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, user };
    } catch {
      // Backend failed or unreachable — try demo fallback.
    }

    // 2. Demo fallback (backend unreachable or errored).
    const demoUser = matchDemoUser(email, password, role);
    if (demoUser) {
      localStorage.setItem('mplads_demo_user', JSON.stringify(demoUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
      return { success: true, user: demoUser };
    }

    dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid credentials or role.' });
    return { success: false, error: 'Invalid credentials or role.' };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — proceed to clear local state regardless.
    }
    setAccessToken(null);
    localStorage.removeItem('mplads_demo_user');
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
