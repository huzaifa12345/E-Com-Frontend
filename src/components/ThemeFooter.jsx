import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook } from 'react-icons/fa';
import { useLogo } from '../context/LogoContext';
import '../assets/css/ThemeFooter.css';

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
                <li><Link to="/" onClick={handleLinkClick}>Exchange And Return Policy</Link></li>
                <li><Link to="/all-products" onClick={handleLinkClick}>Cancellation Policy</Link></li>
                <li><Link to="/cart" onClick={handleLinkClick}>Terms And Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-contact">
              <h5>Contact Info</h5>
              <p><FaHeadset /> 0336-4500091</p>
              <p><FaEnvelope /> rameez_yaqoob@yahoo.com</p>
              {/* <p><FaMapMarkerAlt /> Peoples Colony, Main Market Gujranwala</p> */}
              
              <div className="footer-social mt-3">
                <h5>Follow Us</h5>
                <div className="social-links">
                  <a 
                    href="https://www.instagram.com/colourspeoplecolonygujranwala?igsh=MWM4NWlhc2VjbmVmbw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon instagram"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a 
                    href="https://www.facebook.com/share/1REtN5nwdP/?mibextid=wwXIfr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon facebook"
                    aria-label="Facebook"
                  >
                    <FaFacebook />
                  </a>
                </div>
              </div>
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
