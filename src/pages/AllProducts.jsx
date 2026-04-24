import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset, FaTruck, FaShoppingCart, FaSearch, FaBars, FaEnvelope, FaFilter, FaSort, FaThLarge, FaTh, FaSquare } from 'react-icons/fa';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import QuickViewModal from '../components/QuickViewModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import './AllProducts.css';
import '../assets/css/BuyNowButton.css';
import '../assets/css/FilterBar.css';

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
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [layoutView, setLayoutView] = useState(3); // 3, 5, 2, or 1 products per row
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, priceRange, currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

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
        <button
          className="quickview-btn"
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
        >
          +
        </button>
      </div>
      <div className="card-body-v2">
        <h5 className="card-title-v2">{product.name}</h5>
        <div className="card-price-v2">
          <span className="price-now">Rs. {Math.round(product.discount_price || product.price)}</span>
          {product.discount_price && <span className="price-old">Rs. {Math.round(product.price)}</span>}
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

      {/* Filter Bar */}
      <div className="filter-bar-section">
        <div className="container">
          <div className="filter-bar">
            <div className="filter-bar-left">
              {/* Desktop Search Bar */}
              <div className="search-bar-inline d-none d-md-flex">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-inline"
                />
                <button onClick={handleSearch} className="search-btn-inline">
                  <FaSearch />
                </button>
              </div>
              
              {/* Mobile Search Button */}
              <button 
                className="mobile-search-toggle-btn d-flex d-md-none"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <FaSearch />
              </button>
              
              {/* Mobile Search Bar (Hidden by default) */}
              {mobileSearchOpen && (
                <div className="mobile-search-bar d-flex d-md-none">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mobile-search-input"
                    autoFocus
                  />
                  <button onClick={handleSearch} className="mobile-search-btn">
                    <FaSearch />
                  </button>
                  <button 
                    onClick={() => setMobileSearchOpen(false)}
                    className="mobile-search-close"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="filter-bar-right">
              <div className="sort-dropdown">
                <button 
                  className="sort-toggle-btn"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <FaSort className="filter-icon" />
                  Sort By
                </button>
                <div className={`sort-dropdown-menu ${showSortDropdown ? 'show' : ''}`}>
                  <button 
                    className={`sort-option ${sortBy === 'created_at' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('created_at');
                      setShowSortDropdown(false);
                    }}
                  >
                    Latest First
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price_low' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price_low');
                      setShowSortDropdown(false);
                    }}
                  >
                    Price: Low to High
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price_high' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price_high');
                      setShowSortDropdown(false);
                    }}
                  >
                    Price: High to Low
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'name_asc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name_asc');
                      setShowSortDropdown(false);
                    }}
                  >
                    Name: A to Z
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'name_desc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name_desc');
                      setShowSortDropdown(false);
                    }}
                  >
                    Name: Z to A
                  </button>
                </div>
              </div>
              
              {/* Layout View Buttons */}
              
              
              <button 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="filter-icon" />
                Filters
                {priceRange || searchQuery ? (
                  <span className="filter-active-dot"></span>
                ) : null}
              </button>

              <div className="layout-view-buttons">
                <button 
                  className={`layout-btn ${layoutView === 3 || layoutView === 2 ? 'active' : ''}`}
                  onClick={() => setLayoutView(window.innerWidth < 768 ? 2 : 3)}
                  title={window.innerWidth < 768 ? "2 per row" : "3 per row"}
                >
                  <FaThLarge />
                </button>
                <button 
                  className={`layout-btn ${layoutView === 5 || layoutView === 1 ? 'active' : ''}`}
                  onClick={() => setLayoutView(window.innerWidth < 768 ? 1 : 5)}
                  title={window.innerWidth < 768 ? "1 per row" : "5 per row"}
                >
                  {window.innerWidth < 768 ? <FaSquare /> : <FaTh />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container" style={{ marginTop: '20px', marginBottom: '50px' }}>

        {/* Sidebar Layout: Filter Left, Products Right */}
        <div className="row">
          {/* Left Sidebar - Filter Section */}
          {showFilters && (
            <div className="col-lg-3 col-md-4 mb-4">
              <div className="sidebar-filter-section compact">
                <div className="sidebar-content">

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
                    onApply={() => {}}
                  />
                </div>
              </div>
              </div>
            </div>
          )}
          
          {/* Right Side - Products Grid */}
          <div className={`col-lg-${showFilters ? '9' : '12'} col-md-${showFilters ? '8' : '12'}`}>
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
                {products.map((product) => {
                  // Get column classes based on layout view
                  const getColClasses = () => {
                    switch(layoutView) {
                      case 5:
                        return 'col-xl-2 col-lg-3 col-md-4 col-6 mb-4';
                      case 3:
                        return 'col-lg-4 col-md-6 col-6 mb-4';
                      case 2:
                        return 'col-lg-6 col-md-6 col-6 mb-4';
                      case 1:
                        return 'col-12 mb-4';
                      default:
                        return 'col-lg-4 col-md-6 col-6 mb-4';
                    }
                  };
                  
                  return (
                    <div className={getColClasses()} key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
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
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default AllProducts;
