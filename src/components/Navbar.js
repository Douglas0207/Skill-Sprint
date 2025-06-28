import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="navbar-logo">
            SkillSprint
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/okrs" className="navbar-link">
            OKRs
          </Link>
          <Link to="/okrs/create" className="navbar-link">
            Create OKR
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info" onClick={toggleMenu}>
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
          
          {isMenuOpen && (
            <div className="user-menu">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 