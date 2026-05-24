import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const adminLinks = [
    { to: '/admin',           label: 'Dashboard' },
    { to: '/admin/vehicles',  label: 'Vehicles' },
     { to: '/admin/fleet',       label: '🚛 Fleet' },
    { to: '/driver',     label: '👤 Drivers' },
     { to: '/admin/shipments',   label: '📦 Shipments' },
     { to: '/admin/routes',    label: 'Routes' },
    { to: '/admin/bookings',  label: 'Bookings' },
  ];
  const userLinks = [
    { to: '/dashboard',   label: 'Home' },
    { to: '/routes',      label: 'Routes' },
    { to: '/my-bookings', label: 'My Bookings' },
  ];
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <nav className="bg-blue-700 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-lg">
          🚌 TransportApp
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {links.map(l => <Link key={l.to} to={l.to} className="hover:underline">{l.label}</Link>)}
          <span className="opacity-60 text-xs border-l border-white/30 pl-4">{user?.name}</span>
          <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-medium hover:bg-gray-100 text-sm">
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-2 text-sm pb-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="px-4 py-2 hover:bg-blue-600 rounded">{l.label}</Link>
          ))}
          <div className="px-4 py-2 opacity-60 text-xs">{user?.name} · {user?.role}</div>
          <button onClick={handleLogout} className="mx-4 bg-white text-blue-700 px-3 py-2 rounded font-medium">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}