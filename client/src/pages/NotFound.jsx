import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center gap-4 py-28 px-4 text-center'>
      <h1 className='text-6xl font-bold text-slate-700'>404</h1>
      <p className='text-xl text-slate-600'>
        The page you are looking for does not exist.
      </p>
      <Link
        to='/'
        className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
      >
        Back to home
      </Link>
    </div>
  );
}
