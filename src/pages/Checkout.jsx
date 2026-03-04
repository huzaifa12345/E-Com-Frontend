import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import { ArrowLeft, ArrowRight, Check, CreditCard, Truck, MapPin, ShoppingBag } from 'lucide-react';
import SideDrawer from '../components/SideDrawer';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { FaBars, FaHeadset, FaTruck as FaTruckIcon, FaShoppingCart, FaSearch, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';

const Checkout = () => {
  const { websiteLogo } = useLogo();
  const {
    items,
    shippingMethod,
    shippingOptions,
    freeShippingThreshold,
    getShippingCost,
    getCartTotal,
    clearCart,
    getCartItemsCount
  } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    // Payment fields (common for all methods)
    account_holder_name: '',
    account_number: '',
    transaction_id: '',
    payment_screenshot: null
  });

  const subtotal = getCartTotal();
  const shipping = getShippingCost(subtotal, shippingMethod);
  const total = subtotal + shipping;
  const shippingLabel =
    shippingOptions?.find((o) => o.id === shippingMethod)?.label || 'Standard Delivery';

  const handleScreenshotUpload = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log('Uploading file:', file.name);
      const response = await fetch('http://localhost:3001/api/upload/payment-screenshot', {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        return result.imageUrl;
      } else {
        const error = await response.json();
        console.error('Upload error:', error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show loading state
      setPaymentInfo({...paymentInfo, payment_screenshot: 'uploading...'});
      
      // Upload the file
      const imageUrl = await handleScreenshotUpload(file);
      
      // Update with the result
      setPaymentInfo({...paymentInfo, payment_screenshot: imageUrl});
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        user_id: 1, // Temporary user ID, should come from auth context
        status: 'pending',
        subtotal,
        shipping_amount: shipping,
        total_amount: total,
        shipping_address: {
          first_name: shippingInfo.firstName,
          last_name: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip_code: shippingInfo.zipCode,
          country: shippingInfo.country
        },
        billing_address: {
          first_name: shippingInfo.firstName,
          last_name: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip_code: shippingInfo.zipCode,
          country: shippingInfo.country
        },
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          total_price: parseFloat(item.price) * item.quantity,
          selected_size: item.selectedSize || null,
          product_snapshot: {
            name: item.name,
            sku: item.sku || '',
            image_url: item.image_url || item.image || '/src/assets/images/tshirt-img.png'
          }
        })),
        payment_method: paymentInfo.method,
        payment_status: (paymentInfo.payment_screenshot && typeof paymentInfo.payment_screenshot === 'string') ? 'paid' : 'pending', // If screenshot provided, mark as paid
        // Add payment details for bank transfer
        account_holder_name: paymentInfo.account_holder_name || null,
        account_number: paymentInfo.account_number || null,
        transaction_id: paymentInfo.transaction_id || null,
        payment_screenshot: (paymentInfo.payment_screenshot && typeof paymentInfo.payment_screenshot === 'string') ? paymentInfo.payment_screenshot : null
      };

      await themeApi.createOrder(orderData);
      toast.success('Order placed successfully!');
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Check }
  ];

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Modern Header */}
        <header className="modern-header">
          <div className="container">
            {/* Top Bar */}
            <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
            />
          </div>
        </header>
        
        <div className="container text-center py-5">
          <ShoppingBag className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h1 className="banner_taital mb-3">Your Cart is Empty</h1>
          <p className="lorem_text mb-4">Add some products to your cart before checkout!</p>
          <Link to="/all-products" className="btn btn-primary btn-lg" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
            Continue Shopping
          </Link>
        </div>

        {/* Footer Section */}
       
        <ThemeFooter />

        {/* Side Drawer */}
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

        <style jsx>{`
          .modern-header {
            background: #000;
            backdrop-filter: blur(10px);
            border-radius: 0 0 30px 30px;
          }
          
          .top-bar {
            background: #000;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .contact-info span {
            color: #fff;
            font-size: 12px;
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
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Modern Header */}
        <header className="modern-header">
          <div className="container">
            {/* Top Bar */}
            {/* <div className="top-bar">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="contact-info">
                    <span><FaHeadset /> +1 800-123-4567</span>
                    {' '}
                    <span className="ms-3"><FaTruckIcon /> Free Shipping on orders over Rs 10,000</span>
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
            </div> */}

            {/* Main Navigation */}
            {/* <nav className="main-nav">
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
            </nav> */}
          </div>
        </header>
        
        <div className="container text-center py-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="banner_taital mb-4">Order Confirmed!</h1>
            <p className="lorem_text mb-5">Thank you for shopping with Kids Colours!</p>
            <Link to="/home" className="btn btn-primary btn-lg" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
              Continue Shopping
            </Link>
          </motion.div>
        </div>

        {/* Footer Section */}
        {/* <footer className="footer-section">
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
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/cart">Cart</Link></li>
                    <li><Link to="/checkout">Checkout</Link></li>
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
                  <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solutions</span></p>
                </div>
              </div>
            </div>
          </div>
        </footer> */}

        {/* Side Drawer */}
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

        <style jsx>{`
          .modern-header {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 0 0 30px 30px;
          }
          
          .top-bar {
            background: #000;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .contact-info span {
            color: #fff;
            font-size: 12px;
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
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          {/* Top Bar */}
          <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
          />
          {/* <div className="top-bar">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="contact-info">
                  <span><FaHeadset /> +1 800-123-4567</span>
                  {' '}
                  <span className="ms-3"><FaTruckIcon /> Free Shipping on orders over Rs 10,000</span>
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
          </div> */}

          {/* Main Navigation */}
          {/* <nav className="main-nav">
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
          </nav> */}
        </div>
      </header>

      <div className="container layout_padding">
        <div className="mb-5">
          <Link to="/cart" className="inline-flex items-center text-muted mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="fashion_taital">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-5">
          <div className="row">
            <div className="col-12">
              <div className="checkout_steps">
                {steps.map((step, index) => (
                  <div key={step.id} className={`step_item ${currentStep >= step.id ? 'active' : ''}`}>
                    <div className="step_icon">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="step_name">{step.name}</span>
                    {index < steps.length - 1 && <div className="step_line" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8 mb-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="checkout_form">
                  <div className="box_main">
                    <h3 className="shirt_text mb-4">Shipping Information</h3>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Zip Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingInfo.country}
                          onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setCurrentStep(2)}
                        style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                      >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="checkout_form">
                  <div className="box_main">
                    <h3 className="shirt_text mb-4">Payment Information</h3>
                    <div className="mb-4">
                      {/* <div className="form-check form-check-inline mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="card"
                          value="card"
                          checked={paymentInfo.method === 'card'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="card">
                          💳 Credit Card
                        </label>
                      </div>
                      <div className="form-check form-check-inline mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="casheasy"
                          value="casheasy"
                          checked={paymentInfo.method === 'casheasy'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="casheasy">
                          📱 Cash Easy
                        </label>
                      </div> */}
                      <div className="form-check form-check-inline mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="banktransfer"
                          value="banktransfer"
                          checked={paymentInfo.method === 'banktransfer'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="banktransfer">
                          🏦 Bank Transfer
                        </label>
                      </div>
                      <div className="form-check form-check-inline mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="jazzcash"
                          value="jazzcash"
                          checked={paymentInfo.method === 'jazzcash'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="jazzcash">
                          📲 Jazz Cash
                        </label>
                      </div>
                      <div className="form-check form-check-inline mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="easypaisa"
                          value="easypaisa"
                          checked={paymentInfo.method === 'easypaisa'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="easypaisa">
                          📱 EasyPaisa
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="cod"
                          value="cod"
                          checked={paymentInfo.method === 'cod'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="cod">
                          🚚 Cash on Delivery
                        </label>
                      </div>
                    </div>

                    {/* {paymentInfo.method === 'card' && (
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label className="form-label">Cardholder Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={paymentInfo.cardholderName}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    )} */}

                    {/* Bank Transfer Payment */}
                    {paymentInfo.method === 'banktransfer' && (
                      <div className="alert alert-info">
                        <h5 className="alert-heading">🏦 Bank Transfer</h5>
                        <p className="mb-3">Transfer directly to our bank account.</p>
                        <div className="bank-details p-3 bg-light rounded">
                          <h6>Bank Details:</h6>
                          <p><strong>Bank:</strong> Kids Colours Bank</p>
                          <p><strong>Account Title:</strong> Kids Colours Pvt Ltd</p>
                          <p><strong>Account Number:</strong> 1234-567890</p>
                          <p><strong>IBAN:</strong> PK36-0001-2345-6789</p>
                          <p><strong>Swift Code:</strong> KIDSPKKA</p>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Your Account Holder Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Name as per your bank account"
                              value={paymentInfo.account_holder_name}
                              onChange={(e) => setPaymentInfo({...paymentInfo, account_holder_name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Transaction ID</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your transaction ID"
                              value={paymentInfo.transaction_id}
                              onChange={(e) => setPaymentInfo({...paymentInfo, transaction_id: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <label className="form-label">Payment Screenshot</label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                            <small className="text-muted">Upload screenshot of bank transfer confirmation</small>
                          </div>
                        </div>
                        <small className="text-muted">Please upload the transaction receipt after payment.</small>
                      </div>
                    )}

                    {/* Jazz Cash Payment */}
                    {paymentInfo.method === 'jazzcash' && (
                      <div className="alert alert-info">
                        <h5 className="alert-heading">📲 Jazz Cash Payment</h5>
                        <p className="mb-3">Pay using your Jazz Cash account.</p>
                        
                        {/* Store Owner Details */}
                        <div className="jazzcash-details p-3 bg-light rounded mb-3">
                          <h6>Send payment to:</h6>
                          <p><strong>Account Name:</strong> Kids Colours Store</p>
                          <p><strong>Jazz Cash Number:</strong> 03XX-XXXXXXX</p>
                          <p className="text-muted mb-0">Please send the exact amount and keep the transaction receipt.</p>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Your Jazz Cash Number</label>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder="03XX-XXXXXXX"
                              value={paymentInfo.account_number}
                              onChange={(e) => setPaymentInfo({...paymentInfo, account_number: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Account Holder Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Your name as per Jazz Cash account"
                              value={paymentInfo.account_holder_name}
                              onChange={(e) => setPaymentInfo({...paymentInfo, account_holder_name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Transaction ID</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Transaction ID from Jazz Cash receipt"
                              value={paymentInfo.transaction_id}
                              onChange={(e) => setPaymentInfo({...paymentInfo, transaction_id: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Payment Screenshot</label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                            <small className="text-muted">Upload screenshot of payment confirmation</small>
                          </div>
                        </div>
                        <small className="text-muted">You will receive a payment confirmation on your Jazz Cash number.</small>
                      </div>
                    )}

                    {/* EasyPaisa Payment */}
                    {paymentInfo.method === 'easypaisa' && (
                      <div className="alert alert-info">
                        <h5 className="alert-heading">📱 EasyPaisa Payment</h5>
                        <p className="mb-3">Pay using your EasyPaisa account.</p>
                        
                        {/* Store Owner Details */}
                        <div className="easypaisa-details p-3 bg-light rounded mb-3">
                          <h6>Send payment to:</h6>
                          <p><strong>Account Name:</strong> Kids Colours Store</p>
                          <p><strong>EasyPaisa Number:</strong> 03XX-XXXXXXX</p>
                          <p className="text-muted mb-0">Please send the exact amount and keep the transaction receipt.</p>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Your EasyPaisa Number</label>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder="03XX-XXXXXXX"
                              value={paymentInfo.account_number}
                              onChange={(e) => setPaymentInfo({...paymentInfo, account_number: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Account Holder Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Your name as per EasyPaisa account"
                              value={paymentInfo.account_holder_name}
                              onChange={(e) => setPaymentInfo({...paymentInfo, account_holder_name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Transaction ID</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Transaction ID from EasyPaisa receipt"
                              value={paymentInfo.transaction_id}
                              onChange={(e) => setPaymentInfo({...paymentInfo, transaction_id: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Payment Screenshot</label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                            <small className="text-muted">Upload screenshot of payment confirmation</small>
                          </div>
                        </div>
                        <small className="text-muted">You will receive a payment confirmation on your EasyPaisa number.</small>
                      </div>
                    )}

                    {/* Cash on Delivery */}
                    {paymentInfo.method === 'cod' && (
                      <div className="alert alert-success">
                        <h5 className="alert-heading">🚚 Cash on Delivery</h5>
                        <p>Pay when you receive your order. Our delivery agent will collect payment.</p>
                      </div>
                    )}

                    <div className="d-flex justify-content-between">
                      <button 
                        className="btn btn-outline-secondary" 
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shipping
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setCurrentStep(3)}
                        style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                      >
                        Review Order
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="review" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="checkout_form">
                  <div className="box_main">
                    <h3 className="shirt_text mb-4">Order Review</h3>
                    
                    {/* Order Items */}
                    <div className="mb-4">
                      <h5 className="mb-3">Order Items</h5>
                      {items.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 p-3 border-bottom">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                item.images && item.images.length > 0 
                                  ? item.images[0] 
                                  : item.image_url || item.image || '/src/assets/images/tshirt-img.png'
                              }
                              alt={item.name}
                              className="img-fluid rounded me-3"
                              style={{ 
                                objectFit: 'contain',
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#f8f9fa'
                              }}
                            />
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                          </div>
                          <span className="shirt_text">{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-4">
                      <h5 className="mb-3">Shipping Address</h5>
                      <div className="p-3 border rounded">
                        <p className="mb-1">
                          <strong>{shippingInfo.firstName} {shippingInfo.lastName}</strong>
                        </p>
                        <p className="mb-1">{shippingInfo.address}</p>
                        <p className="mb-1">
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                        </p>
                        <p className="mb-1">{shippingInfo.country}</p>
                        <p className="mb-1">{shippingInfo.email}</p>
                        <p className="mb-1">{shippingInfo.phone}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                      <h5 className="mb-3">Payment Method</h5>
                      <div className="p-3 border rounded">
                        <p className="mb-0">
                          {paymentInfo.method === 'card' && '💳 Credit Card'}
                          {paymentInfo.method === 'casheasy' && '📱 Cash Easy'}
                          {paymentInfo.method === 'banktransfer' && '🏦 Bank Transfer'}
                          {paymentInfo.method === 'jazzcash' && '📲 Jazz Cash'}
                          {paymentInfo.method === 'easypaisa' && '📱 EasyPaisa'}
                          {paymentInfo.method === 'cod' && '🚚 Cash on Delivery'}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button 
                        className="btn btn-outline-secondary" 
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Payment
                      </button>
                      <button 
                        className="btn btn-primary btn-lg" 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                      >
                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        <Check className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="box_main sticky-top" style={{ top: '20px' }}>
              <h3 className="shirt_text mb-4">Order Summary</h3>
              
              <div className="summary_details mb-4">
                <div className="checkout-summary-line">
                  <div className="checkout-summary-left">
                    <div className="checkout-summary-label">Subtotal</div>
                  </div>
                  <div className="checkout-summary-right">Rs. {subtotal.toFixed(2)}</div>
                </div>

                <div className="checkout-summary-line">
                  <div className="checkout-summary-left">
                    <div className="checkout-summary-label">Shipping</div>
                    <div className="checkout-summary-sub">{shippingLabel}</div>
                  </div>
                  <div className="checkout-summary-right">
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`}
                  </div>
                </div>
                {subtotal < freeShippingThreshold && shipping > 0 && (
                  <div className="free-shipping-notice text-success small mb-2">
                    <Truck className="w-4 h-4 checkout-free-ship-icon" />
                    <span>
                      Add Rs. {(freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!
                    </span>
                  </div>
                )}
                <hr />
                <div className="checkout-summary-line checkout-summary-total">
                  <div className="checkout-summary-left">
                    <div className="checkout-summary-label">Total</div>
                  </div>
                  <div className="checkout-summary-right">Rs. {total.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-center">
                <div className="trust-badges mb-3">
                  <div className="row">
                    <div className="col-4">
                      <Truck className="w-6 h-6 mx-auto mb-1" style={{ color: '#f26522' }} />
                      <small>Free Shipping on Order over Rs. {freeShippingThreshold}</small>
                    </div>
                    <div className="col-4">
                      <CreditCard className="w-6 h-6 mx-auto mb-1" style={{ color: '#f26522' }} />
                      <small>Secure Payment</small>
                    </div>
                    <div className="col-4">
                      <Check className="w-6 h-6 mx-auto mb-1" style={{ color: '#f26522' }} />
                      <small>Order Tracking</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      <ThemeFooter />

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <style jsx>{`
        .checkout_steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .step_item {
          display: flex;
          align-items: center;
          position: relative;
          flex: 1;
        }

        .step_icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          transition: all 0.3s ease;
        }

        .step_item.active .step_icon {
          background: #f26522;
          color: white;
        }

        .step_name {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .step_item.active .step_name {
          color: #f26522;
          font-weight: 600;
        }

        .step_line {
          flex: 1;
          height: 2px;
          background: #e9ecef;
          margin: 0 10px;
        }

        .step_item.active + .step_item .step_line {
          background: #f26522;
        }

        .checkout_form {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .summary_details {
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .checkout-summary-line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .checkout-summary-left {
          flex: 1;
          min-width: 0;
        }

        .checkout-summary-label {
          font-weight: 600;
          color: #666;
          line-height: 1.2;
        }

        .checkout-summary-sub {
          margin-top: 4px;
          font-size: 12px;
          color: #999;
          line-height: 1.2;
        }

        .checkout-summary-right {
          flex: none;
          text-align: right;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
        }

        .checkout-summary-total .checkout-summary-label {
          color: #111;
          font-weight: 800;
        }

        .checkout-summary-total .checkout-summary-right {
          font-weight: 900;
        }

        .free-shipping-notice {
          background: #d4edda;
          color: #155724;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.2;
        }

        .checkout-free-ship-icon {
          flex: none;
          display: block;
        }

        .trust-badges {
          text-align: center;
        }

        .trust-badges small {
          display: block;
          color: #666;
          font-size: 11px;
        }

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
          border-color: #f26522;
        }

        @media (max-width: 768px) {
          .checkout_steps {
            flex-direction: column;
            gap: 20px;
          }

          .step_item {
            flex-direction: column;
            text-align: center;
          }

          .step_line {
            display: none;
          }

          .step_name {
            margin-top: 5px;
          }
        }

        /* Modern Header Styles */
        .modern-header {
          background: #000;
          backdrop-filter: blur(10px);
          border-radius: 0 0 30px 30px;
        }
        
        .top-bar {
          background: #000;
          padding: 2px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .contact-info span {
          color: #fff;
          font-size: 12px;
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
          .top-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
