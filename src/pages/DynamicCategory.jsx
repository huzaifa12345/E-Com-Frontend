import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search, ArrowUpDown,} from 'lucide-react';
import { Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import QuickViewModal from '../components/QuickViewModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import './DynamicCategory.css';
import '../assets/css/BuyNowButton.css';
import '../assets/css/FilterBar.css';
import {FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch, FaBars, FaThLarge, FaTh, FaSquare } from 'react-icons/fa'
import SideDrawer from '../components/SideDrawer';
import ThemeFooter from '../components/ThemeFooter';
import TopBar from '../components/TopBar';

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

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemsCount, clearCart } = useCart();
  const { websiteLogo } = useLogo();
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [layoutView, setLayoutView] = useState(3); // 3, 5, 2, or 1 products per row
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch category details by ID
      const categoryData = await themeApi.getCategoryById(categorySlug);
      setCategory(categoryData);
      
      // Fetch products for this category with pagination
      console.log('[DynamicCategory] Fetching products for category ID:', categorySlug);
      const productsData = await themeApi.getProductsByCategory(categorySlug, {
        page: currentPage,
        limit: 12,
        sortBy,
        ...(priceRange && { min_price: priceRange[0], max_price: priceRange[1] }),
        search: searchQuery
      });
      console.log('[DynamicCategory] Products response:', productsData);
      console.log('[DynamicCategory] Products array:', productsData.products);
      console.log('[DynamicCategory] Pagination:', productsData.pagination);
      setProducts(productsData.products || []);
      setPagination(productsData.pagination || {});
      setTotalPages(productsData.pagination?.pages || 1);
      setFilteredProducts(productsData.products || []);
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast.error('Failed to load category');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
    applyFilters({ page });
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const applyFilters = async (overrides = {}) => {
    const actualRange = overrides.priceRange ?? priceRange ?? [0, 10000];
    const actualSort = overrides.sortBy ?? sortBy;
    const actualSearch = overrides.searchQuery ?? searchQuery;
    const actualPage = overrides.page ?? 1;
    console.log('applyFilters called with range:', actualRange, 'sort:', actualSort, 'page:', actualPage);
    try {
      setLoading(true);
      const params = {
        page: actualPage,
        limit: 12,
        sortBy: actualSort,
        min_price: actualRange[0],
        max_price: actualRange[1],
        search: actualSearch
      };
      console.log('API params:', params);
      const filteredData = await themeApi.getProductsByCategory(categorySlug, params);
      console.log('API response:', filteredData);
      setProducts(filteredData.products || []);
      setFilteredProducts(filteredData.products || []);
      setPagination(filteredData.pagination || {});
      setTotalPages(filteredData.pagination?.pages || 1);
      setCurrentPage(actualPage);
      setLoading(false);
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Failed to apply filters');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      applyFilters({ searchQuery: searchQuery.trim(), page: 1 });
    } else {
      setSearchQuery('');
      setCurrentPage(1);
      applyFilters({ searchQuery: '', page: 1 });
    }
  };

  if (loading) {
    return (
      <div className="banner_bg_main">
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="banner_bg_main">
        <div className="container text-center py-5">
          <h2>Category not found</h2>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="fashion_main">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          {/* Top Bar */}
          <TopBar 
          onMenuToggle={() => setSideDrawerOpen(true)}
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
                  <ArrowUpDown className="filter-icon" />
                  Sort By
                </button>
                <div className={`sort-dropdown-menu ${showSortDropdown ? 'show' : ''}`}>
                  <button 
                    className={`sort-option ${sortBy === 'created_at' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('created_at');
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                      applyFilters({ sortBy: 'created_at', page: 1 });
                    }}
                  >
                    Latest First
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price_low' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price_low');
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                      applyFilters({ sortBy: 'price_low', page: 1 });
                    }}
                  >
                    Price: Low to High
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price_high' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price_high');
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                      applyFilters({ sortBy: 'price_high', page: 1 });
                    }}
                  >
                    Price: High to Low
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'name_asc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name_asc');
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                      applyFilters({ sortBy: 'name_asc', page: 1 });
                    }}
                  >
                    Name: A to Z
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'name_desc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name_desc');
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                      applyFilters({ sortBy: 'name_desc', page: 1 });
                    }}
                  >
                    Name: Z to A
                  </button>
                </div>
              </div>
              
             
              
              <button 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="filter-icon" />
                Filters
                {priceRange || searchQuery ? (
                  <span className="filter-active-dot"></span>
                ) : null}
              </button>

               {/* Layout View Buttons */}
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

      {/* Sidebar Layout: Filter Left, Products Right */}
      <div className="container">
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
                    onChange={handlePriceRangeChange}
                    onApply={applyFilters}
                  />
                </div>
              </div>
              </div>
            </div>
          )}
          
          {/* Right Side - Products Grid */}
          <div className={`col-lg-${showFilters ? '9' : '12'} col-md-${showFilters ? '8' : '12'}`}>
            <div className="products_section">
              <div className="row">
                {filteredProducts.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
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
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination_section mt-4 text-center">
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-outline-secondary me-2" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button 
                      className="btn btn-outline-secondary ms-2" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <ThemeFooter />
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

export default DynamicCategory;
