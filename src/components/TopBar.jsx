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
    console.log('Cart icon clicked, calling toggleCart');
    try {
      toggleCart();
      console.log('toggleCart called successfully');
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
            <FaTruck className="me-2 text-orange" /> Free Shipping over Rs 10,000
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
          <div className="row align-items-center">
            
            {/* Mobile: Left Side Icons (Cart & Menu) | Desktop: Logo */}
            <div className="col-4 col-md-3 order-1 order-md-1">
              {/* Mobile view: Show buttons on left */}
              <div className="d-flex d-md-none align-items-center justify-content-start gap-3">
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
              {/* Desktop view: Show logo */}
              <Link to="/" className="navbar-brand d-none d-md-block">
                <img src={websiteLogo} alt="Kids Colours" className="brand-logo" />
              </Link>
            </div>

            {/* Desktop Center Links */}
            <div className="col-md-6 d-none d-lg-block text-center order-md-2">
              <div className="nav-menu-links">
                <Link to="/" className={`nav-link-item text-white ${isActive('/')}`}>Home</Link>
                <Link to="/all-products" className={`nav-link-item text-white ${isActive('/all-products')}`}>Shop</Link>
                <Link to="/about" className={`nav-link-item text-white ${isActive('/about')}`}>About Us</Link>
              </div>
            </div>

            {/* Mobile: Center Logo | Desktop: Right Side Icons */}
            <div className="col-4 col-md-3 order-2 order-md-3">
              {/* Mobile view: Center logo */}
              <Link to="/" className="navbar-brand d-flex d-md-none justify-content-center">
                <img src={websiteLogo} alt="Kids Colours" className="brand-logo" />
              </Link>
              {/* Desktop view: Show icons on right */}
              <div className="d-none d-md-flex header-icon-group align-items-center justify-content-end gap-3">
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