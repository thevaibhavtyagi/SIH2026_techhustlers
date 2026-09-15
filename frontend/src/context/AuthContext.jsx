import { createContext, useContext, useReducer, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

const DEMO_USERS = [
  {
    email: 'admin@mpladsdrishti.gov.in',
    password: 'Admin@123',
    name: 'Dr. Arun Mehta',
    role: ROLES.ADMIN,
    designation: 'MoSPI Admin',
    department: 'Ministry of Statistics & Programme Implementation',
  },
  {
    email: 'dm.varanasi@mpladsdrishti.gov.in',
    password: 'DM@123',
    name: 'Smt. Priya Sharma',
    role: ROLES.DISTRICT_NODAL,
    designation: 'District Magistrate',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
  },
  {
    email: 'mp.varanasi@mpladsdrishti.gov.in',
    password: 'MP@123',
    name: 'Shri Ramesh Tiwari',
    role: ROLES.MP,
    designation: 'Member of Parliament',
    constituency: 'Varanasi',
    state: 'Uttar Pradesh',
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
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('mplads_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch {
        localStorage.removeItem('mplads_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (email, password) => {
    dispatch({ type: 'CLEAR_ERROR' });

    // Check demo users
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      const { password: _, ...userData } = demoUser;
      localStorage.setItem('mplads_user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      return { success: true, user: userData };
    }

    // Check registered users (from Signup page)
    const registeredUsers = JSON.parse(localStorage.getItem('mplads_registered_users') || '[]');
    const registered = registeredUsers.find(u => u.email === email && u.password === password);
    if (registered) {
      const { password: _, ...userData } = registered;
      localStorage.setItem('mplads_user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      return { success: true, user: userData };
    }

    dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid Credentials' });
    return { success: false };
  };

  const register = (formData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    const registeredUsers = JSON.parse(localStorage.getItem('mplads_registered_users') || '[]');

    // Check for existing email
    const allEmails = [...DEMO_USERS.map(u => u.email), ...registeredUsers.map(u => u.email)];
    if (allEmails.includes(formData.email)) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'An account with this email already exists.' });
      return { success: false };
    }

    const newUser = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role, // Role comes from the Signup dropdown
    };

    registeredUsers.push(newUser);
    localStorage.setItem('mplads_registered_users', JSON.stringify(registeredUsers));

    dispatch({ type: 'REGISTER_SUCCESS' });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('mplads_user');
    localStorage.removeItem('mplads_token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
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
