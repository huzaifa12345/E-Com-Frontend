import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useLogo } from '../context/LogoContext';

const Footer = () => {
  const { websiteLogo } = useLogo();

  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-about">
              <img src={websiteLogo} alt="Kids Colours" className="img-fluid mb-3" style={{ maxWidth: '200px', minHeight: '80px' }} />
              <p>Your trusted online shopping destination for quality products and exceptional service.</p>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <div className="footer-links">
              <h5>Quick Links</h5>
              <ul>
                <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
                <li><Link to="/all-products" onClick={handleLinkClick}>Products</Link></li>
                <li><Link to="/cart" onClick={handleLinkClick}>Cart</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-contact">
              <h5>Contact Info</h5>
              <p><FaHeadset /> 0336-4500092</p>
              <p><FaEnvelope /> rameez_yaqoob@yahoo.com</p>
              <p><FaMapMarkerAlt /> Peoples Colony, Main Market Gujranwala</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="row">
            <div className="col-12 text-center">
              <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solutions</span></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
