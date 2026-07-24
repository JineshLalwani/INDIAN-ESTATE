import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { signOutUserSuccess } from '../redux/user/userSlice';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // The login state is persisted in localStorage, but the auth cookie can
  // expire or disappear independently. Verify it so a stale login doesn't
  // leave the user "signed in" while every authenticated request fails.
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    fetch('/api/auth/validate')
      .then((res) => {
        if (!cancelled && (res.status === 401 || res.status === 403)) {
          dispatch(signOutUserSuccess());
        }
      })
      .catch(() => {
        // network hiccup — keep the session, real API calls will surface it
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, dispatch]);

  return currentUser ? <Outlet /> : <Navigate to='/sign-in' />;
}
