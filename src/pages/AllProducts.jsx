import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset, FaTruck, FaShoppingCart, FaSearch, FaBars, FaEnvelope } from 'react-icons/fa';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import './AllProducts.css';
import '../assets/css/BuyNowButton.css';

// Price Range Slider Component
const PriceRangeSlider = ({ min, max, value, onChange, onApply }) => {
  const [localValue, setLocalValue] = useState(value || [0, 10000]);
  const [dragging, setDragging] = useState(null);
  const trackRef = useRef(null);
  const valueRef = useRef(localValue);

  useEffect(() => {
    valueRef.current = localValue;
  }, [localValue]);

  useEffect(() => {
    setLocalValue(value || [0, 10000]);
  }, [value]);

  const getPercentage = useCallback((val) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percentage * (max - min));
  }, [min, max]);

  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setDragging(index);
  };

  useEffect(() => {
    if (dragging === null) return;

    const handleMouseMove = (e) => {
      const newValue = getValueFromPosition(e.clientX);
      setLocalValue(prev => {
        const newValues = [...prev];
        if (dragging === 0) {
          newValues[0] = Math.min(newValue, prev[1] - 100);
        } else {
          newValues[1] = Math.max(newValue, prev[0] + 100);
        }
        return newValues;
      });
    };

    const handleMouseUp = () => {
      setDragging(null);
      onChange(valueRef.current);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, localValue, onChange, getValueFromPosition]);

  const handleInputChange = (index, val) => {
    const numVal = parseInt(val) || 0;
    const newValues = [...localValue];
    if (index === 0) {
      newValues[0] = Math.min(Math.max(numVal, min), localValue[1] - 100);
    } else {
      newValues[1] = Math.max(Math.min(numVal, max), localValue[0] + 100);
    }
    setLocalValue(newValues);
    onChange(newValues);
  };

  return (
    <div className="price-filter-section">
      <div className="price-slider-container">
        <span className="price-slider-label">Filter by Price Range</span>
        
        <div className="price-slider-track" ref={trackRef}>
          <div 
            className="price-slider-fill"
            style={{
              left: `${getPercentage(localValue[0])}%`,
              width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`
            }}
          />
          <div
            className="price-slider-handle"
            style={{ left: `${getPercentage(localValue[0])}%` }}
            onMouseDown={handleMouseDown(0)}
          />
          <div
            className="price-slider-handle"
            style={{ left: `${getPercentage(localValue[1])}%` }}
            onMouseDown={handleMouseDown(1)}
          />
        </div>

        <div className="price-slider-values">
          <div className="price-input-group">
            <span className="price-separator">Rs</span>
            <input
              type="number"
              className="price-input"
              value={localValue[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              min={min}
              max={localValue[1] - 100}
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              className="price-input"
              value={localValue[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              min={localValue[0] + 100}
              max={max}
            />
          </div>
          <button className="price-filter-btn" onClick={() => onApply(localValue)}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

const AllProducts = () => {
  const { addToCart, getCartItemsCount, clearCart } = useCart();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, priceRange, currentPage]);

  // Initialize searchQuery from URL (TopBar default navigation uses ?search=...)
  useEffect(() => {
    const q = searchParams.get('search') || '';
    // Avoid loops: only update when it differs
    if (q !== searchQuery) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchProducts = async (range = priceRange) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy,
        ...(priceRange && { min_price: priceRange[0], max_price: priceRange[1] }),
        search: searchQuery
      };
      
      const data = await themeApi.getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const q = searchQuery.trim();
    if (q) {
      setSearchParams({ search: q });
    } else {
      setSearchParams({});
    }
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    // Clear existing cart and add this product
    clearCart();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await themeApi.addToWishlist(productId);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card-v2"
    >
      <div className="card-img-v2" onClick={() => navigate(`/product/${product.id}`)}>
        <img 
          src={
            product.images && product.images.length > 0 
              ? product.images[0] 
              : product.image_url || '/src/assets/images/tshirt-img.png'
          } 
          alt={product.name}
        />
        {product.discount_price && (
          <div className="discount-tag">-{Math.round(((product.price - product.discount_price) / product.price) * 100)}%</div>
        )}
      </div>
      <div className="card-body-v2">
        <h5 className="card-title-v2">{product.name}</h5>
        <div className="card-price-v2">
          <span className="price-now">Rs. {Math.round(product.discount_price || product.price)}</span>
          {product.discount_price && <span className="price-old">Rs. {Math.round(product.price)}</span>}
        </div>
        <div className="btn-group-v2">
          <button className="btn-add-v2" onClick={() => { handleAddToCart(product); toast.success(`${product.name} added to Cart!`); }}>
            Add to Cart
          </button>
          <button className="btn-buy-now-v2" onClick={() => handleBuyNow(product)}>
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="all-products-page">
      {/* Header - Using TopBar Component */}
      <header className="modern-header">
        <div className="container">
          <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        </div>
      </header>

      {/* Page Content */}
      <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
        {/* Page Title */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 style={{ color: '#333', fontWeight: 'bold', marginBottom: '10px' }}>All Products</h2>
            <p style={{ color: '#666' }}>Discover our complete collection of kids' fashion</p>
          </div>
        </div>

        {/* Sidebar Layout: Filter Left, Products Right */}
        <div className="row">
          {/* Left Sidebar - Filter Section */}
          <div className="col-lg-3 col-md-4 mb-4">
            <div className="sidebar-filter-section compact">
              <div className="sidebar-content">
                {/* Search Input */}
                <div className="sidebar-search-wrapper">
                  <label className="sidebar-label">Search</label>
                  <form onSubmit={handleSearch} className="sidebar-search-form">
                    <div className="sidebar-search-input-group">
                      <FaSearch className="sidebar-search-icon" />
                      <input
                        type="text"
                        className="sidebar-search-input"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="sidebar-search-btn" type="submit">
                      Search
                    </button>
                  </form>
                </div>

                {/* Divider */}
                <div className="sidebar-divider"></div>

                {/* Price Range Slider */}
                <div className="sidebar-price-wrapper">
                  <label className="sidebar-label">Price Range</label>
                  <PriceRangeSlider
                    min={0}
                    max={10000}
                    value={priceRange}
                    onChange={(newRange) => {
                      setPriceRange(newRange);
                      setCurrentPage(1);
                    }}
                    onApply={fetchProducts}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Products Grid */}
          <div className="col-lg-9 col-md-8">
            {/* Products Grid/List */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <h4 style={{ color: '#666' }}>No products found</h4>
                <p style={{ color: '#999' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="row">
                {products.map((product) => (
                  <div className="col-lg-4 col-md-6 col-6 mb-4" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      style={{ color: '#f26522' }}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(i + 1)}
                        style={{ 
                          backgroundColor: currentPage === i + 1 ? '#f26522' : 'transparent',
                          color: currentPage === i + 1 ? 'white' : '#f26522',
                          borderColor: '#f26522'
                        }}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === pagination.pages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      style={{ color: '#f26522' }}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Footer - Same as ThemeHome */}

      <ThemeFooter />

      {/* Add ThemeHome footer styles and DynamicCategory product card styles */}
      <style jsx>{`
        // .footer-section {
        //   background: #333;
        //   color: white;
        //   padding: 50px 0 20px;
        //   border-radius: 20px 20px 0 0;
        // }

        // .footer-about img {
        //   max-height: 50px;
        // }

        // .footer-links h5,
        // .footer-contact h5 {
        //   color: #f26522;
        //   margin-bottom: 20px;
        // }

        // .footer-links ul {
        //   list-style: none;
        //   padding: 0;
        // }

        // .footer-links ul li {
        //   margin-bottom: 10px;
        // }

        // .footer-links a {
        //   color: #ccc;
        //   text-decoration: none;
        //   transition: color 0.3s;
        // }

        // .footer-links a:hover {
        //   color: #f26522;
        // }

        // .footer-contact p {
        //   color: #ccc;
        //   margin-bottom: 10px;
        // }

        // .footer-contact p i {
        //   margin-right: 10px;
        //   color: #f26522;
        // }

        // .footer-bottom {
        //   border-top: 1px solid #555;
        //   margin-top: 30px;
        //   padding-top: 20px;
        // }

        // .footer-bottom p {
        //   color: #ccc;
        //   margin: 0;
        // }

        // .footer-bottom span {
        //   color: #f26522;
        // }

        /* Product Card Styles - Same as DynamicCategory */
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          height: 250px;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-content {
          padding: 20px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .product-price {
          font-size: 18px;
          font-weight: bold;
          color: #f26522;
          margin-bottom: 15px;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        .btn-add-cart {
          background: #f26522;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.3s ease;
        }

        .btn-add-cart:hover {
          background: #e55a1b;
        }

        .btn-view-details {
          background: transparent;
          color: #f26522;
          border: 1px solid #f26522;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-details:hover {
          background: #f26522;
          color: white;
        }

        @media (max-width: 768px) {
          .footer-section {
            padding: 30px 0 15px;
          }

          .product-card {
            margin-bottom: 20px;
          }

          .product-image-container {
            height: 320px;
          }

          .product-actions {
            flex-direction: column;
          }

          .btn-add-cart,
          .btn-view-details {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .product-image-container {
            height: 180px;
          }
          
          .product-content {
            padding: 12px;
          }
          
          .product-name {
            font-size: 14px;
          }
          
          .btn-add-cart,
          .btn-view-details {
            padding: 6px 8px;
            font-size: 12px;
          }
        }
      `}</style>

     

      {/* SideDrawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default AllProducts;
