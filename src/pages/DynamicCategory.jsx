import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import './DynamicCategory.css';
import '../assets/css/BuyNowButton.css';
import {FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch, FaBars } from 'react-icons/fa'
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

  useEffect(() => {
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

    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug, navigate]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const applyFilters = async (range = priceRange) => {
    const actualRange = range || [0, 10000];
    console.log('applyFilters called with range:', actualRange);
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 12,
        sortBy,
        min_price: actualRange[0],
        max_price: actualRange[1],
        search: searchQuery
      };
      console.log('API params:', params);
      const filteredData = await themeApi.getProductsByCategory(categorySlug, params);
      console.log('API response:', filteredData);
      setFilteredProducts(filteredData.products || []);
      setTotalPages(filteredData.pagination?.pages || 1);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Failed to apply filters');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const searchResults = await themeApi.searchProducts(searchQuery.trim());
        setFilteredProducts(searchResults.products || []);
        setTotalPages(searchResults.totalPages || 1);
        setCurrentPage(1);
        setLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search products');
        setLoading(false);
      }
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

      <br/>
      <br/>

      
      {/* Header Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="title_section">
              <h1 className="fashion_taital">{category.name}</h1>
              {category.description && (
                <p className="category_description">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Layout: Filter Left, Products Right */}
      <div className="container">
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
                      <Search size={16} className="sidebar-search-icon" />
                      <input
                        type="text"
                        className="sidebar-search-input"
                        placeholder={`Search in ${category?.name || 'category'}...`}
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
                    onChange={handlePriceRangeChange}
                    onApply={applyFilters}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Products Grid */}
          <div className="col-lg-9 col-md-8">
            <div className="products_section">
              <div className="row">
                {filteredProducts.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div className="col-lg-4 col-md-6 col-6 mb-4" key={product.id}>
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
                    </div>
                  ))
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
    </div>
  );
};

export default DynamicCategory;
