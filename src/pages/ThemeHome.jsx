import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaHeadset, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import websiteSettingsApi from '../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import QuickViewModal from '../components/QuickViewModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import '../assets/css/theme-home-styles.css';
import '../assets/css/BuyNowButton.css';

const CAROUSEL_GAP_PX = 16;
const DESKTOP_CAROUSEL_MQ = '(min-width: 769px)';

function CategoryGenderSection({ title, items, navigate, className = 'gender-section mb-5' }) {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_CAROUSEL_MQ).matches
  );
  const viewportRef = useRef(null);
  const [stepPx, setStepPx] = useState(0);
  const [itemBasisPx, setItemBasisPx] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_CAROUSEL_MQ);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const maxIndex = Math.max(0, items.length - 3);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex, items.length]);

  useLayoutEffect(() => {
    if (!isDesktop || !viewportRef.current) return;
    const vp = viewportRef.current;
    const measure = () => {
      const w = vp.clientWidth;
      if (!w) return;
      const gap = CAROUSEL_GAP_PX;
      const basis = Math.max(0, Math.floor((w - 2 * gap) / 3));
      setItemBasisPx(basis);
      setStepPx(basis + gap);
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(vp);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [isDesktop, items.length]);

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((i) => Math.max(0, i - 1));
  };
  const goNext = (e) => {
    e.stopPropagation();
    setIndex((i) => Math.min(maxIndex, i + 1));
  };

  const scrollable = items.length > 3;

  const cardInner = (item) => (
    <>
      <div className="category-image-wrapper">
        <img src={item.image} alt={item.title} className="category-image" />
        <div className="category-overlay">
          <h3 className="category-title">{item.title}</h3>
          <button type="button" className="category-btn">Shop Now</button>
        </div>
      </div>
    </>
  );

  if (!items?.length) return null;

  return (
    <div className={className}>
      <h2 className="gender-title text-center mb-4">{title}</h2>
      {isDesktop ? (
        <div className="category-carousel-shell category-carousel-shell--arrows">
          {/* Viewport before arrows so track does not paint on top of controls */}
          <div className="category-carousel-viewport" ref={viewportRef}>
            <div
              className="category-carousel-track"
              style={{
                transform: stepPx ? `translateX(${-index * stepPx}px)` : undefined,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="category-carousel-item"
                  style={
                    itemBasisPx != null
                      ? { flex: `0 0 ${itemBasisPx}px`, minWidth: 0 }
                      : undefined
                  }
                >
                  <div
                    className="category-card"
                    onClick={() => navigate(item.link)}
                    role="presentation"
                  >
                    {cardInner(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="category-carousel-arrow prev"
            aria-label="Previous categories"
            disabled={!scrollable || index <= 0}
            onClick={goPrev}
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            className="category-carousel-arrow next"
            aria-label="Next categories"
            disabled={!scrollable || index >= maxIndex}
            onClick={goNext}
          >
            <FaChevronRight />
          </button>
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row g-4 category-mobile-stack">
            {items.map((item) => (
              <div key={item.id} className="col-12">
                <div className="category-card" onClick={() => navigate(item.link)}>
                  {cardInner(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ThemeHome = () => {   
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [websiteLogo, setWebsiteLogo] = useState('/src/assets/images/kidcolor(1).png');
  /** Theme home card images from website settings, index-aligned with categories.Boys / .Girls */
  const [categoryCardImages, setCategoryCardImages] = useState({ boys: [], girls: [] });
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

          if (settings.category_cards) {
            const boysLen = categories.Boys?.length || 0;
            const girlsLen = categories.Girls?.length || 0;
            const boysUrls = [];
            for (let i = 1; i <= boysLen; i++) {
              const row = settings.category_cards.find((s) => s.key === `boys_category_${i}_image`);
              boysUrls.push(row?.value || null);
            }
            const girlsUrls = [];
            for (let i = 1; i <= girlsLen; i++) {
              const row = settings.category_cards.find((s) => s.key === `girls_category_${i}_image`);
              girlsUrls.push(row?.value || null);
            }
            setCategoryCardImages({ boys: boysUrls, girls: girlsUrls });
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
        
        // Get Level 3 categories and group by parent (same sort order as admin)
        const level3Categories = categoriesData
          .filter(cat => cat.is_active && cat.level === 3)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
        
        // Group Level 3 categories by their Level 2 parent
        const groupedCategories = {};
        level2Categories.forEach(parent => {
          const groupName = parent.name.toLowerCase(); // Normalize to lowercase
          
          // Only process "boys" and "girls" categories
          if (groupName === 'boys' || groupName === 'girls') {
            // Capitalize first letter for consistent display
            const displayName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
            
            groupedCategories[displayName] = level3Categories.filter(
              (cat) => cat.parent_id === parent.id
            );
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

  const boysItems = useMemo(() => {
    const apiList = categories.Boys || [];
    const urls = categoryCardImages.boys;
    if (apiList.length > 0) {
      return apiList.map((category, i) => ({
        id: `cat-${category.id}`,
        title: category.name,
        image: urls[i] || category.image_url || '/src/assets/images/tshirt-img.png',
        link: `/category/${category.id}`,
      }));
    }
    return urls
      .map((img, i) =>
        img
          ? {
              id: `boys-${i}`,
              title: `Category ${i + 1}`,
              image: img,
              link: '/all-products',
            }
          : null
      )
      .filter(Boolean);
  }, [categoryCardImages.boys, categories.Boys]);

  const girlsItems = useMemo(() => {
    const apiList = categories.Girls || [];
    const urls = categoryCardImages.girls;
    if (apiList.length > 0) {
      return apiList.map((category, i) => ({
        id: `cat-${category.id}`,
        title: category.name,
        image: urls[i] || category.image_url || '/src/assets/images/tshirt-img.png',
        link: `/category/${category.id}`,
      }));
    }
    return urls
      .map((img, i) =>
        img
          ? {
              id: `girls-${i}`,
              title: `Category ${i + 1}`,
              image: img,
              link: '/all-products',
            }
          : null
      )
      .filter(Boolean);
  }, [categoryCardImages.girls, categories.Girls]);

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
          {boysItems.length > 0 && (
            <CategoryGenderSection title="BOYS" items={boysItems} navigate={navigate} />
          )}

          {girlsItems.length > 0 && (
            <CategoryGenderSection title="GIRLS" items={girlsItems} navigate={navigate} className="gender-section" />
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