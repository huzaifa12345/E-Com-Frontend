import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import SideDrawer from '../components/SideDrawer';
import '../assets/css/mobile-responsive.css';
import '../assets/css/cart-styles.css';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';


const Cart = () => {
  const { 
    items, 
    shippingMethod,
    setShippingMethod,
    shippingOptions,
    freeShippingThreshold,
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsCount,
    getShippingCost,
    clearCart 
  } = useCart();

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const subtotal = getCartTotal();
  const itemsCount = getCartItemsCount();
  const shippingCost = getShippingCost(subtotal, shippingMethod);

  const discount = useMemo(() => {
    if (!promoApplied) return 0;
    if (promoApplied.type === 'percent') return (subtotal * promoApplied.value) / 100;
    if (promoApplied.type === 'flat') return promoApplied.value;
    return 0;
  }, [promoApplied, subtotal]);

  const total = Math.max(0, subtotal + shippingCost - discount);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // Simple demo promo logic (UI-focused). Adjust later if you want backend-driven promos.
    if (code === 'SAVE10') {
      setPromoApplied({ code, type: 'percent', value: 10 });
      return;
    }

    if (code === 'FLAT500') {
      setPromoApplied({ code, type: 'flat', value: 500 });
      return;
    }

    setPromoApplied({ code, type: 'invalid', value: 0 });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Modern Header */}
        <header className="modern-header">
          <div className="container">
            {/* Top Bar */}
            <TopBar
             onMenuToggle={() => setSideDrawerOpen(true)}
              />

          </div>
        </header>
        
    
        
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
              <Link to="/all-products" className="btn btn-primary btn-lg px-5" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
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
        <ThemeFooter />


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
          <TopBar 
          onMenuToggle={() => setSideDrawerOpen(true)}
          />

        </div>
      </header>
      

      <div className="container layout_padding">
        <div className="cart2-header">
          <div className="cart2-title">Shopping Cart</div>
          <div className="cart2-count">{itemsCount} Item{itemsCount === 1 ? '' : 's'}</div>
        </div>
        
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="cart2-table">
              <div className="cart2-table-head">
                <div className="cart2-col cart2-col-product">PRODUCT DETAILS</div>
                <div className="cart2-col cart2-col-qty">QUANTITY</div>
                <div className="cart2-col cart2-col-price">PRICE</div>
                <div className="cart2-col cart2-col-total">TOTAL</div>
              </div>

              {items.map((item) => {
                const imageSrc =
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : item.image_url || item.image || '/src/assets/images/tshirt-img.png';

                return (
                  <div className="cart2-row" key={item.id}>
                    <div className="cart2-col cart2-col-product">
                      <div className="cart2-product">
                        <img className="cart2-img" src={imageSrc} alt={item.name} />
                        <div className="cart2-product-meta">
                          <div className="cart2-product-name">{item.name}</div>
                          <button
                            type="button"
                            className="cart2-remove"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart2-col cart2-col-qty">
                      <div className="cart2-qty">
                        <button
                          type="button"
                          className="cart2-qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="cart2-icon" />
                        </button>
                        <input
                          className="cart2-qty-input"
                          value={item.quantity}
                          readOnly
                          aria-label="Quantity"
                        />
                        <button
                          type="button"
                          className="cart2-qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="cart2-icon" />
                        </button>
                      </div>
                    </div>

                    <div className="cart2-col cart2-col-price">Rs. {Number(item.price).toFixed(2)}</div>
                    <div className="cart2-col cart2-col-total">
                      Rs. {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                );
              })}

              <div className="cart2-actions">
                <button type="button" className="cart2-clear" onClick={clearCart}>
                  <Trash2 className="cart2-icon" />
                  Clear cart
                </button>
                <Link to="/all-products" className="cart2-continue">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="cart2-summary">
              <div className="cart2-summary-title">Order Summary</div>

              <div className="cart2-summary-row">
                <div className="cart2-summary-label">ITEMS</div>
                <div className="cart2-summary-value">
                  {itemsCount} &nbsp;&nbsp; Rs. {subtotal.toFixed(2)}
                </div>
              </div>

              <div className="cart2-summary-row">
                <div className="cart2-summary-label">SHIPPING</div>
                <div className="cart2-summary-control">
                  <select
                    className="cart2-select"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    {shippingOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} - Rs. {opt.cost.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {subtotal >= freeShippingThreshold && (
                    <div className="cart2-note">
                      Free shipping on orders Rs. {freeShippingThreshold.toLocaleString()}+
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="cart2-summary-row">
                <div className="cart2-summary-label">PROMO CODE</div>
                <div className="cart2-summary-control">
                  <input
                    className="cart2-input"
                    placeholder="Enter your code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="button" className="cart2-apply" onClick={applyPromo}>
                    APPLY
                  </button>
                  {promoApplied?.type === 'invalid' && (
                    <div className="cart2-error">Invalid promo code</div>
                  )}
                  {promoApplied && promoApplied.type !== 'invalid' && (
                    <div className="cart2-success">
                      Applied <strong>{promoApplied.code}</strong>{' '}
                      <button
                        type="button"
                        className="cart2-link"
                        onClick={() => setPromoApplied(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div> */}

              <div className="cart2-divider" />

              <div className="cart2-total">
                <div className="cart2-total-label">TOTAL COST</div>
                <div className="cart2-total-value">Rs. {total.toFixed(2)}</div>
              </div>

              <Link to="/checkout" className="cart2-checkout">
                CHECKOUT
              </Link>

              <div className="cart2-breakdown">
                <div className="cart2-breakdown-row">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="cart2-breakdown-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="cart2-breakdown-row">
                    <span>Discount</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <ThemeFooter />

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <style>{`
        .cart2-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin: 10px 0 22px;
          padding-bottom: 14px;
          border-bottom: 1px solid #eee;
        }
        .cart2-title {
          font-size: 28px;
          font-weight: 700;
          color: #111;
        }
        .cart2-count {
          color: #666;
          font-weight: 600;
        }

        .cart2-table {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }
        .cart2-table-head {
          display: grid;
          grid-template-columns: 1fr 160px 140px 140px;
          gap: 0;
          padding: 14px 16px;
          background: #fafafa;
          border-bottom: 1px solid #eee;
          font-size: 12px;
          font-weight: 700;
          color: #777;
          letter-spacing: 0.04em;
        }
        .cart2-row {
          display: grid;
          grid-template-columns: 1fr 160px 140px 140px;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        .cart2-row:last-child {
          border-bottom: none;
        }
        .cart2-col-price,
        .cart2-col-total {
          text-align: right;
          font-weight: 700;
          color: #222;
        }

        .cart2-product {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .cart2-img {
          width: 62px;
          height: 62px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #eee;
          background: #fff;
          flex: none;
        }
        .cart2-product-meta {
          min-width: 0;
        }
        .cart2-product-name {
          font-weight: 700;
          color: #111;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 360px;
        }
        .cart2-remove {
          margin-top: 6px;
          padding: 0;
          background: transparent;
          border: none;
          color: #999;
          font-size: 12px;
          text-decoration: underline;
          cursor: pointer;
        }
        .cart2-remove:hover {
          color: #333;
        }

        .cart2-qty {
          display: inline-flex;
          align-items: center;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .cart2-qty-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #fff;
          cursor: pointer;
          color: #333;
        }
        .cart2-qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .cart2-qty-input {
          width: 44px;
          height: 36px;
          border: none;
          border-left: 1px solid #eee;
          border-right: 1px solid #eee;
          text-align: center;
          font-weight: 700;
          color: #111;
          outline: none;
        }
        .cart2-icon {
          width: 16px;
          height: 16px;
        }

        .cart2-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fff;
          border-top: 1px solid #eee;
        }
        .cart2-clear {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #f1c7c7;
          color: #b42318;
          background: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .cart2-clear:hover {
          background: #fff5f5;
        }
        .cart2-continue {
          color: #444;
          text-decoration: underline;
          font-weight: 700;
        }

        .cart2-summary {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 16px;
          position: sticky;
          top: 20px;
        }
        .cart2-summary-title {
          font-weight: 800;
          font-size: 18px;
          margin-bottom: 14px;
        }
        .cart2-summary-row {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 12px;
          align-items: start;
          padding: 10px 0;
          border-bottom: 1px solid #f1f1f1;
        }
        .cart2-summary-row:last-of-type {
          border-bottom: none;
        }
        .cart2-summary-label {
          font-size: 12px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.04em;
        }
        .cart2-summary-value {
          text-align: right;
          font-weight: 800;
          color: #222;
        }
        .cart2-summary-control {
          text-align: right;
        }
        .cart2-select {
          width: 100%;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 10px 12px;
          background: #fff;
          outline: none;
        }
        .cart2-input {
          width: 100%;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          margin-top: 6px;
        }
        .cart2-apply {
          width: 100%;
          margin-top: 10px;
          border: none;
          border-radius: 8px;
          background: #ef6b66;
          color: #fff;
          font-weight: 900;
          padding: 10px 12px;
          cursor: pointer;
          letter-spacing: 0.06em;
        }
        .cart2-apply:hover {
          background: #e65b56;
        }
        .cart2-note {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
        }
        .cart2-error {
          margin-top: 8px;
          font-size: 12px;
          color: #b42318;
          text-align: right;
        }
        .cart2-success {
          margin-top: 8px;
          font-size: 12px;
          color: #067647;
          text-align: right;
        }
        .cart2-link {
          margin-left: 8px;
          padding: 0;
          border: none;
          background: transparent;
          text-decoration: underline;
          cursor: pointer;
          color: inherit;
          font-weight: 800;
        }
        .cart2-divider {
          height: 1px;
          background: #eee;
          margin: 14px 0;
        }
        .cart2-total {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cart2-total-label {
          font-size: 12px;
          font-weight: 900;
          color: #777;
          letter-spacing: 0.04em;
        }
        .cart2-total-value {
          font-size: 18px;
          font-weight: 900;
          color: #222;
        }
        .cart2-checkout {
          display: block;
          width: 100%;
          text-align: center;
          background: #5a56d6;
          color: #fff;
          font-weight: 900;
          padding: 12px 14px;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.06em;
        }
        .cart2-checkout:hover {
          background: #4f4bd1;
          color: #fff;
        }
        .cart2-breakdown {
          margin-top: 12px;
          color: #666;
          font-size: 13px;
        }
        .cart2-breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }

        @media (max-width: 991px) {
          .cart2-summary {
            position: static;
          }
          .cart2-table-head,
          .cart2-row {
            grid-template-columns: 1fr 150px 120px 120px;
          }
        }

        @media (max-width: 767px) {
          .cart2-table-head {
            display: none;
          }
          .cart2-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .cart2-col-price,
          .cart2-col-total {
            text-align: left;
          }
          .cart2-product-name {
            max-width: 100%;
            white-space: normal;
          }
          .cart2-actions {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
          .cart2-clear {
            justify-content: center;
          }
          .cart2-continue {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
