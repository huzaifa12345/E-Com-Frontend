import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { FaBars, FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch } from 'react-icons/fa';
import SideDrawer from '../components/SideDrawer';
import { themeApi } from '../services/themeApi';
import '../assets/css/mobile-responsive.css';


const Cart = () => {
  const { websiteLogo } = useLogo();
  const { 
    items, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsCount, 
    clearCart 
  } = useCart();

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await themeApi.getCategories();
        const activeCategories = categoriesData?.filter(cat => cat.is_active) || [];
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Modern Header */}
        <header className="modern-header">
          <div className="container">
            {/* Top Bar */}
            <div className="top-bar">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="contact-info">
                    <span><FaHeadset /> +1 800-123-4567</span>
                    {' '}
                    <span className="ms-3"><FaTruck /> Free Shipping on orders over Rs 2000</span>
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  <div className="social-links">
                    <Link to="/cart" className="text-white position-relative">
                      <FaShoppingCart />
                      {getCartItemsCount() > 0 && (
                        <span className="cart-badge">{getCartItemsCount()}</span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="main-nav">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <div className="logo">
                    <Link to="/">
                      <img src={websiteLogo} alt="Kids Colours" className="img-fluid" style={{ maxWidth: '200px', minHeight: '80px' }} />
                    </Link>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="search-bar">
                    <form className="d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search products..."
                      />
                      <button type="submit" className="btn btn-search">
                        <FaSearch />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="col-md-3 text-end">
                  <button
                    className="btn btn-outline-light menu-toggle"
                    onClick={() => setSideDrawerOpen(true)}
                  >
                    <FaBars /> Menu
                  </button>
                </div>
              </div>
            </nav>

            {/* Custom Menu */}
            <div className="custom_menu">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/checkout">Checkout</Link></li>
              </ul>
            </div>
          </div>
        </header>
        
        {/* Header Section
        <div className="header_section">
          <div className="container">
            <div className="containt_main">
              <span className="toggle_icon" onClick={() => setSideDrawerOpen(true)}>
                <i className="fa fa-bars" style={{ 
                  fontSize: window.innerWidth < 768 ? '24px' : '28px', 
                  color: '#fff', 
                  cursor: 'pointer' 
                }}></i>
              </span>
              <div className="main">
              </div>
              <div className="header_box">
                <div className="login_menu">
                  <ul>
                    <li>
                      <Link to="/cart">
                        <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                        <span className="padding_10">Cart ({items.length})</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/account">
                        <i className="fa fa-user" aria-hidden="true"></i>
                        <span className="padding_10">User</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        
        <div className="container layout_padding">
          <div className="text-center py-5">
            <div className="empty-cart-icon mb-4">
              <ShoppingBag className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            </div>
            <h1 className="banner_taital mb-3">Your Shopping Cart is Empty</h1>
            <p className="lorem_text mb-5 max-w-2xl mx-auto">
              Looks like you haven't added any products to your cart yet. Explore our amazing collection and find something you'll love!
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/shop" className="btn btn-primary btn-lg px-5" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
                <i className="fa fa-shopping-bag me-2"></i>
                Start Shopping
              </Link>
              <Link to="/" className="btn btn-outline-secondary btn-lg px-5">
                <i className="fa fa-home me-2"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Section */}
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
                    <li><a href="/">Home</a></li>
                    <li><a href="/cart">Cart</a></li>
                    <li><a href="/checkout">Checkout</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="footer-contact">
                  <h5>Contact Info</h5>
                  <p><FaHeadset /> +1 800-123-4567</p>
                  <p><FaEnvelope /> info@kidscolours.com</p>
                  <p><FaMapMarkerAlt /> 123 Shopping St, City, State 12345</p>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="row">
                <div className="col-12 text-center">
                  <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solution</span></p>
                </div>
              </div>
            </div>
          </div>
        </footer>

          <style jsx>{`
            .footer_link {
              color: #fff !important;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              text-transform: uppercase;
              transition: color 0.3s ease;
            }
            
            .footer_link:hover {
              color: #f26522 !important;
            }
            
            .link_separator {
              color: #666;
              font-size: 16px;
            }
            
            .form-control::placeholder {
              color: #999;
            }
            
            .form-control:focus {
              box-shadow: none;
              background: #000;
              padding: 2px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .contact-info span {
              color: #fff;
              font-size: 13px;
            }
            
            .cart-badge {
              position: absolute;
              top: -8px;
              right: -8px;
              background: #f26522;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              font-size: 11px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .main-nav {
              padding: 15px 0;
            }
            
            .search-bar {
              position: relative;
            }
            
            .search-bar .form-control {
              border-radius: 25px;
              padding: 10px 20px;
              border: none;
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              backdrop-filter: blur(5px);
              height: 44px;
            }
            
            .search-bar .form-control::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
            
            .search-bar .form-control:focus {
              background: rgba(255, 255, 255, 0.2);
              box-shadow: 0 0 10px rgba(242, 101, 34, 0.3);
              color: #fff;
            }
            
            .btn-search {
              position: absolute;
              right: 5px;
              top: 50%;
              transform: translateY(-50%);
              border-radius: 50%;
              width: 36px;
              height: 36px;
              background: #f26522;
              border: none;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            }
            
            .menu-toggle {
              border-radius: 8px;
              padding: 8px 16px;
              font-size: 14px;
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: #fff;
            }
            
            .menu-toggle:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: #f26522;
            }
            
            /* Custom Menu - Orange Style */
            .custom_menu {
              background: rgba(242, 101, 34, 0.9);
              padding: 12px 0;
              border-radius: 20px;
              margin-top: 15px;
            }
            
            .custom_menu ul {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 30px;
              list-style: none;
              margin: 0;
              padding: 0;
            }
            
            .custom_menu ul li a {
              color: #fff;
              text-decoration: none;
              font-weight: 500;
              transition: color 0.3s;
              padding: 5px 0;
              position: relative;
              font-size: 14px;
            }
            
            .custom_menu ul li a::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0;
              height: 2px;
              background: #fff;
              transition: width 0.3s;
            }
            
            .custom_menu ul li a:hover::after,
            .custom_menu ul li a.active::after {
              width: 100%;
            }
            
            @media (max-width: 767px) {
              .footer_section {
                padding: 40px 0 20px !important;
              }
              
              .newsletter_section .d-flex {
                flex-direction: column;
                gap: 15px;
              }
              
              .newsletter_section .form-control {
                width: 100% !important;
                text-align: center;
              }
              
              .newsletter_section .btn {
                width: 100%;
                margin-left: 0 !important;
              }
              
              .footer_links {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                gap: 10px;
              }
              
              .link_separator {
                display: none;
              }
              
              .footer_link {
                font-size: 13px;
              }
                .footer-bottom span {
          color: #f26522;
        }
              
              .top-bar {
                display: none;
              }
            }
          `}</style>

        {/* Side Drawer */}
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="contact-info">
                  <span><FaHeadset /> +1 800-123-4567</span>
                  {' '}
                  <span className="ms-3"><FaTruck /> Free Shipping on orders over Rs 2000</span>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <div className="social-links">
                  <Link to="/cart" className="text-white position-relative">
                    <FaShoppingCart />
                    {getCartItemsCount() > 0 && (
                      <span className="cart-badge">{getCartItemsCount()}</span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <div className="row align-items-center">
              <div className="col-md-3">
                <div className="logo">
                  <Link to="/">
                    <img src={websiteLogo} alt="Kids Colours" className="img-fluid" style={{ maxWidth: '200px', minHeight: '80px' }} />
                  </Link>
                </div>
              </div>
              <div className="col-md-6">
                <div className="search-bar">
                  <form className="d-flex">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                    />
                    <button type="submit" className="btn btn-search">
                      <FaSearch />
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-md-3 text-end">
                <button
                  className="btn btn-outline-light menu-toggle"
                  onClick={() => setSideDrawerOpen(true)}
                >
                  <FaBars /> Menu
                </button>
              </div>
            </div>
          </nav>

          {/* Custom Menu */}
          <div className="custom_menu">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
            </ul>
          </div>
        </div>
      </header>
      

      <div className="container layout_padding">
        {/* Page Header */}
        <div className="text-center mb-5">
          <h1 className="banner_taital mb-3">Shopping Cart</h1>
          <p className="lorem_text">
            {items.length} {items.length === 1 ? 'Item' : 'Items'} in Your Cart
          </p>
        </div>

        <div className="row">
          {/* Cart Items Section */}
          <div className="col-lg-8 mb-4">
            <div className="cart-items-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">Your Items</h3>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <i className="fa fa-trash me-1"></i>
                    Clear Cart
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-5">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                  <h4 className="shirt_text mb-2">No items in cart</h4>
                  <p className="lorem_text mb-4">Add some products to get started!</p>
                  <Link to="/shop" className="btn btn-primary" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="cart-items-list">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="cart-item"
                    >
                      <div className="row align-items-center p-3 border-bottom">
                        <div className="col-md-2">
                          <div className="product-image">
                            <img
                              src={
                                item.images && item.images.length > 0 
                                  ? item.images[0] 
                                  : item.image_url || item.image || '/src/assets/images/tshirt-img.png'
                              }
                              alt={item.name}
                              className="img-fluid rounded"
                              style={{ 
                                objectFit: 'contain',
                                width: '100%',
                                height: '100px',
                                backgroundColor: '#f8f9fa'
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-5">
                          <div className="product-info">
                            <h4 className="shirt_text mb-1">{item.name}</h4>
                            <p className="lorem_text small mb-2">{item.description}</p>
                            <div className="price-display">
                              <span className="current-price shirt_text">{item.price}</span>
                              {item.originalPrice && (
                                <span className="original-price text-muted text-decoration-line-through ms-2">
                                  {item.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="quantity-control">
                            <label className="text-muted small">Quantity</label>
                            <div className="input-group mt-1" style={{ maxWidth: '120px' }}>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="btn btn-outline-secondary"
                                type="button"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                className="form-control text-center"
                                value={item.quantity}
                                readOnly
                              />
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="btn btn-outline-secondary"
                                type="button"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="item-total d-flex justify-content-between align-items-center">
                            <div>
                              <div className="total-price shirt_text">
                                {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            {items.length > 0 && (
              <div className="trust-badges mt-4">
                <div className="row text-center">
                  <div className="col-md-4 mb-3">
                    <div className="trust-badge">
                      <Truck className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                      <h6 className="shirt_text">Free Shipping</h6>
                      <p className="lorem_text small">On orders over $50</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="trust-badge">
                      <Shield className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                      <h6 className="shirt_text">Secure Payment</h6>
                      <p className="lorem_text small">100% protected</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="trust-badge">
                      <RefreshCw className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                      <h6 className="shirt_text">Easy Returns</h6>
                      <p className="lorem_text small">30-day policy</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            {items.length > 0 && (
              <div className="order-summary sticky-top" style={{ top: '20px' }}>
                <h3 className="section-title mb-4">Order Summary</h3>

                <div className="summary-details mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="lorem_text">Subtotal</span>
                    <span className="shirt_text">{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="lorem_text">Shipping</span>
                    <span className="shirt_text">
                      {shipping === 0 ? 'FREE' : shipping.toFixed(2)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="free-shipping-notice text-success small mb-2">
                      <i className="fa fa-truck me-1"></i>
                      Add {(50 - subtotal).toFixed(2)} more for free shipping!
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <h5 className="shirt_text">Total</h5>
                    <h5 className="shirt_text">{total.toFixed(2)}</h5>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="promo-code-section mb-4">
                  <label className="shirt_text small">Promo Code</label>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="form-control"
                    />
                    <button className="btn btn-outline-secondary">Apply</button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <Link
                    to="/checkout"
                    className="btn btn-primary btn-lg btn-block mb-3"
                    style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                  >
                    <i className="fa fa-lock me-2"></i>
                    Proceed to Checkout
                  </Link>
                  <Link
                    to="/shop"
                    className="btn btn-outline-secondary btn-block"
                  >
                    <i className="fa fa-arrow-left me-2"></i>
                    Continue Shopping
                  </Link>
                </div>

                {/* Payment Methods */}
                <div className="payment-methods mt-4 text-center">
                  <p className="lorem_text small mb-3">We Accept</p>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge bg-warning">VISA</span>
                    <span className="badge bg-warning">MC</span>
                    <span className="badge bg-warning">AMEX</span>
                    <span className="badge bg-warning">PP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
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
                  <li><a href="/">Home</a></li>
                  <li><a href="/cart">Cart</a></li>
                  <li><a href="/checkout">Checkout</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="footer-contact">
                <h5>Contact Info</h5>
                <p><FaHeadset /> +1 800-123-4567</p>
                <p><FaEnvelope /> info@kidscolours.com</p>
                <p><FaMapMarkerAlt /> 123 Shopping St, City, State 12345</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="row">
              <div className="col-12 text-center">
                <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solution</span></p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default Cart;
