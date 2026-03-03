import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars , FaStar, FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch} from 'react-icons/fa';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';

const ThemeProductDetail = () => {
  const { id } = useParams();
  const { addToCart, getCartItemsCount } = useCart();
  const { websiteLogo } = useLogo();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizes, setSizes] = useState([]);
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

  useEffect(() => {
    fetchProduct();
    fetchSizes();
  }, [id]);

  const fetchSizes = async () => {
    try {
      const sizesData = await themeApi.getSizes();
      console.log('Fetched sizes:', sizesData);
      setSizes(sizesData);
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
      // Set default sizes if API fails
      setSizes([
        { id: 1, size: '9-12 months', description: 'Suitable for kids aged 9-12 months (6-9 kg)' },
        { id: 2, size: '12-18 months', description: 'Suitable for kids aged 12-18 months (9-11 kg)' },
        { id: 3, size: '18-24 months', description: 'Suitable for kids aged 18-24 months (11-12 kg)' },
        { id: 4, size: '2-3 years', description: 'Suitable for kids aged 2-3 years (12-14 kg)' },
        { id: 5, size: '3-4 years', description: 'Suitable for kids aged 3-4 years (14-16 kg)' },
        { id: 6, size: '4-5 years', description: 'Suitable for kids aged 4-5 years (16-18 kg)' },
        { id: 7, size: '5-6 years', description: 'Suitable for kids aged 5-6 years (18-20 kg)' },
        { id: 8, size: '6-7 years', description: 'Suitable for kids aged 6-7 years (20-22 kg)' },
        { id: 9, size: '7-8 years', description: 'Suitable for kids aged 7-8 years (22-25 kg)' },
        { id: 10, size: '9-10 years', description: 'Suitable for kids aged 9-10 years (25-28 kg)' }
      ]);
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

  const handleAddToCart = () => {
    console.log('handleAddToCart called');
    console.log('selectedSize:', selectedSize);
    
    // Simple validation: Always require size selection
    if (!selectedSize || selectedSize === '') {
      console.log('No size selected - showing error');
      toast.error('Please select a size before adding to cart');
      return;
    }

    console.log('Size selected - adding to cart');
    // Add selected size to the product object
    const productWithSize = {
      ...product,
      selectedSize: selectedSize
    };
    addToCart(productWithSize, quantity);
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
          <div className="top-bar">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="contact-info">
                  <span><FaHeadset /> +1 800-123-4567</span>
                  {' '}
                  <span className="ms-3"><FaTruck /> Free Shipping on orders over Rs 2000</span>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <div className="social-links">
                  <Link to="/cart" className="text-white position-relative">
                    <FaShoppingCart />
                    {getCartItemsCount() > 0 && (
                      <span className="cart-badge">{getCartItemsCount()}</span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <div className="row align-items-center">
              <div className="col-md-3">
                <div className="logo">
                  <Link to="/">
                    <img src={websiteLogo} alt="Kids Colours" className="img-fluid" style={{ maxWidth: '200px', minHeight: '80px' }} />
                  </Link>
                </div>
              </div>
              <div className="col-md-6">
                <div className="search-bar">
                  <form className="d-flex">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                    />
                    <button type="submit" className="btn btn-search">
                      <FaSearch />
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-md-3 text-end">
                <button
                  className="btn btn-outline-light menu-toggle"
                  onClick={() => setSideDrawerOpen(true)}
                >
                  <FaBars />
                </button>
              </div>
            </div>
          </nav>

          {/* Custom Menu */}
          <div className="custom_menu">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
            </ul>
          </div>
        </div>
      </header>

      {/* <div className="logo_section">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="logo">
                <Link to="/">
                  <img src={websiteLogo} alt="Kids Colours Logo" style={{ width: '120px', height: 'auto' }} />
                </Link>
                <button 
                  className="ml-3 btn btn-outline-secondary"
                  onClick={() => setSideDrawerOpen(true)}
                >
                  <FaBars size={20} color="#f26522" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

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
                        className={`w-5 h-5 ${i < 4 ? 'text-warning fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="rating_count ml-2">({reviews.length} Reviews)</span>
                </div>

                <div className="price_section mb-4">
                  <span className="current_price" style={{ fontSize: '28px', color: '#f26522', fontWeight: 'bold' }}>
                    {product.price}
                  </span>
                </div>

                {product.sku && (
                  <div className="sku_section mb-4">
                    <h4 style={{ color: '#262626', fontSize: '14px', fontWeight: 'normal' }}>SKU</h4>
                    <p style={{ color: '#666', fontFamily: 'monospace' }}>{product.sku}</p>
                  </div>
                )}

                <div className="description_section mb-4">
                  <h4 style={{ color: '#262626' }}>Description</h4>
                  <p style={{ color: '#666' }}>{product.description}</p>
                </div>

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

                {/* Size Selection */}
                {console.log('Rendering size section, product.sizes:', product?.sizes)}
                {product && (
                  <div className="size_section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 style={{ color: '#262626', marginBottom: '0', fontWeight: '600' }}>
                        <i className="fas fa-ruler me-2" style={{ color: '#f26522' }}></i>
                        Select Size
                      </h4>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          alert('Size Guide:\n\n9-12 months: 6-9 kg\n12-18 months: 9-11 kg\n18-24 months: 11-12 kg\n2-3 years: 12-14 kg\n3-4 years: 14-16 kg\n4-5 years: 16-18 kg\n5-6 years: 18-20 kg\n6-7 years: 20-22 kg\n7-8 years: 22-25 kg\n9-10 years: 25-28 kg\n\nFor accurate sizing, please measure your child and refer to the weight guide above.');
                        }}
                        style={{ 
                          fontSize: '12px',
                          borderColor: '#f26522',
                          color: '#f26522'
                        }}
                      >
                        <i className="fas fa-question-circle me-1"></i>
                        Size Guide
                      </button>
                    </div>
                    <div className="size_controls d-flex flex-wrap gap-2" style={{ marginBottom: '10px' }}>
                      {/* If sizes exist, show them */}
                      {product.sizes && product.sizes.length > 0 ? (
                        product.sizes.map((sizeItem, index) => {
                          console.log('Rendering size button:', sizeItem);
                          // Remove stock check - allow size selection regardless of stock
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
                              <span className="ms-2 badge" style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '12px'
                              }}>
                                {sizeItem.quantity}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        /* If no sizes but has stock, show default size options from fetched sizes */
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
                          ({product.sizes?.find(s => s.size === selectedSize)?.quantity || product.stock_quantity || 0} available)
                        </span>
                      </div>
                    )}
                  </div>
                )}

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
                    className="btn btn-outline-secondary"
                    onClick={handleAddToWishlist}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Wishlist
                  </motion.button>
                </div>

                <div className="trust_badges">
                  <div className="row">
                    <div className="col-4">
                      <div className="text-center">
                        <Truck className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                        <span className="d-block">Free Shipping</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <Shield className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                        <span className="d-block">Secure Payment</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 mb-2" style={{ color: '#f26522' }} />
                        <span className="d-block">30-Day Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center mb-4" style={{ color: '#262626', fontSize: '2rem', fontWeight: 'bold' }}>
              Customer Reviews
            </h2>
            
            {/* Review Form */}
            <div className="card mb-4">
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
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="mb-3">
                    <label className="form-label">Upload Images (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <small className="text-muted">You can upload multiple images</small>
                  </div>

                  {/* Image Preview */}
                  {reviewForm.review_images.length > 0 && (
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
            </div>

            {/* Existing Reviews */}
            <div className="reviews-container">
              {/* Loading State */}
              {reviewsLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading reviews...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading reviews...</p>
                </div>
              )}
              
              {/* Debug Info - Remove in production
              {!reviewsLoading && process.env.NODE_ENV === 'development' && (
                <div className="alert alert-info mb-3">
                  <small>
                    <strong>Debug:</strong> Reviews count: {Array.isArray(reviews) ? reviews.length : 0}
                    {Array.isArray(reviews) && reviews.length > 0 && (
                      <span>, First review has images: {reviews[0].review_images ? reviews[0].review_images.length : 0}</span>
                    )}
                  </small>
                </div>
              )} */}
              
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
                    <p className="review-comment">{review.comment}</p>
                    
                    {/* Review Images */}
                    {review.review_images && review.review_images.length > 0 && (
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
      </div>

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
                  <div className="col-lg-4 col-md-6 mb-4" key={relatedProduct.id}>
                    <div className="product-card">
                      <div className="product-image">
                        <img
                          src={
                            relatedProduct.images && relatedProduct.images.length > 0 
                              ? relatedProduct.images[0] 
                              : relatedProduct.image_url || relatedProduct.image || '/src/assets/images/tshirt-img.png'
                          }
                          alt={relatedProduct.name}
                        />
                        <div className="product-overlay">
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              // Check if product is single size and has sizes
                              if (relatedProduct.product_type === 'single' && relatedProduct.sizes && relatedProduct.sizes.length > 0) {
                                toast.error('Please select a size from product details before adding to cart');
                                return;
                              }
                              
                              addToCart(relatedProduct, 1);
                              toast.success(`${relatedProduct.name} added to cart!`);
                            }}
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="btn btn-outline-light"
                            onClick={() => window.location.href = `/product/${relatedProduct.id}`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="product-info">
                        <h5 className="product-title">{relatedProduct.name}</h5>
                        <div className="product-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < 4 ? 'text-warning' : 'text-secondary'} />
                          ))}
                          <span className="text-muted">(4.0)</span>
                        </div>
                        <div className="product-price">
                          <span className="current-price">{relatedProduct.price}</span>
                          {relatedProduct.original_price && (
                            <span className="original-price">{relatedProduct.original_price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-about">
                <img src={websiteLogo} alt="Kids Colours" className="img-fluid mb-3" style={{ maxWidth: '200px', minHeight: '80px' }} />
                <p>Your trusted online shopping destination for quality products and exceptional service.</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-links">
                <h5>Quick Links</h5>
                <ul>
                  <li><a href="/">Home</a></li>
                  <li><a href="/cart">Cart</a></li>
                  <li><a href="/checkout">Checkout</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="footer-contact">
                <h5>Contact Info</h5>
                <p><FaHeadset /> +1 800-123-4567</p>
                <p><FaEnvelope /> info@kidscolours.com</p>
                <p><FaMapMarkerAlt /> 123 Shopping St, City, State 12345</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="row">
              <div className="col-12 text-center">
                <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solution</span></p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      {/* Custom Styles */}
      <style jsx>{`
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

        /* Professional Review Styles */
        .reviews-container {
          max-width: 100%;
        }

        .review-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f8f9fa;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f26522, #ff8c42);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-text {
          color: white;
          font-weight: 600;
          font-size: 18px;
        }

        .reviewer-details {
          flex: 1;
        }

        .reviewer-name {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .review-date {
          color: #6c757d;
          font-size: 13px;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stars-container {
          display: flex;
          gap: 2px;
        }

        .star {
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .star-filled {
          color: #ffc107;
        }

        .star-empty {
          color: #e0e0e0;
        }

        .rating-text {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .review-content {
          padding: 16px 24px;
        }

        .review-comment {
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
          font-size: 15px;
        }

        .review-images-section {
          margin-top: 16px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .review-image-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 1;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .review-image-item:hover {
          transform: scale(1.05);
        }

        .review-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .review-image-item:hover .image-overlay {
          opacity: 1;
        }

        .image-overlay i {
          color: white;
          font-size: 20px;
        }

        .review-footer {
          padding: 12px 24px 20px;
          border-top: 1px solid #f8f9fa;
        }

        .review-actions {
          display: flex;
          gap: 16px;
        }

        .action-btn {
          background: none;
          border: 1px solid #e0e0e0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          color: #6c757d;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .action-btn:hover {
          background: #f8f9fa;
          border-color: #f26522;
          color: #f26522;
        }

        .helpful-btn:hover {
          background: #f26522;
          color: white;
          border-color: #f26522;
        }

        .empty-reviews {
          padding: 40px;
          background: #fafafa;
          border-radius: 16px;
          border: 2px dashed #e0e0e0;
        }

        .empty-icon {
          opacity: 0.6;
        }

        /* Modal styles for image view */
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
        }

        .modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }

        .modal-content img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        .close-btn {
          position: absolute;
          top: -40px;
          right: 0;
          background: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Modern Header Styles */
        .modern-header {
          background: #000;
          backdrop-filter: blur(10px);
          border-radius: 0 0 30px 30px;
        }
        
        .top-bar {
          background: #000;
          padding: 2px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .contact-info span {
          color: #fff;
          font-size: 12px;
        }
          .footer-bottom span {
          color: #f26522;
        }
        
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f26522;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .main-nav {
          padding: 15px 0;
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
          height: 44px;
        }
        
        .search-bar .form-control::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .search-bar .form-control:focus {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(242, 101, 34, 0.3);
          color: #fff;
        }
        
        .btn-search {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          background: #f26522;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .menu-toggle {
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
        }
        
        .menu-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #f26522;
        }
        
        .custom_menu {
          background: rgba(242, 101, 34, 0.9);
          padding: 12px 0;
          border-radius: 20px;
          margin-top: 15px;
        }
        
        .custom_menu ul {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .custom_menu ul li a {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          padding: 5px 0;
          position: relative;
          font-size: 14px;
        }
        
        .custom_menu ul li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #fff;
          transition: width 0.3s;
        }
        
        .custom_menu ul li a:hover::after,
        .custom_menu ul li a.active::after {
          width: 100%;
        }
        
        @media (max-width: 767px) {
          .top-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeProductDetail;
