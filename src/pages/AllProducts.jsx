import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset, FaTruck, FaShoppingCart, FaSearch, FaBars, FaEnvelope } from 'react-icons/fa';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';

const AllProducts = () => {
  const { addToCart, getCartItemsCount } = useCart();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, priceRange, currentPage]);

  // Initialize searchQuery from URL (TopBar default navigation uses ?search=...)
  useEffect(() => {
    const q = searchParams.get('search') || '';
    // Avoid loops: only update when it differs
    if (q !== searchQuery) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        search: searchQuery
      };
      
      const data = await themeApi.getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const q = searchQuery.trim();
    if (q) {
      setSearchParams({ search: q });
    } else {
      setSearchParams({});
    }
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await themeApi.addToWishlist(productId);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const ProductCard = ({ product }) => (
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
      </div>
      <div className="product-content">
        <h4 className="product-name">{product.name}</h4>
        {product.sku && (
          <div className="product-sku" style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace', marginBottom: '5px' }}>
            SKU: {product.sku}
          </div>
        )}
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
  );

  return (
    <div className="all-products-page">
      {/* Header - Using TopBar Component */}
      <header className="modern-header">
        <div className="container">
          <TopBar 
            onMenuToggle={() => setSideDrawerOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        </div>
      </header>

      {/* Page Content */}
      <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
        {/* Page Title */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 style={{ color: '#333', fontWeight: 'bold', marginBottom: '10px' }}>All Products</h2>
            <p style={{ color: '#666' }}>Discover our complete collection of kids' fashion</p>
          </div>
        </div>

        {/* Filters and Controls */}
        {/* <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center gap-3">
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created_at">Latest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <span style={{ color: '#666' }}>
              Showing {products.length} products
            </span>
          </div>
        </div> */}

        {/* Products Grid/List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <h4 style={{ color: '#666' }}>No products found</h4>
            <p style={{ color: '#999' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="row">
            {products.map((product) => (
              <div className="col-lg-4 col-md-6 col-sm-6 mb-4" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      style={{ color: '#f26522' }}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(i + 1)}
                        style={{ 
                          backgroundColor: currentPage === i + 1 ? '#f26522' : 'transparent',
                          color: currentPage === i + 1 ? 'white' : '#f26522',
                          borderColor: '#f26522'
                        }}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === pagination.pages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      style={{ color: '#f26522' }}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Same as ThemeHome */}

      <ThemeFooter />

      {/* Add ThemeHome footer styles and DynamicCategory product card styles */}
      <style jsx>{`
        // .footer-section {
        //   background: #333;
        //   color: white;
        //   padding: 50px 0 20px;
        //   border-radius: 20px 20px 0 0;
        // }

        // .footer-about img {
        //   max-height: 50px;
        // }

        // .footer-links h5,
        // .footer-contact h5 {
        //   color: #f26522;
        //   margin-bottom: 20px;
        // }

        // .footer-links ul {
        //   list-style: none;
        //   padding: 0;
        // }

        // .footer-links ul li {
        //   margin-bottom: 10px;
        // }

        // .footer-links a {
        //   color: #ccc;
        //   text-decoration: none;
        //   transition: color 0.3s;
        // }

        // .footer-links a:hover {
        //   color: #f26522;
        // }

        // .footer-contact p {
        //   color: #ccc;
        //   margin-bottom: 10px;
        // }

        // .footer-contact p i {
        //   margin-right: 10px;
        //   color: #f26522;
        // }

        // .footer-bottom {
        //   border-top: 1px solid #555;
        //   margin-top: 30px;
        //   padding-top: 20px;
        // }

        // .footer-bottom p {
        //   color: #ccc;
        //   margin: 0;
        // }

        // .footer-bottom span {
        //   color: #f26522;
        // }

        /* Product Card Styles - Same as DynamicCategory */
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          height: 250px;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-content {
          padding: 20px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .product-price {
          font-size: 18px;
          font-weight: bold;
          color: #f26522;
          margin-bottom: 15px;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        .btn-add-cart {
          background: #f26522;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.3s ease;
        }

        .btn-add-cart:hover {
          background: #e55a1b;
        }

        .btn-view-details {
          background: transparent;
          color: #f26522;
          border: 1px solid #f26522;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-details:hover {
          background: #f26522;
          color: white;
        }

        @media (max-width: 768px) {
          .footer-section {
            padding: 30px 0 15px;
          }

          .product-card {
            margin-bottom: 20px;
          }

          .product-actions {
            flex-direction: column;
          }

          .btn-add-cart,
          .btn-view-details {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

     

      {/* SideDrawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default AllProducts;
