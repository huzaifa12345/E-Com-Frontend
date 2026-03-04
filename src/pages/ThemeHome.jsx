import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaShoppingCart, FaUser, FaHeart, FaStar, FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import websiteSettingsApi from '../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/mobile-responsive.css';

const ThemeHome = () => {

   const navigate = useNavigate();
  const { addToCart, getCartItemsCount } = useCart();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [websiteLogo, setWebsiteLogo] = useState('/src/assets/images/kidcolor(1).png');
  const [heroSlides, setHeroSlides] = useState([
    {
      image: "/src/assets/images/kids.webp",
      title: "Welcome to Kids Colours",
      description: "Discover amazing products with unbeatable prices and quality"
    },
    {
      image: "/src/assets/images/banner_img.webp",
      title: "Trendy Fashion for Kids",
      description: "Explore our latest collection of stylish kids' clothing"
    },
    {
      image: "/src/assets/images/toys-banner.webp",
      title: "Fun Toys & Games",
      description: "Educational and entertaining toys for your little ones"
    },
    {
      image: "/src/assets/images/shoes-banner.webp",
      title: "Comfortable Kids Shoes",
      description: "Stylish and comfortable footwear for active kids"
    }
  ]);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const newSlide = (prev + 1) % heroSlides.length;
        console.log('Auto-advancing to slide:', newSlide, 'Total slides:', heroSlides.length);
        return newSlide;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides.length]); // Add dependency on heroSlides.length

  // Fetch website settings
  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        console.log('=== FETCHING WEBSITE SETTINGS ===');
        const response = await websiteSettingsApi.getWebsiteSettings();
        console.log('Website settings response:', response);
        
        if (response.success) {
          const settings = response.data;
          console.log('Settings data received:', settings);
          
          // Update logo if available
          if (settings.logo && settings.logo.length > 0) {
            const logoSetting = settings.logo.find(s => s.key === 'website_logo');
            if (logoSetting && logoSetting.value) {
              setWebsiteLogo(logoSetting.value);
              console.log('Updated website logo:', logoSetting.value);
            }
          }

          // Update hero slides from settings
          if (settings.hero && Array.isArray(settings.hero)) {
            const dynamicSlides = [];
            
            // Get all hero slide settings
            for (let i = 1; i <= 4; i++) {
              const imageSetting = settings.hero.find(s => s.key === `hero_slide_${i}`);
              const titleSetting = settings.hero.find(s => s.key === `hero_title_${i}`);
              const descSetting = settings.hero.find(s => s.key === `hero_description_${i}`);
              
              if (imageSetting || titleSetting || descSetting) {
                dynamicSlides.push({
                  image: imageSetting?.value || `/src/assets/images/kids.webp`,
                  title: titleSetting?.value || `Slide ${i}`,
                  description: descSetting?.value || `Description for slide ${i}`
                });
              }
            }
            
            if (dynamicSlides.length > 0) {
              setHeroSlides(dynamicSlides);
              console.log('Updated hero slides:', dynamicSlides);
              console.log('Current heroSlides state will be:', dynamicSlides);
            } else {
              console.log('No dynamic slides found, keeping defaults');
            }
          }
        } else {
          console.log('No website settings found, using defaults');
        }
      } catch (error) {
        console.error('Error fetching website settings:', error);
      }
    };

    fetchWebsiteSettings();
  }, []);

  // Fetch categories and products from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        console.log('Fetching categories...');
        const categoriesData = await themeApi.getCategories();
        console.log('Categories data:', categoriesData);
        
        // Check if categoriesData exists and is an array
        if (!categoriesData || !Array.isArray(categoriesData)) {
          console.error('Categories data is not an array:', categoriesData);
          setCategories([]);
          return;
        }
        
        const activeCategories = categoriesData.filter(cat => cat.is_active) || [];
        console.log('Active categories:', activeCategories);
        setCategories(activeCategories);

        // Fetch products for each category
        const productsData = {};
        for (const category of activeCategories) {
          try {
            console.log(`Fetching products for category ${category.name} (ID: ${category.id})...`);
            const categoryProducts = await themeApi.getProductsByCategory(category.id);
            console.log(`Products for category ${category.name} (ID: ${category.id}):`, categoryProducts);
            
            // Handle the response structure properly
            const products = categoryProducts.products || categoryProducts || [];
            console.log(`Extracted products array:`, products);
            
            productsData[category.id] = Array.isArray(products) ? products.slice(0, 3) : []; // Show 3 products per category
          } catch (error) {
            console.error(`Error fetching products for category ${category.id}:`, error);
            productsData[category.id] = [];
          }
        }
        console.log('Final products data:', productsData);
        setProductsByCategory(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data: ' + (error.response?.data?.error || error.message));
        setCategories([]);
        setProductsByCategory({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Reuse global All Products search (name + SKU) for consistency
    navigate(`/all-products?search=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <div className="banner_bg_main">
        <div className="container text-center py-5">
          <div className="spinner-border text-light" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banner_bg_main">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />

          {/* Category Navigation */}
          {/* <div className="category-nav">
            <div className="row">
              <div className="col-12">
                <div className="category-menu">
                  <Link to="/" className="category-link active">Home</Link>
                  {categories.filter(category => category.level === 3).map((category) => (
                    <Link 
                      key={category.id}
                      to={`/category/${category.id}`}
                      className="category-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryClick(category.id);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-slider">
            <div className="hero-content">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="hero-text">
                    <h1 className="display-4 fw-bold text-white mb-4">
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="lead text-white mb-4">
                      {heroSlides[currentSlide].description}
                    </p>
                    <div className="hero-buttons">
                      <Link to="/all-products" className="btn btn-primary btn-lg me-3">
                        Buy Now
                      </Link>
                      {' '}
                      <Link to="/all-products" className="btn btn-outline-light btn-lg">
                        View Products
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="hero-image-container">
                    <div className="hero-image-wrapper">
                      <img 
                        src={heroSlides[currentSlide].image} 
                        alt="Hero Banner" 
                        className="hero-image" 
                      />
                      <div className="hero-image-overlay"></div>
                    </div>
                    <div className="hero-image-decoration">
                      <div className="decoration-circle decoration-1"></div>
                      <div className="decoration-circle decoration-2"></div>
                      <div className="decoration-circle decoration-3"></div>
                    </div>
                    {/* Debug info
                    <div className="mt-2 text-white small">
                      Slide {currentSlide + 1}: {heroSlides[currentSlide].image}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Slider Controls */}
            <div className="slider-controls">
              <button 
                className="slider-btn slider-btn-prev"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              >
                <span>&#10094;</span>
              </button>
              <button 
                className="slider-btn slider-btn-next"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              >
                <span>&#10095;</span>
              </button>
            </div>
            
            {/* Slider Indicators */}
            <div className="slider-indicators">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* Products by Category Section */}
      <section className="products-section py-5">
        <div className="container">
          {categories.filter(category => category.level === 3).map((category) => (
            <div key={category.id} className="category-section mb-5">
              <div className="category-header d-flex justify-content-between align-items-center mb-4">
                <h2 className="section-title">{category.name}</h2>
                <Link 
                  to={`/category/${category.id}`}
                  className="btn btn-outline-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(category.id);
                  }}
                >
                  View All
                </Link>
              </div>
              
              <div className="row">
                {productsByCategory[category.id]?.length > 0 ? (
                  productsByCategory[category.id]?.map((product) => (
                    <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="product-card">
                        <div className="product-image">
                          <img
                            src={
                              product.images && product.images.length > 0 
                                ? product.images[0] 
                                : product.image_url || product.image || '/src/assets/images/tshirt-img.png'
                            }
                            alt={product.name}
                          />
                          <div className="product-overlay">
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </button>
                            <button 
                              className="btn btn-outline-light"
                              onClick={() => handleProductClick(product.id)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <h5 className="product-title">{product.name}</h5>
                          <div className="product-rating">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < 4 ? 'text-warning' : 'text-secondary'} />
                            ))}
                            <span className="text-muted">(4.0)</span>
                          </div>
                          <div className="product-price">
                            <span className="current-price">{product.price}</span>
                            {product.original_price && (
                              <span className="original-price">{product.original_price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-4">
                    <p className="text-muted">No products available in this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="newsletter-section py-5">
        <div className="container">
          <div className="newsletter-content text-center">
            <h2 className="mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-4">Get the latest updates on new products and exclusive offers</p>
            <form className="newsletter-form d-flex justify-content-center">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                style={{ maxWidth: '400px' }}
              />
              <button type="submit" className="btn btn-primary ms-2">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-6 mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <FaTruck />
                </div>
                <h5>Free Shipping</h5>
                <p>On orders over 2000</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <FaShieldAlt />
                </div>
                <h5>Secure Payment</h5>
                <p>100% secure transactions</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <FaUndo />
                </div>
                <h5>Easy Returns</h5>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <FaHeadset />
                </div>
                <h5>24/7 Support</h5>
                <p>Dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ThemeFooter />

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <style jsx>{`
        /* Hero Slider Styles */
        .hero-slider {
          position: relative;
        }

        .slider-controls {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          pointer-events: none;
        }

        .slider-btn {
          background: rgba(242, 101, 34, 0.8);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: all;
          transition: all 0.3s ease;
          font-size: 18px;
          font-weight: bold;
        }

        .slider-btn:hover {
          background: rgba(242, 101, 34, 1);
          transform: scale(1.1);
        }

        .slider-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .indicator:hover {
          background: rgba(255, 255, 255, 0.7);
        }

        /* Hero Image Transition */
        .hero-image {
          transition: opacity 0.5s ease-in-out;
        }

        .modern-header {
          background: #000;
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-radius: 0 0 30px 30px;
        }

        .top-bar {
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .contact-info span {
          color: #fff;
          font-size: 14px;
        }

        .social-links a {
          color: #fff;
          font-size: 18px;
          margin-left: 15px;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: #f26522;
        }

        .main-nav {
          padding: 20px 0;
        }

        .logo img {
          max-height: 60px;
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
        }

        .search-bar .form-control::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-bar .form-control:focus {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(242, 101, 34, 0.3);
        }

        .btn-search {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          background: #f26522;
          border: none;
          color: white;
        }

        .category-nav {
          background: rgba(242, 101, 34, 0.9);
          padding: 15px 0;
          border-radius: 20px;
        }

        .category-menu {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
        }

        .category-link {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          padding: 5px 0;
          position: relative;
        }

        .category-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #fff;
          transition: width 0.3s;
        }

        .category-link:hover::after,
        .category-link.active::after {
          width: 100%;
        }

        .hero-section {
          padding: 80px 0;
          position: relative;
          z-index: 2;
        }

        .hero-text h1 {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          font-weight: 700;
        }

        .hero-buttons .btn {
          border-radius: 25px;
          padding: 12px 30px;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .hero-buttons .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        /* Unique Hero Image Styles */
        .hero-image-container {
          position: relative;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          transform: perspective(1000px) rotateY(-5deg);
          transition: transform 0.6s ease;
        }

        .hero-image-wrapper:hover {
          transform: perspective(1000px) rotateY(0deg) scale(1.02);
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .hero-image-wrapper:hover .hero-image {
          transform: scale(1.1);
        }

        .hero-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(242, 101, 34, 0.1) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(242, 101, 34, 0.1) 100%);
          pointer-events: none;
        }

        /* Decorative Elements */
        .hero-image-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(242, 101, 34, 0.2), rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
        }

        .decoration-1 {
          width: 80px;
          height: 80px;
          top: -20px;
          right: -20px;
          animation: float 6s ease-in-out infinite;
        }

        .decoration-2 {
          width: 60px;
          height: 60px;
          bottom: -15px;
          left: -15px;
          animation: float 8s ease-in-out infinite reverse;
        }

        .decoration-3 {
          width: 40px;
          height: 40px;
          top: 50%;
          right: -10px;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .features-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          margin: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .feature-card {
          padding: 30px 20px;
          border-radius: 15px;
          transition: transform 0.3s, box-shadow 0.3s;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(5px);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 48px;
          color: #f26522;
          margin-bottom: 15px;
          transition: transform 0.3s;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .products-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          margin: 20px;
          padding: 40px 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          color: #333;
          font-weight: bold;
          position: relative;
          padding-bottom: 10px;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: #f26522;
          border-radius: 2px;
        }

        .product-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .product-image {
          position: relative;
          overflow: hidden;
          border-radius: 15px 15px 0 0;
          width: 100%;
        }

        .product-image img {
          width: 100%;
          height: 250px;
          object-fit: contain;
          display: block;
          background-color: #f8f9fa;
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .product-overlay .btn {
          margin: 5px;
          border-radius: 20px;
          padding: 8px 20px;
          font-size: 14px;
        }

        .product-info {
          padding: 20px;
        }

        .product-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .product-rating {
          margin-bottom: 10px;
        }

        .product-rating svg {
          font-size: 14px;
        }

        .product-price {
          font-size: 18px;
          font-weight: bold;
          color: #f26522;
        }

        .original-price {
          text-decoration: line-through;
          color: #999;
          margin-left: 10px;
          font-size: 14px;
        }

        .newsletter-section {
          background: linear-gradient(135deg, #f26522, #ff8c42);
          color: white;
          border-radius: 20px;
          margin: 20px;
          box-shadow: 0 10px 30px rgba(242, 101, 34, 0.3);
        }

        .newsletter-form .form-control {
          border-radius: 25px 0 0 25px;
          border: none;
          background: rgba(255, 255, 255, 0.9);
        }

        .newsletter-form .btn {
          border-radius: 0 25px 25px 0;
          background: #333;
          border: none;
        }

        .footer-section {
          background: #333;
          color: white;
          padding: 50px 0 20px;
          border-radius: 20px 20px 0 0;
        }

        .footer-about img {
          max-height: 50px;
        }

        .footer-links h5,
        .footer-contact h5 {
          color: #f26522;
          margin-bottom: 20px;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
        }

        .footer-links ul li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: #ccc;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: #f26522;
        }

        .social-icon {
          color: white;
          font-size: 20px;
          margin-right: 15px;
          transition: color 0.3s;
        }

        .social-icon:hover {
          color: #f26522;
        }

        .footer-bottom {
          border-top: 1px solid #555;
          margin-top: 30px;
          padding-top: 20px;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f26522;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .top-bar {
            display: none;
          }

          .main-nav .row {
            align-items: center;
          }

          .search-bar {
            margin: 15px 0;
          }

          .category-menu {
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 10px;
          }

          .category-link {
            white-space: nowrap;
            margin-right: 20px;
          }

          .hero-section {
            padding: 40px 0;
          }

          .hero-text h1 {
            font-size: 2rem;
          }

          .features-section,
          .products-section,
          .newsletter-section {
            margin: 10px;
            padding: 20px 15px;
          }

          .product-card {
            margin-bottom: 20px;
          }

          .footer-section {
            padding: 30px 0 15px;
          }
        }

        @media (max-width: 576px) {
          .hero-text h1 {
            font-size: 1.5rem;
          }

          .hero-buttons .btn {
            display: block;
            width: 100%;
            margin: 10px 0;
          }

          .newsletter-form {
            flex-direction: column;
            align-items: center;
          }

          .newsletter-form .form-control {
            border-radius: 25px;
            margin-bottom: 10px;
            max-width: 100%;
          }

          .newsletter-form .btn {
            border-radius: 25px;
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeHome;
