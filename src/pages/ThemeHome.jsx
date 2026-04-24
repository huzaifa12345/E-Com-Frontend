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
import QuickViewModal from '../components/QuickViewModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import '../assets/css/theme-home-styles.css';
import '../assets/css/BuyNowButton.css';

const ThemeHome = () => {   
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [websiteLogo, setWebsiteLogo] = useState('/src/assets/images/kidcolor(1).png');
  const [dynamicCategoryCards, setDynamicCategoryCards] = useState({
    boys: [],
    girls: []
  });
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

          // Fetch dynamic category cards
          if (settings.category_cards) {
            const boysCards = [];
            const girlsCards = [];
            
            for (let i = 1; i <= 6; i++) {
              // Boys category cards
              const boysImg = settings.category_cards.find(s => s.key === `boys_category_${i}_image`);
              
              if (boysImg?.value) {
                // Get corresponding original category for title and link
                const originalCategory = categories['Boys']?.[i - 1];
                boysCards.push({
                  id: `boys_${i}`,
                  title: originalCategory?.name || `Category ${i}`,
                  image: boysImg.value,
                  link: originalCategory ? `/category/${originalCategory.id}` : `/all-products`
                });
              }
              
              // Girls category cards
              const girlsImg = settings.category_cards.find(s => s.key === `girls_category_${i}_image`);
              
              if (girlsImg?.value) {
                // Get corresponding original category for title and link
                const originalCategory = categories['Girls']?.[i - 1];
                girlsCards.push({
                  id: `girls_${i}`,
                  title: originalCategory?.name || `Category ${i}`,
                  image: girlsImg.value,
                  link: originalCategory ? `/category/${originalCategory.id}` : `/all-products`
                });
              }
            }
            
            setDynamicCategoryCards({ boys: boysCards, girls: girlsCards });
          }
        }
      } catch (error) { console.error('Settings error:', error); }
    };
    fetchWebsiteSettings();
  }, [categories]); // Re-fetch when categories change

  // --- Logic 3: Categories (Level 3 grouped by Level 2) ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await themeApi.getCategories();
        if (!categoriesData || !Array.isArray(categoriesData)) return;

        // Get Level 2 parent categories (Boys, Girls)
        const level2Categories = categoriesData.filter(cat => cat.is_active && cat.level === 2);
        
        // Get Level 3 categories and group by parent
        const level3Categories = categoriesData.filter(cat => cat.is_active && cat.level === 3);
        
        // Group Level 3 categories by their Level 2 parent
        const groupedCategories = {};
        level2Categories.forEach(parent => {
          const groupName = parent.name.toLowerCase(); // Normalize to lowercase
          
          // Only process "boys" and "girls" categories
          if (groupName === 'boys' || groupName === 'girls') {
            // Capitalize first letter for consistent display
            const displayName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
            
            groupedCategories[displayName] = level3Categories
              .filter(cat => cat.parent_id === parent.id)
              .slice(0, 6); // Take up to 6 per gender for more options
          }
        });
        
        setCategories(groupedCategories);
      } catch (error) {
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
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

      {/* Hero Section - Simple Slider */}
      <section className="hero-v4-simple">
        <div className="slider-container">
          <img 
            key={currentSlide}
            src={heroSlides[currentSlide].image} 
            alt="Slider" 
            className="slider-img" 
          />
          
          {/* Slider Controls */}
          {/* <div className="slider-controls-simple">
            <button className="nav-arrow-simple" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>❮</button>
            <div className="dots-simple">
              {heroSlides.map((_, i) => (
                <span key={i} className={i === currentSlide ? 'active' : ''} onClick={() => setCurrentSlide(i)}></span>
              ))}
            </div>
            <button className="nav-arrow-simple" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}>❯</button>
          </div> */}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-grid py-5">
        <div className="container-fluid">
          {/* Boys Section */}
          {(dynamicCategoryCards.boys.length > 0 || categories['Boys']) && (
            <div className="gender-section mb-5">
              <h2 className="gender-title text-center mb-4">BOYS</h2>
              <div className="row g-4">
                {/* Show dynamic cards first if available */}
                {dynamicCategoryCards.boys.length > 0 ? (
                  dynamicCategoryCards.boys.map((card) => (
                    <div key={card.id} className="col-lg-4 col-md-6">
                      <div className="category-card" onClick={() => navigate(card.link)}>
                        <div className="category-image-wrapper">
                          <img 
                            src={card.image} 
                            alt={card.title} 
                            className="category-image"
                          />
                          <div className="category-overlay">
                            <h3 className="category-title">{card.title}</h3>
                            <button className="category-btn">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to original categories
                  categories['Boys']?.map((category) => (
                    <div key={category.id} className="col-lg-4 col-md-6">
                      <div className="category-card" onClick={() => navigate(`/category/${category.id}`)}>
                        <div className="category-image-wrapper">
                          <img 
                            src={category.image_url || '/src/assets/images/tshirt-img.png'} 
                            alt={category.name} 
                            className="category-image"
                          />
                          <div className="category-overlay">
                            <h3 className="category-title">{category.name}</h3>
                            <button className="category-btn">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Girls Section */}
          {(dynamicCategoryCards.girls.length > 0 || categories['Girls']) && (
            <div className="gender-section">
              <h2 className="gender-title text-center mb-4">GIRLS</h2>
              <div className="row g-4">
                {/* Show dynamic cards first if available */}
                {dynamicCategoryCards.girls.length > 0 ? (
                  dynamicCategoryCards.girls.map((card) => (
                    <div key={card.id} className="col-lg-4 col-md-6">
                      <div className="category-card" onClick={() => navigate(card.link)}>
                        <div className="category-image-wrapper">
                          <img 
                            src={card.image} 
                            alt={card.title} 
                            className="category-image"
                          />
                          <div className="category-overlay">
                            <h3 className="category-title">{card.title}</h3>
                            <button className="category-btn">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to original categories
                  categories['Girls']?.map((category) => (
                    <div key={category.id} className="col-lg-4 col-md-6">
                      <div className="category-card" onClick={() => navigate(`/category/${category.id}`)}>
                        <div className="category-image-wrapper">
                          <img 
                            src={category.image_url || '/src/assets/images/tshirt-img.png'} 
                            alt={category.name} 
                            className="category-image"
                          />
                          <div className="category-overlay">
                            <h3 className="category-title">{category.name}</h3>
                            <button className="category-btn">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features-v2 py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 col-6 mb-3">
              <div className="feat-box-v2"><FaTruck className="icon" /> <h6>Free Shipping</h6><p>Orders over 5k</p></div>
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
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default ThemeHome;