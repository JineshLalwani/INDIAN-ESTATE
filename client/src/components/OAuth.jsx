import { useState } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const handleGoogleClick = async () => {
    setError(null);
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setError(
        'Google sign-in is not configured: add VITE_FIREBASE_API_KEY to client/.env and restart the dev server.'
      );
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      console.log('could not sign in with google', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return; // user dismissed the popup, not an error
      }
      setError(
        err.code === 'auth/invalid-api-key'
          ? 'Google sign-in is misconfigured: check VITE_FIREBASE_API_KEY in client/.env.'
          : 'Could not sign in with Google. Please try again.'
      );
    }
  };
  return (
    <>
      <button
        onClick={handleGoogleClick}
        type='button'
        className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
      >
        Continue with google
      </button>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </>
  );
}
