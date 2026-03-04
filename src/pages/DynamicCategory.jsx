import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import './DynamicCategory.css';
import {FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch, FaBars } from 'react-icons/fa'
import SideDrawer from '../components/SideDrawer';
import ThemeFooter from '../components/ThemeFooter';
import TopBar from '../components/TopBar';

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemsCount } = useCart();
  const { websiteLogo } = useLogo();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState([0, 5000]);
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
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const filteredData = await themeApi.getProductsByCategory(categorySlug, {
        page: 1,
        limit: 12,
        sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        search: searchQuery
      });
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

      {/* Search Bar Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="search-bar-section mb-4">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    className="search-input"
                    placeholder={`Search products in ${category?.name || 'this category'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="search-button" type="submit">
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

          {/* Products Section - Full Width */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="products_section">
              <div className="row">
                {filteredProducts.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div className="col-lg-4 col-md-6 col-sm-6 mb-4" key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="product-card"
                      >
                        <div className="product-image-container">
                          <img 
                            src={
                              product.images && product.images.length > 0 
                                ? product.images[0] 
                                : product.image_url || '/src/assets/images/tshirt-img.png'
                            } 
                            alt={product.name} 
                            className="product-image"
                          />
                          {/* <div className="overlay-icons">
                            <button className="icon-btn">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="icon-btn">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div> */}
                        </div>
                        <div className="product-content">
                          <h4 className="product-name">{product.name}</h4>
                          <p className="product-price">
                            Rs. {product.price}
                          </p>
                          <div className="product-actions">
                            <button 
                              className="btn-add-cart"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart size={16} />
                              Add to Cart
                            </button>
                            <button 
                              className="btn-view-details"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              View Details
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
