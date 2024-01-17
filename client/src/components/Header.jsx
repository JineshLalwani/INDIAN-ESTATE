import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <header className='bg-slate-500 shadow-md' style={{ height: '60px' }}>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-2'> {/* Decreased padding */}
        <Link to='/' className='flex items-center'>
          <img src='Widelogo.png' alt="Logo" className="logo" style={{ width: '200px', height: '40px' }} />
        </Link>
        <form className='bg-slate-300 p-1 rounded-lg flex items-center'> {/* Decreased padding */}
          <input
            type='text'
            placeholder='Search...'
            className='bg-transparent focus:outline-none px-2 py-1' // Decreased padding
            style={{ width: '500px' }}
          />
          <FaSearch className='text-slate-600' />
        </form>
        <ul className='flex gap-2'> {/* Decreased gap */}
          <Link to='/'>
            <li className='hidden sm:inline text-slate-900 hover:underline'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-900 hover:underline'>
              About
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser ? (
              <img className='rounded-full h-7 w-7 object-cover' src={currentUser.avatar} alt='profile' />
            ) : (
              <li className=' text-slate-700 hover:underline'> Sign in</li>
            )}
          </Link>

        </ul>
      </div>
    </header>
  );
}