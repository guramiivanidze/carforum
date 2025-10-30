import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debug: Log user and profile data
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User:', user);
      console.log('Profile:', profile);
      console.log('Profile ID:', profile?.id);
    }
  }, [isAuthenticated, user, profile]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚗</span>
          <span>Car Forum</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <a href="/#categories">Categories</a>
          <a href="#search">Search</a>
          
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-menu-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img 
                  src={profile?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=4CAF50&color=fff`}
                  alt={user?.username}
                  className="user-avatar-small"
                />
                <span className="user-name">{user?.username}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <Link 
                    to={`/profile/${profile?.id}`} 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to={`/profile/${profile?.id}?tab=settings`} 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    className="dropdown-item logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">Login / Sign Up</Link>
          )}
          
          <span className="search-icon">🔍</span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
