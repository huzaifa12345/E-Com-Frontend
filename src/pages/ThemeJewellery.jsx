import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search, Sparkles } from 'lucide-react';

const ThemeJewellery = () => {
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');

  // Jewellery products data
  const jewelleryProducts = [
    {
      id: 1,
      name: "Girl Ring",
      price: 150,
      originalPrice: 200,
      image: "/src/assets/images/girl-ring-img.png",
      category: "rings",
      material: "gold",
      carats: "18K",
      rating: 4.5,
      reviews: 234,
      description: "Elegant gold ring with diamond"
    },
    {
      id: 2,
      name: "Watch",
      price: 250,
      originalPrice: 350,
      image: "/src/assets/images/watch-img.png",
      category: "watches",
      material: "steel",
      carats: "Stainless",
      rating: 4.3,
      reviews: 189,
      description: "Luxury stainless steel watch"
    },
    {
      id: 3,
      name: "Necklace",
      price: 180,
      originalPrice: 250,
      image: "/src/assets/images/necklace-img.png",
      category: "necklaces",
      material: "silver",
      carats: "925",
      rating: 4.7,
      reviews: 312,
      description: "Beautiful silver necklace"
    },
    {
      id: 4,
      name: "Earrings",
      price: 120,
      originalPrice: 180,
      image: "/src/assets/images/earrings-img.png",
      category: "earrings",
      material: "gold",
      carats: "14K",
      rating: 4.4,
      reviews: 156,
      description: "Stunning gold earrings"
    },
    {
      id: 5,
      name: "Bracelet",
      price: 200,
      originalPrice: 300,
      image: "/src/assets/images/bracelet-img.png",
      category: "bracelets",
      material: "platinum",
      carats: "950",
      rating: 4.6,
      reviews: 278,
      description: "Elegant platinum bracelet"
    },
    {
      id: 6,
      name: "Pendant",
      price: 95,
      originalPrice: 150,
      image: "/src/assets/images/pendant-img.png",
      category: "pendants",
      material: "silver",
      carats: "925",
      rating: 4.2,
      reviews: 145,
      description: "Delicate silver pendant"
    },
    {
      id: 7,
      name: "Anklet",
      price: 80,
      originalPrice: 120,
      image: "/src/assets/images/anklet-img.png",
      category: "anklets",
      material: "gold",
      carats: "18K",
      rating: 4.8,
      reviews: 423,
      description: "Traditional gold anklet"
    },
    {
      id: 8,
      name: "Brooch",
      price: 65,
      originalPrice: 95,
      image: "/src/assets/images/brooch-img.png",
      category: "brooches",
      material: "gold",
      carats: "14K",
      rating: 4.1,
      reviews: 98,
      description: "Vintage gold brooch"
    },
    {
      id: 9,
      name: "Chain",
      price: 140,
      originalPrice: 200,
      image: "/src/assets/images/chain-img.png",
      category: "chains",
      material: "platinum",
      carats: "950",
      rating: 4.9,
      reviews: 567,
      description: "Premium platinum chain"
    }
  ];

  const categories = [
    { name: "All Jewellery", count: jewelleryProducts.length },
    { name: "Rings", count: jewelleryProducts.filter(p => p.category === 'rings').length },
    { name: "Necklaces", count: jewelleryProducts.filter(p => p.category === 'necklaces').length },
    { name: "Earrings", count: jewelleryProducts.filter(p => p.category === 'earrings').length },
    { name: "Bracelets", count: jewelleryProducts.filter(p => p.category === 'bracelets').length },
    { name: "Watches", count: jewelleryProducts.filter(p => p.category === 'watches').length }
  ];

  const materials = [
    { name: "All Materials", value: "all" },
    { name: "Gold", value: "gold" },
    { name: "Silver", value: "silver" },
    { name: "Platinum", value: "platinum" },
    { name: "Steel", value: "steel" }
  ];

  const filteredProducts = jewelleryProducts.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = selectedMaterial === 'all' || product.material === selectedMaterial;
    return matchesPrice && matchesSearch && matchesMaterial;
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
      <div className="box_main jewellery_box">
        <div className="premium_badge">
          <Sparkles className="w-4 h-4" />
          Premium
        </div>
        <h4 className="shirt_text">{product.name}</h4>
        <p className="material_text">
          {product.material.charAt(0).toUpperCase() + product.material.slice(1)} • {product.carats}
        </p>
        <p className="price_text">
          Price <span style={{ color: '#262626' }}>{product.price}</span>
          {product.originalPrice && (
            <span className="original_price ml-2" style={{ textDecoration: 'line-through', color: '#999' }}>
              {product.originalPrice}
            </span>
          )}
        </p>
        <div className="tshirt_img jewellery_img">
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
        <p className="description_text">{product.description}</p>
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
    <div className="jewellery_main">
      {/* Jewellery Header */}
      <div className="jewellery_section">
        <div className="container">
          <h1 className="jewellery_taital">Jewellery</h1>
          <p className="jewellery_text">
            Discover our exquisite collection of premium jewellery crafted with finest materials
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

              <h4 className="filter_title mt-4">Materials</h4>
              <div className="material_list">
                {materials.map((material, index) => (
                  <div key={index} className="material_item">
                    <label className="custom_radio">
                      <input
                        type="radio"
                        name="material"
                        value={material.value}
                        checked={selectedMaterial === material.value}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                      />
                      <span className="radio_checkmark"></span>
                      {material.name}
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
                  placeholder="Search jewellery items..."
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
            <div className="jewellery_section_2">
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
        .jewellery_main {
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

        .category_item, .material_item {
          margin-bottom: 10px;
        }

        .custom_checkbox, .custom_radio {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #666;
        }

        .custom_checkbox input, .custom_radio input {
          display: none;
        }

        .checkmark, .radio_checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 3px;
          margin-right: 8px;
          position: relative;
        }

        .radio_checkmark {
          border-radius: 50%;
        }

        .custom_checkbox input:checked + .checkmark,
        .custom_radio input:checked + .radio_checkmark {
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

        .jewellery_box {
          position: relative;
        }

        .premium_badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(45deg, #f26522, #ff8c42);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 1;
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

        .material_text {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .description_text {
          font-size: 13px;
          color: #666;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .jewellery_img {
          position: relative;
        }

        .jewellery_img img {
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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

export default ThemeJewellery;
