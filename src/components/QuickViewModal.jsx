import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Truck, Shield } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import './QuickViewModal.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize('');
      setQuantity(1);
      setSelectedImage(0);
      fetchSizesAndStock();
    }
  }, [isOpen, product]);

  const fetchSizesAndStock = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const [sizesData, stockResponse] = await Promise.all([
        themeApi.getSizes(),
        themeApi.getAllProductStock(product.id)
      ]);
      setSizes(sizesData || []);
      setStockData(stockResponse?.data || []);
    } catch (error) {
      console.error('Error fetching sizes/stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockForSize = (sizeName) => {
    if (!stockData || stockData.length === 0) return 0;
    const stockEntry = stockData.find(stock => {
      return stock.size && stock.size.size === sizeName;
    });
    return stockEntry ? stockEntry.quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    try {
      await addToCart(product, quantity, selectedSize);
      toast.success(`${product.name} (Size: ${selectedSize}) added to cart!`);
      onClose();
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const images = product?.images && product.images.length > 0
    ? product.images
    : [product?.image_url || product?.image || '/src/assets/images/tshirt-img.png'];

  const productSizes = product?.sizes && product.sizes.length > 0
    ? [...product.sizes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : sizes;

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="quickview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="quickview-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="quickview-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="quickview-content">
            {/* Left - Images */}
            <div className="quickview-images">
              <div className="quickview-main-image">
                <img src={images[selectedImage]} alt={product.name} />
                {product.discount_price && (
                  <span className="quickview-discount">
                    -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="quickview-thumbnails">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className={selectedImage === idx ? 'active' : ''}
                      onClick={() => setSelectedImage(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right - Info */}
            <div className="quickview-info">
              <h2 className="quickview-title">{product.name}</h2>

              <div className="quickview-price">
                <span className="price-current">
                  Rs. {Number(product.discount_price || product.price).toLocaleString()}
                </span>
                {product.discount_price && (
                  <span className="price-original">
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {product.sku && (
                <div className="quickview-sku">
                  <span>SKU:</span> {product.sku}
                </div>
              )}

              <p className="quickview-description">
                {product.description || 'No description available.'}
              </p>

              {/* Size Selection */}
              <div className="quickview-sizes">
                <h4>Select Size</h4>
                <div className="size-buttons">
                  {productSizes.length > 0 ? (
                    productSizes.map((sizeItem, index) => {
                      const sizeName = typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size);
                      const stock = getStockForSize(sizeName);
                      return (
                        <button
                          key={index}
                          className={`size-btn ${selectedSize === sizeName ? 'active' : ''} ${stock === 0 ? 'out-of-stock' : ''}`}
                          onClick={() => {
                            if (stock > 0) setSelectedSize(sizeName);
                          }}
                          disabled={stock === 0}
                        >
                          {sizeName}
                          {/* {stock > 0 && <span className="stock-badge">{stock}</span>} */}
                          {stock === 0 && <div className="out-of-stock-line"></div>}
                        </button>
                      );
                    })
                  ) : (
                    <p className="no-sizes">No sizes available</p>
                  )}
                </div>
                {selectedSize && (
                  <p className="selected-size-text">
                    Selected: <strong>{selectedSize}</strong> ({getStockForSize(selectedSize)} available)
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="quickview-quantity">
                <h4>Quantity</h4>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="quickview-actions">
                {(() => {
                  const availableSizes = productSizes.filter(s => {
                    const sizeName = typeof s.size === 'string' ? s.size : JSON.stringify(s.size);
                    return getStockForSize(sizeName) > 0;
                  });
                  const isOutOfStock = availableSizes.length === 0;
                  
                  return isOutOfStock ? (
                    <button
                      className="btn-add-cart"
                      disabled
                      style={{
                        backgroundColor: '#6c757d',
                        cursor: 'not-allowed',
                        opacity: 0.7
                      }}
                    >
                      Out of Stock
                    </button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-add-cart"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-wishlist"
                        onClick={async () => {
                          try {
                            await themeApi.addToWishlist(product.id);
                            toast.success('Added to wishlist!');
                          } catch (error) {
                            toast.error('Failed to add to wishlist');
                          }
                        }}
                      >
                        <Heart size={20} />
                      </motion.button>
                    </>
                  );
                })()}
              </div>

              {/* Trust Badges */}
              <div className="quickview-trust">
                <div className="trust-item">
                  <Truck size={16} />
                  <span>Free Shipping over Rs 5,000</span>
                </div>
                <div className="trust-item">
                  <Shield size={16} />
                  <span>Quality Assured</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
