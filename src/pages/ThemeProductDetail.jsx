import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars , FaStar, FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch} from 'react-icons/fa';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, ArrowRight } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import websiteSettingsApi from '../services/websiteSettingsApi';
import './ThemeProductDetail.css';
import '../assets/css/BuyNowButton.css';

const ThemeProductDetail = () => {
  const { id } = useParams();
  const { addToCart, getCartItemsCount, clearCart } = useCart();
  const { websiteLogo } = useLogo();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizes, setSizes] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: '',
    comment: '',
    review_images: []
  });
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('shirt');
  const [sizeData, setSizeData] = useState({
    shirt: [],
    tshirt: [],
    pants: []
  });

  useEffect(() => {
    fetchProduct();
    fetchSizes();
    fetchSizeGuides();
  }, [id]);

  const fetchSizes = async () => {
    try {
      const sizesData = await themeApi.getSizes();
      console.log('Fetched sizes:', sizesData);
      setSizes(sizesData);
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
    }
  };

  const fetchSizeGuides = async () => {
    const parseGuide = (value) => {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    };

    try {
      const [casualShirtRes, tshirtRes, pantsRes] = await Promise.all([
        websiteSettingsApi.getSettingByKey('size_guide_casual_shirt'),
        websiteSettingsApi.getSettingByKey('size_guide_tshirt'),
        websiteSettingsApi.getSettingByKey('size_guide_pants')
      ]);

      setSizeData({
        shirt: parseGuide(casualShirtRes?.data?.value),
        tshirt: parseGuide(tshirtRes?.data?.value),
        pants: parseGuide(pantsRes?.data?.value)
      });
    } catch (error) {
      setSizeData({
        shirt: [],
        tshirt: [],
        pants: []
      });
    }
  };

  // Initialize with dummy reviews if no reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        console.log('Fetching reviews for product:', id);
        const reviewsData = await themeApi.getProductReviews(id);
        console.log('Reviews from API:', reviewsData);
        
        // Check if we got valid reviews data
        if (reviewsData && reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
          console.log('Setting reviews from API:', reviewsData.reviews.length, 'reviews');
          setReviews(reviewsData.reviews);
        } else {
          console.log('Invalid reviews data from API, setting empty reviews');
          setReviews([]);
        }
      } catch (error) {
        console.log('Reviews endpoint not available, setting empty reviews');
        console.log('Error details:', error.message);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Fetch stock data for the product
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        console.log('Fetching stock data for product:', id);
        const stockResponse = await themeApi.getAllProductStock(id);
        console.log('Stock data:', stockResponse);
        
        if (stockResponse && stockResponse.data) {
          setStockData(stockResponse.data);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // If stock API fails, continue with empty stock data
        setStockData([]);
      }
    };

    if (id) {
      fetchStockData();
    }
  }, [id]);

  // Function to get stock for selected size from stock table
  const getStockForSize = (sizeName) => {
    if (!stockData || stockData.length === 0) {
      return 0;
    }
    
    // Find stock entry for this size
    const stockEntry = stockData.find(stock => {
      // Match size by name (assuming size object has size.name property)
      return stock.size && stock.size.size === sizeName;
    });
    
    return stockEntry ? stockEntry.quantity : 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reviewData = {
        product_id: parseInt(id),
        customer_name: reviewForm.name,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
        email: null, // Optional field
        review_images: reviewForm.review_images
      };

      const response = await themeApi.createReview(reviewData);
      console.log('Review submitted:', response);
      
      // Refresh reviews after submission
      const reviewsData = await themeApi.getProductReviews(id);
      setReviews(Array.isArray(reviewsData.reviews) ? reviewsData.reviews : []);
      
      setReviewForm({ name: '', rating: '', comment: '', review_images: [] });
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setReviewForm(prev => ({
      ...prev,
      review_images: [...prev.review_images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setReviewForm(prev => ({
      ...prev,
      review_images: prev.review_images.filter((_, i) => i !== index)
    }));
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await themeApi.getProductById(id);
      setProduct(productData);
      
      // Fetch related products from same category (max 3)
      const relatedData = await themeApi.getProductsByCategory(productData.category_id || productData.category?.id || '1');
      console.log('Related data from API:', relatedData);
      console.log('Product sizes:', productData.sizes);
      
      // Handle different response structures
      let productsArray = [];
      if (Array.isArray(relatedData)) {
        productsArray = relatedData;
      } else if (relatedData?.products && Array.isArray(relatedData.products)) {
        productsArray = relatedData.products;
      } else if (relatedData?.data && Array.isArray(relatedData.data)) {
        productsArray = relatedData.data;
      }
      
      const relatedProducts = productsArray.filter(p => p.id !== parseInt(id)).slice(0, 3);
      console.log('Filtered related products:', relatedProducts);
      setRelatedProducts(relatedProducts);
      
    } catch (error) {
      toast.error('Failed to load product');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleAddToCart = async () => {
    console.log('handleAddToCart called');
    console.log('selectedSize:', selectedSize);
    
    // Simple validation: Always require size selection
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    try {
      await addToCart(product, 1, selectedSize);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    console.log('handleBuyNow called');
    console.log('selectedSize:', selectedSize);
    
    // Simple validation: Always require size selection
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    try {
      // Clear existing cart and add this product
      clearCart();
      await addToCart(product, 1, selectedSize);
      navigate('/checkout');
    } catch (error) {
      console.error('Error with buy now:', error);
      toast.error('Failed to proceed to checkout');
    }
    toast.success(`${product.name} (Size: ${selectedSize}) added to cart!`);
  };

  const handleAddToWishlist = async () => {
    try {
      await themeApi.addToWishlist(id);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <div className="spinner-border text-orange" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h2>Product not found</h2>
          <Link to="/" className="btn" style={{ backgroundColor: '#f26522', color: 'white' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          {/* Top Bar */}
          <TopBar 
           onMenuToggle={() => setSideDrawerOpen(true)}
          />
        </div>
      </header>

  
      {/* Product Detail Section */}
      <div className="product_section layout_padding">
        <div className="container">
          <div className="row">
            {/* Product Images */}
            <div className="col-lg-6 col-md-6">
              <div className="product_img_section">
                <div className="main_img">
                  <img 
                    src={
                      product.images && product.images.length > 0 
                        ? product.images[selectedImage] 
                        : product.image_url || product.image || '/src/assets/images/tshirt-img.png'
                    } 
                    alt={product.name} 
                    style={{ 
                      width: '100%',
                      height: '400px',
                      objectFit: 'contain',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div className="thumbnail_img">
                  {(product.images && product.images.length > 0 
                    ? product.images 
                    : [product.image_url || product.image || '/src/assets/images/tshirt-img.png']
                  ).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                      style={{ 
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid #f26522' : '1px solid #ddd',
                        margin: '0 5px 5px 0'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-6 col-md-6">
              <div className="product_info_section">
                <h1 className="product_name" style={{ color: '#262626', fontSize: '32px', fontWeight: 'bold' }}>
                  {product.name}
                </h1>
                
                <div className="rating_section mb-3">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-warning fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="rating_count ml-2">({reviews.length} Reviews) • {averageRating > 0 ? `${averageRating} ★` : 'No Rating'}</span>
                </div>

<div className="product-price-container d-flex align-items-baseline flex-wrap gap-3">
  {product.discount_price ? (
    <>
      <div className="price-main-wrapper">
        <span className="price-currency">Rs.</span>
        <span className="price-amount">
          {Number(product.discount_price).toLocaleString(undefined, {minimumFractionDigits: 2})}
        </span>
      </div>
      
      <span className="price-strike-original">
        Rs. {Number(product.price).toLocaleString(undefined, {minimumFractionDigits: 2})}
      </span>

      <span className="price-discount-pill">
        -{Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
      </span>
    </>
  ) : (
    <div className="price-main-wrapper">
      <span className="price-currency">Rs.</span>
      <span className="price-amount">
        {Number(product.price).toLocaleString(undefined, {minimumFractionDigits: 2})}
      </span>
    </div>
  )}
</div>
                {product.sku && (
                  <div className="sku_section mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <h4 style={{ color: '#262626', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      <span style={{ color: '#f26522' }}>SKU:</span> {product.sku}
                    </h4>
                  
                  </div>
                )}

                <div className="description_section mb-4">
                  <h4 style={{ color: '#262626' }}>Description</h4>
                  <p style={{ color: '#666' }}>{product.description}</p>
                </div>

                

                {/* Size Selection */}
                {console.log('Rendering size section, product.sizes:', product?.sizes)}
                {product && (
                  <div className="size_section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 style={{ color: '#262626', marginBottom: '0', fontWeight: '600' }}>
                        <i className="fas fa-ruler me-2" style={{ color: '#f26522' }}></i>
                        Select Size
                      </h4>
{/* Size Guide Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="size-guide-btn flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all duration-300"
        style={{
          borderColor: '#f26522',
          color: '#f26522',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f26522';
          e.currentTarget.style.color = 'white';
          const icon = e.currentTarget.querySelector('i');
          const text = e.currentTarget.querySelector('span');
          if (icon) icon.style.color = 'white';
          if (text) text.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#f26522';
          const icon = e.currentTarget.querySelector('i');
          const text = e.currentTarget.querySelector('span');
          if (icon) icon.style.color = '#f26522';
          if (text) text.style.color = '#f26522';
        }}
      >
        <i className="fas fa-ruler-combined" style={{ color: '#f26522', transition: 'color 0.3s' }}></i>
        <span style={{ color: '#f26522', transition: 'color 0.3s' }}>Size Guide</span>
      </button>

      {/* Tailwind Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px'
          }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              margin: '0 auto',
              position: 'relative',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Size Chart</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="p-4" style={{ overflowY: 'auto' }}>
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                {['shirt', 'tshirt', 'pants'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                      activeTab === tab ? 'bg-white text-[#f26522] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {tab === 'tshirt' ? 'T-Shirt' : tab}
                  </button>
                ))}
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto max-h-[400px] border border-gray-100 rounded-xl">
                <table className="w-full text-center text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-600 uppercase text-[10px] tracking-wider font-black">
                      <th className="py-3 px-4 border-b">Age</th>
                      <th className="py-3 px-4 border-b">Chest (in)</th>
                      {activeTab !== 'pants' && <th className="py-3 px-4 border-b">Length (in)</th>}
                      {activeTab === 'pants' && <th className="py-3 px-4 border-b">Length (in)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sizeData[activeTab].length > 0 ? (
                      sizeData[activeTab].map((row, idx) => (
                        <tr key={idx} className="hover:bg-orange-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-700">{row[0]}</td>
                          <td className="py-3 px-4 text-gray-500">{row[1]}</td>
                          {row[2] && <td className="py-3 px-4 text-gray-500">{row[2]}</td>}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="py-6 px-4 text-center text-gray-500"
                          colSpan={3}
                        >
                          Size guide will be added separately.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-[11px] text-gray-400 text-center italic leading-relaxed">
                * All measurements are in inches. Slight variations may occur.
              </p>
            </div>
          </div>
        </div>
      )}
                    </div>
                    <div className="size_controls d-flex flex-wrap gap-2" style={{ marginBottom: '10px' }}>
                      {/* If sizes exist, show them - sorted by sort_order */}
                      {product.sizes && product.sizes.length > 0 ? (
                        [...product.sizes]
                          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                          .map((sizeItem, index) => {
                            console.log('Rendering size button:', sizeItem);
                            return (
                              <button
                                key={index}
                                className={`btn ${selectedSize === sizeItem.size ? 'btn-primary' : 'btn-outline-secondary'} position-relative`}
                                onClick={() => {
                                  console.log('Size clicked:', sizeItem.size);
                                  setSelectedSize(sizeItem.size);
                                  setQuantity(Math.max(1, sizeItem.quantity > 0 ? sizeItem.quantity : quantity));
                                }}
                                style={{
                                  backgroundColor: selectedSize === sizeItem.size ? '#f26522' : 'transparent',
                                  borderColor: '#f26522',
                                  color: selectedSize === sizeItem.size ? 'white' : '#f26522',
                                  minWidth: '120px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  transition: 'all 0.3s ease',
                                  border: '2px solid #f26522',
                                  position: 'relative'
                                }}
                              >
                                {typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size)}
                              </button>
                            );
                          })
                      ) : (
                        /* If no sizes but has stock, show default size options from fetched sizes - already sorted by API */
                        sizes.map((sizeItem) => (
                          <button
                            key={sizeItem.id}
                            className={`btn ${selectedSize === sizeItem.size ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => {
                              console.log('Default size clicked:', sizeItem.size);
                              setSelectedSize(sizeItem.size);
                              setQuantity(1);
                            }}
                            style={{
                              backgroundColor: selectedSize === sizeItem.size ? '#f26522' : 'transparent',
                              borderColor: '#f26522',
                              color: selectedSize === sizeItem.size ? 'white' : '#f26522',
                              minWidth: '120px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              border: '2px solid #f26522'
                            }}
                          >
                            {typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size)}
                          </button>
                        ))
                      )}
                    </div>
                    {selectedSize && (
                      <div className="selected-size-info mt-3 p-3" style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}>
                        <i className="fas fa-check-circle me-2" style={{ color: '#28a745' }}></i>
                        <strong>Selected:</strong> {selectedSize} 
                        <span className="ms-2 text-muted">
                          ({getStockForSize(selectedSize)} available)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="quantity_section mb-4">
                  <h4 style={{ color: '#262626' }}>Quantity</h4>
                  <div className="quantity_controls d-flex align-items-center">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-control mx-2"
                      style={{ width: '60px', textAlign: 'center' }}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action_buttons mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-lg mr-3"
                    style={{ backgroundColor: '#f26522', color: 'white' }}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-lg"
                    style={{ backgroundColor: '#000000', color: 'white' }}
                    onClick={handleBuyNow}
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Buy Now
                  </motion.button>
                </div>

                {/* <div className="trust_badges">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-center">
                        <Truck className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                        <span className='d-block'>Shipping Fee Rs 250</span>
                         <span className="d-block">Free Shipping on Orders over Rs 10,000</span> 
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <Shield className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                        <span className="d-block">Quality Assured</span>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      {/* <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center mb-4" style={{ color: '#262626', fontSize: '2rem', fontWeight: 'bold' }}>
              Customer Reviews
            </h2> */}
            
            {/* Review Form */}
            {/* <div className="card mb-4">
              <div className="card-header" style={{ backgroundColor: '#f26522', color: 'white' }}>
                <h5 className="mb-0">Write a Review</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleReviewSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rating</label>
                      <select
                        className="form-control"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                        required
                      >
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Very Good</option>
                        <option value="3">3 Stars - Good</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="1">1 Star - Poor</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Share your experience with this product..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                      required
                    ></textarea>
                  </div> */}
                  
                  {/* Image Upload Section */}
                  {/* <div className="mb-3">
                    <label className="form-label">Upload Images (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <small className="text-muted">You can upload multiple images</small>
                  </div> */}

                  {/* Image Preview */}
                  {/* {reviewForm.review_images.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Image Preview</label>
                      <div className="row">
                        {reviewForm.review_images.map((image, index) => (
                          <div key={index} className="col-md-3 col-sm-4 col-6 mb-2">
                            <div className="position-relative">
                              <img
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="img-fluid rounded"
                                style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                onClick={() => removeImage(index)}
                                style={{ fontSize: '12px', padding: '2px 6px' }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn" style={{ backgroundColor: '#f26522', color: 'white' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            </div> */}

            {/* Existing Reviews */}
            {/* <div className="reviews-container">
              {reviewsLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading reviews...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading reviews...</p>
                </div>
              )}
                            
              {!reviewsLoading && Array.isArray(reviews) && reviews.map((review, index) => (
                <div key={review.id} className="review-card mb-4">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        <span className="avatar-text">
                          {review.customer_name ? review.customer_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="reviewer-details">
                        <h6 className="reviewer-name mb-0">{review.customer_name}</h6>
                        <small className="review-date">
                          <i className="far fa-calendar-alt me-1"></i>
                          {new Date(review.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </small>
                      </div>
                    </div>
                    <div className="review-rating">
                      <div className="stars-container">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`star ${i < review.rating ? 'star-filled' : 'star-empty'}`} />
                        ))}
                      </div>
                      <span className="rating-text">{review.rating}.0</span>
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <p className="review-comment">{review.comment}</p> */}
                    
                    {/* Review Images */}
                    {/* {review.review_images && review.review_images.length > 0 && (
                      <div className="review-images-section">
                        <div className="images-grid">
                          {review.review_images.map((image, imgIndex) => (
                            <div key={imgIndex} className="review-image-item">
                              <img
                                src={image}
                                alt={`Review image ${imgIndex + 1}`}
                                className="review-image"
                                onError={(e) => {
                                  console.log('Image failed to load:', image);
                                  e.target.src = '/src/assets/images/tshirt-img.png'; // Fallback image
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', image);
                                }}
                                onClick={() => {
                                  // Create modal-like view for image
                                  const modal = document.createElement('div');
                                  modal.className = 'image-modal';
                                  modal.innerHTML = `
                                    <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
                                    <div class="modal-content">
                                      <img src="${image}" alt="Review image" />
                                      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
                                    </div>
                                  `;
                                  modal.style.cssText = `
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 100%;
                                    z-index: 9999;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                  `;
                                  document.body.appendChild(modal);
                                }}
                              />
                              <div className="image-overlay">
                                <i className="fas fa-search-plus"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="review-footer">
                    <div className="review-actions">
                      <button className="action-btn helpful-btn">
                        <i className="far fa-thumbs-up me-1"></i>
                        Helpful
                      </button>
                      <button className="action-btn report-btn">
                        <i className="far fa-flag me-1"></i>
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!reviewsLoading && (!Array.isArray(reviews) || reviews.length === 0) && (
                <div className="empty-reviews text-center py-5">
                  <div className="empty-icon mb-3">
                    <i className="far fa-comment-dots" style={{ fontSize: '48px', color: '#ddd' }}></i>
                  </div>
                  <h5 className="text-muted mb-2">No Reviews Yet</h5>
                  <p className="text-muted">Be the first to share your experience with this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}

      {/* Related Products */}
      <section className="products-section py-5">
        <div className="container">
          <div className="category-section mb-5">
            <div className="category-header d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">
                Related {product?.category_relation?.name || 'Products'}
              </h2>
              <Link 
                to={`/category/${product?.category_id || product?.category?.id || '1'}`}
                className="btn btn-outline-primary"
              >
                View All
              </Link>
            </div>
            
            <div className="row">
              {relatedProducts.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No related products found in this category.</p>
                </div>
              ) : (
                relatedProducts.map((relatedProduct) => (
                  <div className="col-lg-4 col-md-6 col-6 mb-4" key={relatedProduct.id}>
                    <div className="card-v2">
                      <div className="card-img-v2" onClick={() => window.location.href = `/product/${relatedProduct.id}`}>
                        <img
                          src={
                            relatedProduct.images && relatedProduct.images.length > 0 
                              ? relatedProduct.images[0] 
                              : relatedProduct.image_url || relatedProduct.image || '/src/assets/images/tshirt-img.png'
                          }
                          alt={relatedProduct.name}
                        />
                        {relatedProduct.discount_price && (
                          <div className="discount-tag">-{Math.round(((relatedProduct.price - relatedProduct.discount_price) / relatedProduct.price) * 100)}%</div>
                        )}
                      </div>
                      <div className="card-body-v2">
                        <h5 className="card-title-v2">{relatedProduct.name}</h5>
                        <div className="card-price-v2">
                          <span className="price-now">Rs. {Math.round(relatedProduct.discount_price || relatedProduct.price)}</span>
                          {relatedProduct.discount_price && <span className="price-old">Rs. {Math.round(relatedProduct.price)}</span>}
                        </div>
                        <button 
                          className="btn-add-v2"
                          onClick={() => {
                            if (relatedProduct.product_type === 'single' && relatedProduct.sizes && relatedProduct.sizes.length > 0) {
                              toast.error('Please select a size from product details before adding to cart');
                              return;
                            }
                            addToCart(relatedProduct, 1);
                            toast.success(`${relatedProduct.name} added to Cart!`);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

     
      <ThemeFooter />

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default ThemeProductDetail;
