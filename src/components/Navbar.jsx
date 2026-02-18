// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useCart } from '../context/CartContext';
// import { 
//   ShoppingCart, 
//   Search, 
//   Menu, 
//   X, 
//   User, 
//   ChevronDown,
//   Package,
//   Heart,
//   Star,
//   Sparkles,
//   Crown,
//   TrendingUp,
//   Shield
// } from 'lucide-react';

// const Navbar = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();
//   const { getCartItemsCount, setCartOpen } = useCart();

//   const categories = [
//     { name: 'Luxury Collection', href: '/category/luxury', icon: Crown },
//     { name: 'Premium Wear', href: '/category/premium', icon: Sparkles },
//     { name: 'Classic Essentials', href: '/category/classic', icon: Shield },
//     { name: 'Trending Now', href: '/category/trending', icon: TrendingUp },
//     { name: 'Exclusive', href: '/category/exclusive', icon: Star },
//     { name: 'Accessories', href: '/category/accessories', icon: Package },
//   ];

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
//       setIsSearchOpen(false);
//       setSearchQuery('');
//     }
//   };

//   return (
//     <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-amber-500/20">
//       {/* Top Bar */}
//       <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 text-amber-100 text-sm py-2 border-b border-amber-500/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <div className="flex items-center space-x-6">
//             <motion.span 
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="flex items-center font-medium"
//             >
//               <Crown className="w-4 h-4 mr-2 text-amber-400" />
//               Premium Luxury Collection
//             </motion.span>
//           </div>
//           <div className="flex items-center space-x-6">
//             <span className="flex items-center">
//               <Shield className="w-4 h-4 mr-2 text-amber-400" />
//               Authentic Guaranteed
//             </span>
//             <span className="flex items-center">
//               <TrendingUp className="w-4 h-4 mr-2 text-amber-400" />
//               Free Global Shipping
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Main Navigation */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">
//           {/* Logo */}
//           <Link to="/" className="flex items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="text-3xl font-bold flex items-center"
//             >
//               <Crown className="w-10 h-10 mr-3 text-amber-400" />
//               <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
//                 LUXE
//               </span>
//             </motion.div>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex items-center space-x-8">
//             {/* Categories Dropdown */}
//             <div className="relative">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onHoverStart={() => setIsCategoriesOpen(true)}
//                 onHoverEnd={() => setIsCategoriesOpen(false)}
//                 className="flex items-center space-x-2 text-amber-100 hover:text-amber-400 transition-all duration-300 font-medium"
//               >
//                 <span>Collections</span>
//                 <ChevronDown className="w-4 h-4" />
//               </motion.button>
              
//               <AnimatePresence>
//                 {isCategoriesOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     onMouseEnter={() => setIsCategoriesOpen(true)}
//                     onMouseLeave={() => setIsCategoriesOpen(false)}
//                     className="absolute top-full left-0 w-72 backdrop-blur-xl bg-slate-800/95 border border-amber-500/20 rounded-2xl py-4 mt-2 shadow-2xl"
//                   >
//                     {categories.map((category, index) => (
//                       <motion.div
//                         key={category.name}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.05 }}
//                       >
//                         <Link
//                           to={category.href}
//                           className="flex items-center px-6 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 group"
//                         >
//                           <category.icon className="w-5 h-5 mr-3 text-amber-400 group-hover:scale-110 transition-transform" />
//                           <span className="font-medium">{category.name}</span>
//                         </Link>
//                       </motion.div>
//                     ))}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <Link to="/shop" className="text-amber-100 hover:text-amber-400 transition-all duration-300 font-medium">
//               Shop
//             </Link>
//             <Link to="/new-arrivals" className="text-amber-100 hover:text-amber-400 transition-all duration-300 font-medium">
//               New Arrivals
//             </Link>
//             <Link to="/bestsellers" className="text-amber-100 hover:text-amber-400 transition-all duration-300 font-medium">
//               Bestsellers
//             </Link>
//             <Link to="/about" className="text-amber-100 hover:text-amber-400 transition-all duration-300 font-medium">
//               About
//             </Link>
//           </div>

//           {/* Right Side Actions */}
//           <div className="flex items-center space-x-4">
//             {/* Search */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsSearchOpen(!isSearchOpen)}
//               className="p-3 text-amber-100 hover:text-amber-400 transition-all duration-300"
//             >
//               <Search className="w-5 h-5" />
//             </motion.button>

//             {/* User Account */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               className="p-3 text-amber-100 hover:text-amber-400 transition-all duration-300"
//             >
//               <User className="w-5 h-5" />
//             </motion.button>

//             {/* Wishlist */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               className="p-3 text-amber-100 hover:text-amber-400 transition-all duration-300"
//             >
//               <Heart className="w-5 h-5" />
//             </motion.button>

//             {/* Cart */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setCartOpen(true)}
//               className="p-3 text-amber-100 hover:text-amber-400 transition-all duration-300 relative"
//             >
//               <ShoppingCart className="w-5 h-5" />
//               <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
//                 {getCartItemsCount()}
//               </span>
//             </motion.button>

//             {/* Mobile Menu Button */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="lg:hidden p-3 text-amber-100 hover:text-amber-400 transition-all duration-300"
//             >
//               {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </motion.button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="lg:hidden backdrop-blur-xl bg-slate-800/95 border-t border-amber-500/20"
//           >
//             <div className="px-4 py-4 space-y-2">
//               {categories.map((category, index) => (
//                 <motion.div
//                   key={category.name}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                 >
//                   <Link
//                     to={category.href}
//                     className="flex items-center px-4 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all duration-300 font-medium"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     <category.icon className="w-5 h-5 mr-3 text-amber-400" />
//                     {category.name}
//                   </Link>
//                 </motion.div>
//               ))}
//               <Link
//                 to="/shop"
//                 className="block px-4 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all duration-300 font-medium"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 Shop All
//               </Link>
//               <Link
//                 to="/new-arrivals"
//                 className="block px-4 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all duration-300 font-medium"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 New Arrivals
//               </Link>
//               <Link
//                 to="/bestsellers"
//                 className="block px-4 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all duration-300 font-medium"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 Bestsellers
//               </Link>
//               <Link
//                 to="/about"
//                 className="block px-4 py-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all duration-300 font-medium"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 About
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Search Bar */}
//       <AnimatePresence>
//         {isSearchOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="backdrop-blur-xl bg-slate-800/95 border-t border-amber-500/20"
//           >
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//               <form onSubmit={handleSearch} className="relative">
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search luxury products, collections, and more..."
//                   className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-amber-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-100 placeholder-amber-300/50 backdrop-blur-sm"
//                   autoFocus
//                 />
//                 <Search className="absolute left-4 top-4 w-5 h-5 text-amber-400" />
//                 <motion.button
//                   type="submit"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="absolute right-2 top-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-2 rounded-xl font-bold hover:from-amber-500 hover:to-amber-700"
//                 >
//                   Search
//                 </motion.button>
//               </form>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// };

// export default Navbar;
