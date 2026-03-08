import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { IoNotifications, IoLogOut, IoMenu, IoClose } from 'react-icons/io5';
import { HiTicket } from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationAPI.getAll()
        .then(({ data }) => setUnreadCount(data.unreadCount))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🎫</div>
          <span className="brand-text">EventHub</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/events" className={`nav-link ${isActive('/events')}`}>Events</Link>
          {user && user.role !== 'attendee' && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/create-event" className={`nav-link ${isActive('/create-event')}`}>Create Event</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>My Bookings</Link>
              <Link to="/my-tickets" className={`nav-link ${isActive('/my-tickets')}`}>My Tickets</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notification-btn">
                <IoNotifications />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              <div className="user-menu" onClick={() => setMobileOpen(!mobileOpen)}>
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <IoLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
