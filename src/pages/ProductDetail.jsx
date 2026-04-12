import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { FaHeadset, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShoppingCart, FaSearch, FaBars } from 'react-icons/fa';
import SideDrawer from '../components/SideDrawer';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: '',
    comment: ''
  });
  const { addToCart, getCartItemsCount } = useCart();
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  // Fetch product details and related products
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productData = await themeApi.getProductById(id);
        console.log('Product data:', productData);
        setProduct(productData);

        // Fetch related products from the same category
        if (productData?.category?.id || productData?.category_id) {
          try {
            const categoryId = productData.category?.id || productData.category_id;
            console.log('Fetching products for category:', categoryId);
            const categoryProducts = await themeApi.getProductsByCategory(categoryId);
            console.log('Category products:', categoryProducts);
            
            // Handle different response structures
            let productsArray = [];
            if (Array.isArray(categoryProducts)) {
              productsArray = categoryProducts;
            } else if (categoryProducts?.products && Array.isArray(categoryProducts.products)) {
              productsArray = categoryProducts.products;
            } else if (categoryProducts?.data && Array.isArray(categoryProducts.data)) {
              productsArray = categoryProducts.data;
            }
            
            // Filter out the current product and limit to 4 related products
            const related = productsArray
              .filter(p => p.id !== parseInt(id))
              .slice(0, 4);
            
            console.log('Related products:', related);
            setRelatedProducts(related);
          } catch (error) {
            console.error('Error fetching related products:', error);
            setRelatedProducts([]);
          }
        } else {
          console.log('No category found for product');
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Check if product is single size and no size is selected
      if (product.product_type === 'single' && product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast.error('Please select a size before adding to cart');
        return;
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || (product.images && product.images[0]),
        quantity: quantity,
        selectedSize: selectedSize || null // Include selected size if available
      });
      toast.success('Product added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Initialize with dummy reviews if no reviews from API
  useEffect(() => {
    setReviews([
      {
        id: 1,
        name: "John D.",
        rating: 5,
        date: "2024-01-15",
        comment: "Amazing sound quality! The noise cancellation is incredible. Worth every penny."
      },
      {
        id: 2,
        name: "Sarah M.",
        rating: 4,
        date: "2024-01-10",
        comment: "Great headphones, very comfortable for long use. Battery life is as advertised."
      },
      {
        id: 3,
        name: "Mike R.",
        rating: 5,
        date: "2024-01-05",
        comment: "Best purchase I've made this year. The build quality is premium."
      }
    ]);
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    
    const newReview = {
      id: reviews.length + 1,
      name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      date: new Date().toISOString().split('T')[0],
      comment: reviewForm.comment
    };
    
    setReviews([newReview, ...reviews]);
    setReviewForm({ name: '', rating: '', comment: '' });
    toast.success('Review submitted successfully!');
  };

  const ProductCard = ({ product }) => (
    <div className="col-lg-4 col-md-6 col-6 mb-4">
      <div className="card-v2">
        <div className="card-img-v2" onClick={() => window.location.href = `/product/${product.id}`}>
          <img
            src={
              product.images && product.images.length > 0 
                ? product.images[0] 
                : product.image_url || product.image || '/src/assets/images/tshirt-img.png'
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
          <button 
            className="btn-add-v2"
            onClick={() => {
              if (product.product_type === 'single' && product.sizes && product.sizes.length > 0 && !selectedSize) {
                toast.error('Please select a size before adding to cart');
                return;
              }
              addToCart({
                id: product.id,
                name: product.name,
                price: product.discount_price || product.price,
                image: product.images && product.images.length > 0 
                  ? product.images[0] 
                  : product.image_url || product.image,
                quantity: 1,
                selectedSize: selectedSize || null
              });
              toast.success(`${product.name} added to Cart!`);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <span className="ms-3"><FaTruck /> Free Shipping on orders over Rs 10,000</span>
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
                    <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" className="img-fluid" style={{ maxWidth: '200px', minHeight: '80px' }} />
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
                  <FaBars /> Menu
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-gray-500 hover:text-gray-700">Home</a></li>
            <li><span className="text-gray-400">/</span></li>
            <li><a href="/shop" className="text-gray-500 hover:text-gray-700">Shop</a></li>
            <li><span className="text-gray-400">/</span></li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="relative mb-4">
              <img
                src={Array.isArray(product.images) ? product.images[selectedImage] : (product.image_url || '/src/assets/images/placeholder.webp')}
                alt={product.name}
                className="w-full rounded-lg shadow-lg"
              />
              {product.original_price && product.original_price > product.price && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </span>
              )}
            </div>
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">{product.rating || 0} ({product.reviews || 0} reviews)</span>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-gray-500 line-through ml-3">${product.original_price}</span>
                )}
              </div>
              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            {/* Product Options */}
            <div className="mb-6">
              {product.sizes && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="flex gap-2">
                    {[...product.sizes]
                      .sort((a, b) => ((a?.sort_order || 0) - (b?.sort_order || 0)))
                      .map((size, index) => (
                        <button
                          key={typeof size === 'string' ? size : `size-${index}`}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            selectedSize === size
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {typeof size === 'string' ? size : (size?.size || JSON.stringify(size))}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {product.colors && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedColor === color
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                Free Shipping
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Secure Payment
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                30-Day Returns
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <span className="ml-2 text-gray-900">{product.brand}</span>
                </div>
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2 text-gray-900">{product.sku}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-900">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className="ml-2 text-gray-900">{product.stock} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-16">
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                Description
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Specifications
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <ul className="space-y-2 mb-6">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">{key}:</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="container mt-5">
          <h2 className="text-center mb-4" style={{ color: '#262626', fontSize: '2rem', fontWeight: 'bold' }}>
            Related Products
          </h2>
          <div className="row">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {relatedProducts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No related products found.</p>
            </div>
          )}
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
                    <button type="submit" className="btn" style={{ backgroundColor: '#f26522', color: 'white' }}>
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>

              {/* Existing Reviews */}
              <div className="row">
                {reviews.map((review) => (
                  <div key={review.id} className="col-12 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{review.name}</h6>
                          <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                        </div>
                        <div className="mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={i < review.rating ? 'text-warning' : 'text-secondary'} />
                          ))}
                        </div>
                        <p className="mb-0">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="col-12 text-center">
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-about">
                <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" className="img-fluid mb-3" style={{ maxWidth: '200px', minHeight: '80px' }} />
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
                <p>&copy; 2026 Kids Colours. All rights reserved. <span> Powered by CodeBase Solutions</span></p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
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
          
          .product-image img {
            height: 200px;
          }
        }
        
        @media (max-width: 576px) {
          .product-image img {
            height: 160px;
          }
          
          .product-overlay .btn {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
