import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
import { FaBars } from 'react-icons/fa';
import SideDrawer from '../components/SideDrawer';
import { themeApi } from '../services/themeApi';
import '../assets/css/mobile-responsive.css';


const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
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
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top Bar Section */}
        <div className="header_section_top">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="custom_menu">
                  <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/cart">Cart</a></li>
                    <li><a href="/checkout">Checkout</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
              <div className="dropdown">
                <select 
                  className="form-control" 
                  id="categoryDropdown"
                  onChange={(e) => {
                    if (e.target.value) {
                      window.location.href = e.target.value;
                    }
                  }}
                  style={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: window.innerWidth < 768 ? '8px 12px' : '8px 12px',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px'
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={`/${category.slug}`}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="main">
                <form>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search this blog"
                      style={{ 
                        fontSize: window.innerWidth < 768 ? '14px' : '16px',
                        height: window.innerWidth < 768 ? '44px' : 'auto'
                      }}
                    />
                    <div className="input-group-append">
                      <button 
                        className="btn btn-secondary" 
                        type="button" 
                        style={{ 
                          backgroundColor: '#f26522', 
                          borderColor: '#f26522',
                          height: window.innerWidth < 768 ? '44px' : 'auto'
                        }}
                      >
                        <i className="fa fa-search" style={{ color: '#fff' }}></i>
                      </button>
                    </div>
                  </div>
                </form>
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
        <div className="footer_section layout_padding" style={{ backgroundColor: '#1a1a1a', padding: '60px 0 20px' }}>
          <div className="container">
            <div className="row">
              <div className="col-12 text-center mb-5">
                <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" style={{ width: '200px', height: 'auto', marginBottom: '30px' }} />
                
                <div className="newsletter_section mb-4">
                  <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                      <div className="d-flex align-items-center justify-content-center">
                        <input 
                          type="email" 
                          placeholder="Your Email" 
                          className="form-control" 
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid #fff',
                            color: '#fff',
                            borderRadius: '0',
                            padding: '10px 15px',
                            fontSize: '16px',
                            outline: 'none'
                          }}
                        />
                        <button 
                          className="btn ml-3" 
                          style={{
                            backgroundColor: '#f26522',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 25px',
                            fontSize: '14px',
                            fontWeight: '600',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="footer_links mb-4">
                  <div className="d-flex justify-content-center flex-wrap">
                    <a href="#" className="footer_link">Best Sellers</a>
                    <span className="link_separator mx-3">|</span>
                    <a href="#" className="footer_link">Gift Ideas</a>
                    <span className="link_separator mx-3">|</span>
                    <a href="#" className="footer_link">New Releases</a>
                    <span className="link_separator mx-3">|</span>
                    <a href="#" className="footer_link">Today's Deals</a>
                    <span className="link_separator mx-3">|</span>
                    <a href="#" className="footer_link">Customer Service</a>
                  </div>
                </div>

                <div className="helpline_section mb-4">
                  <p style={{ 
                    color: '#fff', 
                    fontSize: '16px', 
                    fontWeight: '500',
                    margin: '0'
                  }}>
                    Help Line Number : +1 1800 1200 1200
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="copyright_bar text-center pt-4" style={{ borderTop: '1px solid #333' }}>
                  <p style={{ 
                    color: '#fff', 
                    fontSize: '14px', 
                    margin: '0',
                    opacity: '0.8'
                  }}>
                    © 2026 All Rights Reserved. Design by Kids Colours
                  </p>
                </div>
              </div>
            </div>
          </div>

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
              border-bottom-color: #f26522;
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
            }
          `}</style>
        </div>

        {/* Side Drawer */}
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar Section */}
      <div className="header_section_top">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="custom_menu">
                <ul>
                  <li><a href="/home">Home</a></li>
                  <li><a href="/cart">Cart</a></li>
                  <li><a href="/checkout">Checkout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Header Section */}
      <div className="header_section">
        <div className="container">
          <div className="containt_main">
            <span className="toggle_icon" onClick={() => setSideDrawerOpen(true)}>
              <FaBars size={window.innerWidth < 768 ? 30 : 40} color="#fff" style={{ cursor: 'pointer' }} />
            </span>
            <div className="dropdown">
              <select 
                className="form-control" 
                id="categoryDropdown"
                onChange={(e) => {
                  if (e.target.value) {
                    window.location.href = e.target.value;
                  }
                }}
                style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px', 
                  padding: window.innerWidth < 768 ? '8px 12px' : '8px 12px',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px'
                }}
              >
                <option value="">All Categories</option>
                <option value="/fashion">Fashion</option>
                <option value="/electronic">Electronic</option>
                <option value="/jewellery">Jewellery</option>
              </select>
            </div>
            <div className="main">
              <form>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search this blog"
                    style={{ 
                      fontSize: window.innerWidth < 768 ? '14px' : '16px',
                      height: window.innerWidth < 768 ? '44px' : 'auto'
                    }}
                  />
                  <div className="input-group-append">
                    <button 
                      className="btn btn-secondary" 
                      type="button" 
                      style={{ 
                        backgroundColor: '#f26522', 
                        borderColor: '#f26522',
                        height: window.innerWidth < 768 ? '44px' : 'auto'
                      }}
                    >
                      <i className="fa fa-search" style={{ color: '#fff' }}></i>
                    </button>
                  </div>
                </div>
              </form>
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
      </div>

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
                  <div className="d-flex justify-content-between mb-2">
                    <span className="lorem_text">Tax</span>
                    <span className="shirt_text">{tax.toFixed(2)}</span>
                  </div>
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
      <div className="footer_section layout_padding" style={{ backgroundColor: '#1a1a1a', padding: '60px 0 20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" style={{ width: '200px', height: 'auto', marginBottom: '30px' }} />
              
              <div className="newsletter_section mb-4">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                    <div className="d-flex align-items-center justify-content-center">
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="form-control" 
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '2px solid #fff',
                          color: '#fff',
                          borderRadius: '0',
                          padding: '10px 15px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                      <button 
                        className="btn ml-3" 
                        style={{
                          backgroundColor: '#f26522',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 25px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer_links mb-4">
                <div className="d-flex justify-content-center flex-wrap">
                  <a href="#" className="footer_link">Best Sellers</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Gift Ideas</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">New Releases</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Today's Deals</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Customer Service</a>
                </div>
              </div>

              <div className="helpline_section mb-4">
                <p style={{ 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Help Line Number : +1 1800 1200 1200
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="copyright_bar text-center pt-4" style={{ borderTop: '1px solid #333' }}>
                <p style={{ 
                  color: '#fff', 
                  fontSize: '14px', 
                  margin: '0',
                  opacity: '0.8'
                }}>
                  © 2026 All Rights Reserved. Design by Kids Colours
                </p>
              </div>
            </div>
          </div>
        </div>

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
            border-bottom-color: #f26522;
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
          }
          
          /* Cart Page Specific Styles */
          .cart-items-container {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          
          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1rem;
          }
          
          .cart-item {
            transition: all 0.3s ease;
            border-radius: 8px;
          }
          
          .cart-item:hover {
            background-color: #f8f9fa;
          }
          
          .product-image {
            border-radius: 8px;
            overflow: hidden;
          }
          
          .current-price {
            font-size: 1.2rem;
            font-weight: 600;
            color: #f26522;
          }
          
          .original-price {
            font-size: 0.9rem;
            color: #999;
          }
          
          .total-price {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
          }
          
          .order-summary {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          
          .free-shipping-notice {
            background: #d4edda;
            color: #155724;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.85rem;
          }
          
          .trust-badge {
            padding: 15px;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          
          .trust-badge:hover {
            background: #f8f9fa;
            transform: translateY(-2px);
          }
          
          .empty-cart-icon {
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          /* Mobile Responsive Styles */
          @media (max-width: 768px) {
            .cart-items-container {
              padding: 15px;
            }
            
            .order-summary {
              margin-top: 20px;
            }
            
            .section-title {
              font-size: 1.2rem;
            }
            
            .cart-item .row {
              align-items: flex-start !important;
            }
            
            .product-image img {
              height: 80px !important;
            }
          }
        `}</style>
      </div>

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default Cart;
