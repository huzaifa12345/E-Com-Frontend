import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryData = await themeApi.getCategoryBySlug(categorySlug);
        setCategory(categoryData);
        
        // Fetch products for this category
        const productsData = await themeApi.getProductsByCategory(categorySlug);
        setProducts(productsData.products || []);
        setPagination(productsData.pagination || {});
        
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
            onClick={() => navigate('/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fashion_main">
      {/* Top Bar Section */}
      <div className="header_section_top">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="custom_menu">
                <ul>
                  <li><a href="/home">Home</a></li>
                  <li><a href="/cart">Cart</a></li>
                  <li><a href="/checkout">Checkout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br/>
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

      {/* Filter Section */}
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="filter_section">
              <h4 className="filter_title">Search</h4>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    <Search size={16} />
                  </button>
                </div>
              </form>

              <h4 className="filter_title">Price Range</h4>
              <div className="price_filter">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="price_slider"
                />
                <div className="price_range_text">
                  0 - {priceRange[1]}
                </div>
              </div>

              <h4 className="filter_title mt-4">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort_select"
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Section */}
          <div className="col-lg-9 col-md-8">
            <div className="products_section">
              <div className="row">
                {products.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h3>No products found in this category</h3>
                    <p>Check back later for new arrivals!</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div className="col-lg-4 col-sm-4 mb-4" key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="box_main"
                      >
                        <h4 className="shirt_text">{product.name}</h4>
                        <p className="price_text">
                          Price <span style={{ color: '#262626' }}>{product.price}</span>
                        </p>
                        <div className="tshirt_img">
                          <img 
                            src={
                              product.images && product.images.length > 0 
                                ? product.images[0] 
                                : product.image_url || '/src/assets/images/tshirt-img.png'
                            } 
                            alt={product.name} 
                            style={{ 
                              objectFit: 'cover',
                              width: '100%',
                              height: '300px'
                            }}
                          />
                          <div className="overlay_icons">
                            <button className="icon_btn">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="icon_btn">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="btn_main">
                          <div className="buy_bt">
                            <button 
                              onClick={() => handleAddToCart(product)}
                              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                              Add to Cart
                            </button>
                          </div>
                          <div className="seemore_bt">
                            <button 
                              onClick={() => navigate(`/product/${product.id}`)}
                              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
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
              
              {/* Load More */}
              <div className="load_more_section mt-4 text-center">
                <button className="load_more_bt">
                  Load More Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Same as ThemeHome */}
      <div className="footer_section layout_padding" style={{ backgroundColor: '#1a1a1a', padding: '60px 0 20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" style={{ width: '200px', height: 'auto', marginBottom: '30px' }} />
              
              <div className="newsletter_section mb-4">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                    <div className="d-flex align-items-center justify-content-center">
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="form-control" 
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '2px solid #fff',
                          color: '#fff',
                          borderRadius: '0',
                          padding: '10px 15px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                      <button 
                        className="btn ml-3" 
                        style={{
                          backgroundColor: '#f26522',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 25px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer_links mb-4">
                <div className="d-flex justify-content-center flex-wrap">
                  <a href="#" className="footer_link">Best Sellers</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Gift Ideas</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">New Releases</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Today's Deals</a>
                  <span className="link_separator mx-3">|</span>
                  <a href="#" className="footer_link">Customer Service</a>
                </div>
              </div>

              <div className="helpline_section mb-4">
                <p style={{ 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Help Line Number : +1 1800 1200 1200
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="copyright_bar text-center pt-4" style={{ borderTop: '1px solid #333' }}>
                <p style={{ 
                  color: '#fff', 
                  fontSize: '14px', 
                  margin: '0',
                  opacity: '0.8'
                }}>
                  © 2026 All Rights Reserved. Design by Kids Colours
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .footer_link {
            color: #fff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            transition: color 0.3s ease;
          }
          
          .footer_link:hover {
            color: #f26522 !important;
          }
          
          .link_separator {
            color: #666;
            font-size: 16px;
          }
          
          .form-control::placeholder {
            color: #999;
          }
          
          .form-control:focus {
            box-shadow: none;
            border-bottom-color: #f26522;
          }
        `}</style>
      </div>

      <style jsx>{`
        .fashion_main {
          background-color: #fff;
          min-height: 100vh;
        }

        .filter_section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .filter_title {
          font-size: 18px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 15px;
          border-bottom: 2px solid #f26522;
          padding-bottom: 5px;
        }

        .price_filter {
          margin-bottom: 20px;
        }

        .price_slider {
          width: 100%;
          margin-bottom: 10px;
        }

        .price_range_text {
          font-size: 14px;
          color: #666;
          text-align: center;
        }

        .sort_select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
        }

        .overlay_icons {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tshirt_img:hover .overlay_icons {
          opacity: 1;
        }

        .icon_btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .icon_btn:hover {
          background: #f26522;
          color: white;
        }

        .load_more_bt {
          background: #f26522;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .load_more_bt:hover {
          background: #e5551b;
        }

        .footer_link {
          color: #fff !important;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        
        .footer_link:hover {
          color: #f26522 !important;
        }
        
        .link_separator {
          color: #666;
          font-size: 16px;
        }
        
        .form-control::placeholder {
          color: #999;
        }
        
        .form-control:focus {
          box-shadow: none;
          border-bottom-color: #f26522;
        }
      `}</style>
    </div>
  );
};

export default DynamicCategory;
