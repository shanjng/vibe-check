import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAuthCallbackParams,
  getHashParams,
  getToken,
} from '../utils/functions';

const RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [didHandleCallback, setDidHandleCallback] = useState(false);

  useEffect(() => {
    if (didHandleCallback) {
      return;
    }

    const queryParams = getAuthCallbackParams(location.search);
    const hashParams = getAuthCallbackParams(location.hash);

    const code = queryParams.code || null;
    const accessToken = hashParams.access_token || null;

    if (code) {
      getToken(code)
        .then(() => {
          setDidHandleCallback(true);
          navigate('/');
        })
        .catch(() => {
          setDidHandleCallback(true);
          navigate('/login');
        });

      return;
    }

    if (accessToken) {
      const expiryTime = Date.now() + Number(hashParams.expires_in || 3600) * 1000;
      localStorage.setItem('params', JSON.stringify(hashParams));
      localStorage.setItem('expiry_time', String(expiryTime));
      setDidHandleCallback(true);
      navigate('/');
      return;
    }

    setDidHandleCallback(true);
    navigate('/login');
  }, [didHandleCallback, location.hash, location.search, navigate]);

  return <div>Redirecting...</div>;
};

export default RedirectPage;
