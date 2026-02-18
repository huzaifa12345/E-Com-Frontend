import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';

const ThemeFashion = () => {
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  // Fetch fashion products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          category: 'fashion',
          sort_by: sortBy,
          order: 'DESC',
          min_price: priceRange[0],
          max_price: priceRange[1],
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        const data = await themeApi.getProducts(params);
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      } catch (error) {
        console.error('Error fetching fashion products:', error);
        toast.error('Failed to load fashion products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, priceRange, searchQuery]);

  const categories = [
    { name: "All Fashion", count: pagination.total || 0 },
    { name: "Men", count: products.filter(p => p.name.toLowerCase().includes('man') || p.name.toLowerCase().includes('men')).length },
    { name: "Women", count: products.filter(p => p.name.toLowerCase().includes('woman') || p.name.toLowerCase().includes('women')).length },
    { name: "T-Shirts", count: products.filter(p => p.name.toLowerCase().includes('shirt')).length },
    { name: "Dresses", count: products.filter(p => p.name.toLowerCase().includes('dress')).length }
  ];

  if (loading) {
    return (
      <div className="fashion_section layout_padding">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3">Loading fashion products...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="col-lg-4 col-sm-4 mb-4"
    >
      <div className="box_main">
        <h4 className="shirt_text">{product.name}</h4>
        <p className="price_text">
          Price <span style={{ color: '#262626' }}>{product.price}</span>
        </p>
        <div className="tshirt_img">
          <img 
            src={product.image_url || product.image || '/src/assets/images/placeholder.jpg'} 
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
            <Link to={`/product/${product.id}`}>Buy Now</Link>
          </div>
          <div className="seemore_bt">
            <button className="add_to_cart">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fashion_main">
      {/* Fashion Header */}
      <div className="fashion_section">
        <div className="container">
          <h1 className="fashion_taital">Man & Woman Fashion</h1>
          <p className="fashion_text">
            Discover our latest collection of trendy and comfortable fashion items for men and women
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container">
        <div className="row mb-4">
          <div className="col-lg-3 col-md-4">
            <div className="filter_section">
              <h4 className="filter_title">Categories</h4>
              <div className="category_list">
                {categories.map((category, index) => (
                  <div key={index} className="category_item">
                    <label className="custom_checkbox">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      {category.name} ({category.count})
                    </label>
                  </div>
                ))}
              </div>

              <h4 className="filter_title mt-4">Price Range</h4>
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
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          <div className="col-lg-9 col-md-8">
            {/* Search Bar */}
            <div className="search_bar mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search fashion items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-secondary" type="button">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="fashion_section_2">
              <div className="row">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-5">
                  <p>No fashion products found matching your criteria.</p>
                </div>
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

        .category_item {
          margin-bottom: 10px;
        }

        .custom_checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #666;
        }

        .custom_checkbox input {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 3px;
          margin-right: 8px;
          position: relative;
        }

        .custom_checkbox input:checked + .checkmark {
          background-color: #f26522;
          border-color: #f26522;
        }

        .price_filter {
          margin-top: 10px;
        }

        .price_slider {
          width: 100%;
          margin: 10px 0;
        }

        .price_range_text {
          font-size: 14px;
          color: #666;
        }

        .sort_select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .search_bar {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }

        .overlay_icons {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tshirt_img:hover .overlay_icons {
          opacity: 1;
        }

        .icon_btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .icon_btn:hover {
          background: #f26522;
          color: white;
        }

        .rating_text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .stars {
          color: #ffc107;
        }

        .star.filled {
          color: #ffc107;
        }

        .star:not(.filled) {
          color: #ddd;
        }

        .rating_count {
          color: #666;
        }

        .original_price {
          font-size: 14px;
        }

        .load_more_bt {
          background: #f26522;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .load_more_bt:hover {
          background: #e5551b;
        }
      `}</style>

      {/* Footer Section */}
      <div className="footer_section layout_padding" style={{ backgroundColor: '#1a1a1a', padding: '60px 0 20px' }}>
        <div className="container">
          {/* Main Footer Content */}
          <div className="row">
            <div className="col-12 text-center mb-5">
              {/* Kids Colours Logo */}
              <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours" style={{ width: '200px', height: 'auto', marginBottom: '30px' }} />
              
              {/* Newsletter Section */}
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

              {/* Navigation Links */}
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

              {/* Helpline Number */}
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

          {/* Copyright Bar */}
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

        {/* Custom Styles */}
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
          
          @media (max-width: 767px) {
            .footer_section {
              padding: 40px 0 20px !important;
            }
            
            .newsletter_section .d-flex {
              flex-direction: column;
              gap: 15px;
            }
            
            .newsletter_section .form-control {
              width: 100% !important;
              text-align: center;
            }
            
            .newsletter_section .btn {
              width: 100%;
              margin-left: 0 !important;
            }
            
            .footer_links {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              gap: 10px;
            }
            
            .link_separator {
              display: none;
            }
            
            .footer_link {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ThemeFashion;
