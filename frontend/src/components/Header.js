import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown
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
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚗</span>
          <span className="logo-text">Car Forum</span>
        </Link>
        
        {/* Mobile Controls */}
        <div className="mobile-controls">
          {/* User Avatar/Login - Always visible on mobile */}
          {isAuthenticated ? (
            <div className="user-menu mobile-user-menu" ref={dropdownRef}>
              <button 
                className="user-menu-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-image-wrapper">
                  {profile?.user_image_url ? (
                    <img 
                      src={profile.user_image_url} 
                      alt={user?.username}
                      className="user-image-display"
                    />
                  ) : (
                    <span className="user-image-icon">{user?.username?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      {profile?.user_image_url ? (
                        <img 
                          src={profile.user_image_url} 
                          alt={user?.username}
                          className="dropdown-image-display"
                        />
                      ) : (
                        <span className="dropdown-image">{user?.username?.[0]?.toUpperCase() || '?'}</span>
                      )}
                      <div>
                        <div className="dropdown-username">{user?.username}</div>
                        <div className="dropdown-email">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to={`/profile/${profile?.id}`} 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-item-icon">👤</span>
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to={`/profile/${profile?.id}?tab=settings`} 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-item-icon">⚙️</span>
                    <span>Settings</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-button"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-item-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="login-btn mobile-login-btn"
              state={{ from: location.pathname }}
            >
              <span>🔐</span>
              <span>Login</span>
            </Link>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span className={`burger-icon ${showMobileMenu ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav">
          <Link to="/search" className="nav-link">
            <span className="nav-icon">🔍</span>
            <span>Search</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create-topic" className="create-topic-btn">
                <span>✏️</span>
                <span>Create Topic</span>
              </Link>
              
              <div className="user-menu" ref={dropdownRef}>
                <button 
                  className="user-menu-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-image-wrapper">
                    {profile?.user_image_url ? (
                      <img 
                        src={profile.user_image_url} 
                        alt={user?.username}
                        className="user-image-display"
                      />
                    ) : (
                      <span className="user-image-icon">{user?.username?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <span className="user-name">{user?.username}</span>
                  <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
                </button>
                
                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        {profile?.user_image_url ? (
                          <img 
                            src={profile.user_image_url} 
                            alt={user?.username}
                            className="dropdown-image-display"
                          />
                        ) : (
                          <span className="dropdown-image">{user?.username?.[0]?.toUpperCase() || '?'}</span>
                        )}
                        <div>
                          <div className="dropdown-username">{user?.username}</div>
                          <div className="dropdown-email">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to={`/profile/${profile?.id}`} 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="dropdown-item-icon">👤</span>
                      <span>My Profile</span>
                    </Link>
                    <Link 
                      to={`/profile/${profile?.id}?tab=settings`} 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="dropdown-item-icon">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-button"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-item-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="login-btn"
              state={{ from: location.pathname }}
            >
              <span>🔐</span>
              <span>Login / Sign Up</span>
            </Link>
          )}
        </nav>
        
        {/* Mobile Navigation Menu */}
        <div className={`mobile-nav ${showMobileMenu ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button 
              className="mobile-nav-close"
              onClick={closeMobileMenu}
            >
              ✕
            </button>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/search" className="mobile-nav-link" onClick={closeMobileMenu}>
              <span className="mobile-nav-icon">🔍</span>
              <span>Search</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <div className="mobile-nav-divider"></div>
                <Link to="/create-topic" className="mobile-nav-link highlight" onClick={closeMobileMenu}>
                  <span className="mobile-nav-icon">✏️</span>
                  <span>Create Topic</span>
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Overlay */}
        {showMobileMenu && (
          <div className="mobile-nav-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </header>
  );
}

export default Header;
