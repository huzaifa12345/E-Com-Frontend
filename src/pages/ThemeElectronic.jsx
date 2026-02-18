import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search } from 'lucide-react';

const ThemeElectronic = () => {
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');

  // Electronic products data
  const electronicProducts = [
    {
      id: 1,
      name: "Mobile Phone",
      price: 299,
      originalPrice: 399,
      image: "/src/assets/images/mobile-img.png",
      category: "phones",
      brand: "TechPro",
      rating: 4.5,
      reviews: 234,
      features: ["5G", "128GB", "Dual Camera"]
    },
    {
      id: 2,
      name: "Computer",
      price: 599,
      originalPrice: 799,
      image: "/src/assets/images/computer-img.png",
      category: "computers",
      brand: "PowerTech",
      rating: 4.3,
      reviews: 189,
      features: ["Intel i7", "16GB RAM", "512GB SSD"]
    },
    {
      id: 3,
      name: "Laptop",
      price: 899,
      originalPrice: 1199,
      image: "/src/assets/images/laptop-img.png",
      category: "laptops",
      brand: "UltraBook",
      rating: 4.7,
      reviews: 312,
      features: ["Intel i9", "32GB RAM", "1TB SSD"]
    },
    {
      id: 4,
      name: "Tablet",
      price: 349,
      originalPrice: 449,
      image: "/src/assets/images/tablet-img.png",
      category: "tablets",
      brand: "TabPro",
      rating: 4.4,
      reviews: 156,
      features: ["10.5\"", "256GB", "WiFi + 4G"]
    },
    {
      id: 5,
      name: "Smart Watch",
      price: 199,
      originalPrice: 299,
      image: "/src/assets/images/watch-img.png",
      category: "wearables",
      brand: "TimeTech",
      rating: 4.6,
      reviews: 278,
      features: ["Heart Rate", "GPS", "Water Resistant"]
    },
    {
      id: 6,
      name: "Headphones",
      price: 79,
      originalPrice: 99,
      image: "/src/assets/images/headphones-img.png",
      category: "audio",
      brand: "SoundPro",
      rating: 4.2,
      reviews: 145,
      features: ["Noise Canceling", "Bluetooth 5.0", "20hr Battery"]
    },
    {
      id: 7,
      name: "Camera",
      price: 449,
      originalPrice: 599,
      image: "/src/assets/images/camera-img.png",
      category: "cameras",
      brand: "PhotoPro",
      rating: 4.8,
      reviews: 423,
      features: ["24MP", "4K Video", "WiFi"]
    },
    {
      id: 8,
      name: "Speaker",
      price: 89,
      originalPrice: 129,
      image: "/src/assets/images/speaker-img.png",
      category: "audio",
      brand: "BassPro",
      rating: 4.1,
      reviews: 98,
      features: ["Waterproof", "Bluetooth", "12hr Battery"]
    },
    {
      id: 9,
      name: "Gaming Console",
      price: 399,
      originalPrice: 499,
      image: "/src/assets/images/console-img.png",
      category: "gaming",
      brand: "GamePro",
      rating: 4.9,
      reviews: 567,
      features: ["4K Gaming", "1TB Storage", "WiFi"]
    }
  ];

  const categories = [
    { name: "All Electronics", count: electronicProducts.length },
    { name: "Phones", count: electronicProducts.filter(p => p.category === 'phones').length },
    { name: "Laptops", count: electronicProducts.filter(p => p.category === 'laptops').length },
    { name: "Tablets", count: electronicProducts.filter(p => p.category === 'tablets').length },
    { name: "Audio", count: electronicProducts.filter(p => p.category === 'audio').length },
    { name: "Gaming", count: electronicProducts.filter(p => p.category === 'gaming').length }
  ];

  const brands = ["TechPro", "PowerTech", "UltraBook", "TabPro", "TimeTech", "SoundPro", "PhotoPro", "BassPro", "GamePro"];

  const filteredProducts = electronicProducts.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPrice && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="col-lg-4 col-sm-4 mb-4"
    >
      <div className="box_main">
        <h4 className="shirt_text">{product.name}</h4>
        <p className="brand_text">Brand: {product.brand}</p>
        <p className="price_text">
          Price <span style={{ color: '#262626' }}>{product.price}</span>
          {product.originalPrice && (
            <span className="original_price ml-2" style={{ textDecoration: 'line-through', color: '#999' }}>
              {product.originalPrice}
            </span>
          )}
        </p>
        <div className="tshirt_img">
          <img 
            src={product.image} 
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
        <div className="features_list">
          {product.features.map((feature, index) => (
            <span key={index} className="feature_tag">
              {feature}
            </span>
          ))}
        </div>
        <div className="rating_text mb-2">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>
                ★
              </span>
            ))}
          </div>
          <span className="rating_count">({product.reviews})</span>
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
    <div className="electronic_main">
      {/* Electronic Header */}
      <div className="electronic_section">
        <div className="container">
          <h1 className="electronic_taital">Electronic</h1>
          <p className="electronic_text">
            Explore our wide range of latest electronic devices and gadgets with cutting-edge technology
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

              <h4 className="filter_title mt-4">Brands</h4>
              <div className="brand_list">
                {brands.map((brand, index) => (
                  <div key={index} className="brand_item">
                    <label className="custom_checkbox">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      {brand}
                    </label>
                  </div>
                ))}
              </div>

              <h4 className="filter_title mt-4">Price Range</h4>
              <div className="price_filter">
                <input
                  type="range"
                  min="0"
                  max="1000"
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
                  placeholder="Search electronic items..."
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
            <div className="electronic_section_2">
              <div className="row">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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
        .electronic_main {
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

        .category_item, .brand_item {
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

        .brand_text {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .features_list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 10px;
        }

        .feature_tag {
          background: #f0f0f0;
          color: #666;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
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

export default ThemeElectronic;
