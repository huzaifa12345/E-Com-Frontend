import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHeadset, FaTruck, FaUser, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import '../assets/css/Topbar.css';

const TopBar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { getCartItemsCount, toggleCart } = useCart();
  const { websiteLogo } = useLogo();
  const location = useLocation();

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleCart();
    } catch (err) {
      console.error('Error calling toggleCart:', err);
    }
  };

  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  return (
    <header className="main-header-wrapper">
      {/* 1. Upper Announcement Bar */}
      <div className="announcement-bar bg-black text-white py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="contact-unit d-none d-md-block">
            <small><FaHeadset className="me-2 text-orange" /> 0336-4500091</small>
          </div>
          
          <div className="promo-text text-uppercase fw-bold text-center small">
            <FaTruck className="me-2 text-orange" /> Free Shipping over Rs 5,000
          </div>

          <div className="user-actions d-none d-md-block">
             <Link to={user ? "/profile" : "/login"} className="text-white text-decoration-none small hover-orange">
                <FaUser className="me-2 text-orange" /> 
                {user ? `Hi, ${user.first_name || 'Hamza'}` : 'Login'}
             </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav className="navbar-main bg-black shadow-lg border-top border-dark">
        <div className="container py-2">
          <div className="row align-items-center g-0">
            
            {/* COLUMN 1: [Mobile: Hamburger] | [Desktop: Logo] */}
            <div className="col-4 col-md-3 order-1">
              {/* Mobile Only: Menu on Left */}
              <div className="d-flex d-md-none justify-content-start">
                <button 
                  className="icon-circle menu-toggle-btn text-white" 
                  onClick={onMenuToggle}
                >
                  <div className="hamburger-box">
                    <span className="ham-line"></span>
                    <span className="ham-line"></span>
                    <span className="ham-line"></span>
                  </div>
                </button>
              </div>

              {/* Desktop Only: Logo on Left */}
              <Link to="/" className="navbar-brand d-none d-md-block">
                <img src={websiteLogo} alt="Kids Colours" className="brand-logo" />
              </Link>
            </div>

            {/* COLUMN 2: [Mobile: Logo] | [Desktop: Nav Links] */}
            <div className="col-4 col-md-6 order-2 text-center">
              {/* Mobile Only: Logo in Center */}
              <Link to="/" className="navbar-brand d-md-none">
                <img src={websiteLogo} alt="Kids Colours" className="brand-logo-mobile" />
              </Link>

              {/* Desktop Only: Links in Center */}
              <div className="nav-menu-links d-none d-lg-block">
                <Link to="/" className={`nav-link-item text-white ${isActive('/')}`}>Home</Link>
                <Link to="/all-products" className={`nav-link-item text-white ${isActive('/all-products')}`}>Shop</Link>
                <Link to="/about" className={`nav-link-item text-white ${isActive('/about')}`}>About Us</Link>
              </div>
            </div>

            {/* COLUMN 3: [Mobile: Cart] | [Desktop: Right Icons] */}
            <div className="col-4 col-md-3 order-3">
              {/* Mobile Only: Cart on Right */}
              <div className="d-flex d-md-none justify-content-end">
                <button 
                  className="icon-circle cart-wrapper text-white position-relative"
                  onClick={handleCartClick}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FaShoppingCart size={22} />
                  {getCartItemsCount() > 0 && (
                    <span className="cart-badge-orange pulse-animation">{getCartItemsCount()}</span>
                  )}
                </button>
              </div>

              {/* Desktop Only: Extra Icons/Menu on Right */}
              <div className="d-none d-md-flex header-icon-group align-items-center justify-content-end gap-3">
                <button 
                  className="icon-circle menu-toggle-btn text-white" 
                  onClick={onMenuToggle}
                >
                  <div className="hamburger-box">
                    <span className="ham-line"></span>
                    <span className="ham-line"></span>
                    <span className="ham-line"></span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};

export default TopBar;