import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import websiteSettingsApi from '../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/theme-home-styles.css';

const ThemeHome = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
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
    }
  ]);

  // --- Logic 1: Slider Auto-Advance ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // --- Logic 2: Website Settings ---
  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await websiteSettingsApi.getWebsiteSettings();
        if (response.success) {
          const settings = response.data;
          if (settings.logo) {
            const logoSetting = settings.logo.find(s => s.key === 'website_logo');
            if (logoSetting?.value) setWebsiteLogo(logoSetting.value);
          }
          if (settings.hero && Array.isArray(settings.hero)) {
            const dynamicSlides = [];
            for (let i = 1; i <= 4; i++) {
              const img = settings.hero.find(s => s.key === `hero_slide_${i}`);
              const title = settings.hero.find(s => s.key === `hero_title_${i}`);
              const desc = settings.hero.find(s => s.key === `hero_description_${i}`);
              if (img || title || desc) {
                dynamicSlides.push({
                  image: img?.value || `/src/assets/images/kids.webp`,
                  title: title?.value || `Slide ${i}`,
                  description: desc?.value || `Description for slide ${i}`
                });
              }
            }
            if (dynamicSlides.length > 0) setHeroSlides(dynamicSlides);
          }
        }
      } catch (error) { console.error('Settings error:', error); }
    };
    fetchWebsiteSettings();
  }, []);

  // --- Logic 3: Categories & Products (Level 3 Only) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await themeApi.getCategories();
        if (!categoriesData || !Array.isArray(categoriesData)) return;

        const activeCategories = categoriesData.filter(cat => cat.is_active && cat.level === 3);
        setCategories(activeCategories);

        const productsData = {};
        for (const category of activeCategories) {
          try {
            const res = await themeApi.getProductsByCategory(category.id);
            const products = res.products || res || [];
            productsData[category.id] = Array.isArray(products) ? products.slice(0, 6) : [];
          } catch (e) { productsData[category.id] = []; }
        }
        setProductsByCategory(productsData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loader-container-v2">
      <div className="spinner-border text-orange" role="status"></div>
    </div>
  );

  return (
    <div className="theme-wrapper-v2">
      <header className="modern-header-v2">
        <div className="container">
          <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={(e) => {
              e.preventDefault();
              navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
            }}
          />
        </div>
      </header>

      {/* Hero Section */}
{/* Split Design Hero Section */}
      <section className="hero-v4">
        <div className="container">
          <div className="hero-wrapper-v4">
            <div className="row align-items-center g-0">
              
              {/* Left Side: Content */}
              <div className="col-lg-6">
                <div className="hero-content-v4">
                  <span className="hero-badge-v4">New Arrival 2026</span>
                  <h1 className="hero-title-v4">{heroSlides[currentSlide].title}</h1>
                  <p className="hero-desc-v4">{heroSlides[currentSlide].description}</p>
                  <div className="hero-btns-v4">
                    <Link to="/all-products" className="btn-orange-v4">Shop Now</Link>
                    <Link to="/all-products" className="btn-white-v4">View Catalog</Link>
                  </div>
                </div>
              </div>

              {/* Right Side: Product Image */}
              <div className="col-lg-6">
                <div className="hero-image-v4">
                  <img 
                    src={heroSlides[currentSlide].image} 
                    alt="Product" 
                    className="main-product-img" 
                  />
                  {/* Background decoration elements */}
                  <div className="blob-bg-v4"></div>
                </div>
              </div>

            </div>

            {/* Premium Slider Dots & Nav */}
            <div className="slider-controls-v4">
                <button className="nav-arrow-v4" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>❮</button>
                <div className="dots-v4">
                  {heroSlides.map((_, i) => (
                    <span key={i} className={i === currentSlide ? 'active' : ''} onClick={() => setCurrentSlide(i)}></span>
                  ))}
                </div>
                <button className="nav-arrow-v4" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}>❯</button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Products */}
      <section className="products-grid-v2 py-5">
        <div className="container">
          {categories.map((category) => (
            <div key={category.id} className="category-block-v2 mb-5">
              <div className="category-header-v2">
                <h2 className="cat-name-v2">{category.name}</h2>
                <Link to={`/category/${category.id}`} className="view-all-v2">View All Items</Link>
              </div>
              
              <div className="row g-3">
                {productsByCategory[category.id]?.map((product) => (
                  <div key={product.id} className="col-lg-3 col-md-4 col-6">
                    <div className="card-v2">
                      <div className="card-img-v2" onClick={() => navigate(`/product/${product.id}`)}>
                        <img src={product.images?.[0] || product.image_url || '/src/assets/images/tshirt-img.png'} alt={product.name} />
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
                        <button className="btn-add-v2" onClick={() => { addToCart(product); toast.success('Added to Cart!'); }}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-v2 py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 col-6 mb-3">
              <div className="feat-box-v2"><FaTruck className="icon" /> <h6>Free Shipping</h6><p>Orders over 10k</p></div>
            </div>
            <div className="col-md-4 col-6 mb-3">
              <div className="feat-box-v2"><FaShieldAlt className="icon" /> <h6>Secure Pay</h6><p>100% Protected</p></div>
            </div>
            <div className="col-md-4 col-12 mb-3">
              <div className="feat-box-v2"><FaHeadset className="icon" /> <h6>24/7 Support</h6><p>Help Anytime</p></div>
            </div>
          </div>
        </div>
      </section>

      <ThemeFooter />
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default ThemeHome;