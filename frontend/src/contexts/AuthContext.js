import React, { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/userSlice'; 
import LoadingExample from '../components/loadingComponent';
import axios from 'axios';
import { persistor } from '../store'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); 
  const [loading, setLoading] = React.useState(true); 

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch(setUser({ ...userData, token }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    dispatch(clearUser());
    persistor.purge();
      window.location.href="/"

  };

  const fetchUser = async (token) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);

      dispatch(setUser({ ...response.data.user, token }));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout(); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading ? children : <LoadingExample/>}
    </AuthContext.Provider>
  );
};
