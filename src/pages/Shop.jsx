import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Filter,
  Grid,
  List,
  Search,
  ChevronDown,
  Sparkles,
  Baby,
  Shirt
} from 'lucide-react';

const Shop = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data - Kids Clothing
  const categories = [
    { id: 'all', name: 'All Kids Wear', count: 1234 },
    { id: 'boys', name: 'Boys Wear', count: 245 },
    { id: 'girls', name: 'Girls Wear', count: 189 },
    { id: 'baby', name: 'Baby Collection', count: 156 },
    { id: 'traditional', name: 'Traditional Wear', count: 98 },
    { id: 'uniform', name: 'School Uniform', count: 234 },
    { id: 'accessories', name: 'Accessories', count: 167 }
  ];

  const products = [
    {
      id: 1,
      name: "Colorful Rainbow T-Shirt",
      price: 899,
      originalPrice: 1299,
      image: "https://images.unsplash.com/photo-1516159096519-9e86268b8106?w=300",
      rating: 4.5,
      reviews: 234,
      category: "boys",
      badge: "Best Seller",
      description: "Vibrant rainbow colored t-shirt for kids",
      age: "3-8 years"
    },
    {
      id: 2,
      name: "Princess Dress Pink",
      price: 1899,
      originalPrice: 2499,
      image: "https://images.unsplash.com/photo-1515372033412-d3df4a0f2b9f?w=300",
      rating: 4.8,
      reviews: 189,
      category: "girls",
      badge: "New",
      description: "Beautiful princess dress with sparkles",
      age: "4-10 years"
    },
    {
      id: 3,
      name: "Boys Casual Shorts Set",
      price: 1299,
      originalPrice: 1699,
      image: "https://images.unsplash.com/photo-1596454974567-190a2cd41c5a?w=300",
      rating: 4.6,
      reviews: 156,
      category: "boys",
      badge: "Sale",
      description: "Comfortable shorts with t-shirt combo",
      age: "2-6 years"
    },
    {
      id: 4,
      name: "Baby Soft Onesie",
      price: 499,
      originalPrice: 799,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      rating: 4.7,
      reviews: 267,
      category: "baby",
      badge: "Popular",
      description: "Ultra-soft cotton onesie for babies",
      age: "0-12 months"
    },
    {
      id: 5,
      name: "Traditional Kurta Pajama",
      price: 1599,
      originalPrice: 1999,
      image: "https://images.unsplash.com/photo-1516159096519-9e86268b8106?w=300",
      rating: 4.4,
      reviews: 145,
      category: "traditional",
      badge: "Eid Special",
      description: "Traditional Pakistani kurta pajama",
      age: "5-12 years"
    },
    {
      id: 6,
      name: "School Uniform Shirt",
      price: 899,
      originalPrice: 1199,
      image: "https://images.unsplash.com/photo-1596454974567-190a2cd41c5a?w=300",
      rating: 4.3,
      reviews: 189,
      category: "uniform",
      badge: "School Wear",
      description: "Comfortable school uniform shirt",
      age: "6-14 years"
    },
    {
      id: 7,
      name: "Girls Hair Accessories Set",
      price: 399,
      originalPrice: 599,
      image: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=300",
      rating: 4.6,
      reviews: 98,
      category: "accessories",
      badge: "Cute",
      description: "Colorful hair clips and bands set",
      age: "3-10 years"
    },
    {
      id: 8,
      name: "Sports Jersey Kids",
      price: 1099,
      originalPrice: 1499,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
      rating: 4.5,
      reviews: 167,
      category: "boys",
      badge: "Sports",
      description: "Active wear sports jersey",
      age: "4-12 years"
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
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
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer border-2 border-purple-100"
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs rounded-full font-bold">
            {product.badge}
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 p-2 rounded-full shadow-md hover:bg-pink-100">
            <Heart className="w-4 h-4 text-pink-500" />
          </button>
          <button className="bg-white/90 p-2 rounded-full shadow-md hover:bg-purple-100">
            <Eye className="w-4 h-4 text-purple-500" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-purple-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <p className="text-xs text-purple-600 font-medium mb-3">Age: {product.age}</p>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-purple-600 ml-2">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-purple-900">Rs.{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">Rs.{product.originalPrice}</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const ProductListItem = ({ product }) => (
    <motion.div
      whileHover={{ x: 5 }}
      className="bg-white rounded-xl shadow-lg p-4 flex gap-4 group cursor-pointer border-2 border-purple-100"
    >
      <img 
        src={product.image} 
        alt={product.name}
        className="w-32 h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-purple-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            <p className="text-xs text-purple-600 font-medium mb-3">Age: {product.age}</p>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-purple-600 ml-2">({product.reviews})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-lg font-bold text-purple-900">Rs.{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">Rs.{product.originalPrice}</span>
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-100 p-2 rounded-lg hover:bg-purple-200"
              >
                <Heart className="w-4 h-4 text-purple-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="header_section_top">
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
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🌈 Shop All Kids Clothes
          </h1>
          <p className="text-gray-700">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'} in our colorful collection
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
              <h2 className="font-bold text-purple-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-purple-600" />
                Filters
              </h2>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-purple-700 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">{category.name}</span>
                      <span className="text-xs text-purple-500 ml-auto">({category.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-purple-700 mb-3">Price Range (Rs.)</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs.{priceRange[0]}</span>
                    <span>Rs.{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search kids clothes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <div className="flex border-2 border-purple-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-purple-600 hover:bg-purple-100'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-purple-600 hover:bg-purple-100'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-purple-600 text-lg font-medium">No products found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
