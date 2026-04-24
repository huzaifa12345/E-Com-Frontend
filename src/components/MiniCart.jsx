import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  X, Plus, Minus, Trash2, ShoppingCart, ArrowRight
} from 'lucide-react';
import '../assets/css/MiniCart.css';

const MiniCart = () => {
  const { 
    items, isOpen, setCartOpen, shippingMethod, freeShippingThreshold,
    removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, getShippingCost
  } = useCart();

  const subtotal = getCartTotal();
  const shippingCost = getShippingCost(subtotal, shippingMethod);
  const total = subtotal + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="minicart-backdrop"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="minicart-drawer"
          >
            {/* Header - Slim & Dark */}
            <div className="minicart-header-slim">
              <div className="d-flex align-items-center">
                <ShoppingCart className="me-2" size={18} />
                <h2 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem', margin: '12px 0 0 7px' }}>
                 Shopping Cart ({getCartItemsCount()})
                </h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="minicart-close-x">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="minicart-body-area">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <ShoppingCart size={40} className="text-muted mb-3 opacity-20" />
                  <p className="small text-muted">Your cart is empty</p>
                  <Link to="/all-products" onClick={() => setCartOpen(false)} className="btn btn-sm btn-dark px-4">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="minicart-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="minicart-card">
                      <div className="item-img-box">
                        <img src={item.images?.[0] || item.image_url || '/src/assets/images/tshirt-img.png'} alt={item.name} />
                      </div>
                      <div className="item-content">
                        <div className="d-flex justify-content-between">
                          <h4 className="item-title-text">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="btn-del">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="qty-control-mini">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} disabled={item.quantity <= 1}><Minus size={10} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}><Plus size={10} /></button>
                          </div>
                          <span className="price-text">Rs. {(Number(item.discount_price || item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ultra Compact Footer */}
            {items.length > 0 && (
              <div className="minicart-footer-compact">
                <div className="summary-section-mini">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  
                  {shippingCost > 0 && subtotal < freeShippingThreshold && (
                    <div className="shipping-hint-bar">
                      Add <b>Rs. {(freeShippingThreshold - subtotal).toFixed(0)}</b> for Free Shipping
                    </div>
                  )}

                  <div className="total-line-big">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="footer-btns-row">
                  <Link to="/cart" onClick={() => setCartOpen(false)} className="btn-secondary-slim">
                    View Cart
                  </Link>
                  <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-primary-slim">
                    Checkout <ArrowRight size={14} className="ms-1" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;