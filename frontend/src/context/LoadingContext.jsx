import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from '../components/Shared/Loader';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState({ visible: false, message: '', subtext: '' });

  const show = useCallback((message = 'Loading…', subtext = '') => {
    setLoading({ visible: true, message, subtext });
  }, []);

  const hide = useCallback(() => {
    setLoading({ visible: false, message: '', subtext: '' });
  }, []);

  return (
    <LoadingContext.Provider value={{ show, hide, loading }}>
      {children}
      {loading.visible && (
        <Loader fullScreen message={loading.message} subtext={loading.subtext} />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};

export default LoadingContext;
