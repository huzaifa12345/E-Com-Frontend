// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { 
//   X, 
//   Plus, 
//   Minus, 
//   Trash2, 
//   ShoppingCart,
//   ArrowRight
// } from 'lucide-react';

// const MiniCart = () => {
//   const { 
//     items, 
//     isOpen, 
//     setCartOpen, 
//     removeFromCart, 
//     updateQuantity, 
//     getCartTotal,
//     getCartItemsCount 
//   } = useCart();

//   const handleRemoveItem = (productId) => {
//     removeFromCart(productId);
//   };

//   const handleQuantityChange = (productId, newQuantity) => {
//     updateQuantity(productId, newQuantity);
//   };

//   const subtotal = getCartTotal();
//   const shipping = subtotal > 50 ? 0 : 9.99;
//   const total = subtotal + shipping;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setCartOpen(false)}
//             className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           />
          
//           {/* Cart Drawer */}
//           <motion.div
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//             className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <div className="flex items-center">
//                 <ShoppingCart className="w-6 h-6 mr-2 text-gray-700" />
//                 <h2 className="text-lg font-semibold">
//                   Shopping Cart ({getCartItemsCount()})
//                 </h2>
//               </div>
//               <button
//                 onClick={() => setCartOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Cart Items */}
//             <div className="flex-1 overflow-y-auto p-4">
//               {items.length === 0 ? (
//                 <div className="text-center py-12">
//                   <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
//                   <p className="text-gray-500 mb-6">Add some products to get started!</p>
//                   <Link
//                     to="/shop"
//                     onClick={() => setCartOpen(false)}
//                     className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Continue Shopping
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {items.map((item) => (
//                     <motion.div
//                       key={item.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="flex gap-4 bg-gray-50 rounded-lg p-3"
//                     >
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-20 h-20 object-cover rounded-lg"
//                       />
//                       <div className="flex-1">
//                         <h4 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h4>
//                         <p className="text-gray-500 text-xs mb-2">{item.description}</p>
//                         <div className="flex items-center justify-between">
//                           <span className="font-semibold text-gray-900">${item.price}</span>
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                               className="p-1 hover:bg-gray-200 rounded"
//                             >
//                               <Minus className="w-3 h-3" />
//                             </button>
//                             <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
//                             <button
//                               onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                               className="p-1 hover:bg-gray-200 rounded"
//                             >
//                               <Plus className="w-3 h-3" />
//                             </button>
//                             <button
//                               onClick={() => handleRemoveItem(item.id)}
//                               className="p-1 hover:bg-red-100 text-red-500 rounded ml-2"
//                             >
//                               <Trash2 className="w-3 h-3" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             {items.length > 0 && (
//               <div className="border-t p-4 space-y-4">
//                 {/* Order Summary */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Subtotal</span>
//                     <span className="font-medium">${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Shipping</span>
//                     <span className="font-medium">
//                       {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
//                     </span>
//                   </div>
//                   {shipping > 0 && (
//                     <p className="text-xs text-green-600">
//                       Add ${(50 - subtotal).toFixed(2)} more for free shipping!
//                     </p>
//                   )}
//                   <div className="flex justify-between text-lg font-semibold pt-2 border-t">
//                     <span>Total</span>
//                     <span>${total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="space-y-2">
//                   <Link
//                     to="/checkout"
//                     onClick={() => setCartOpen(false)}
//                     className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
//                   >
//                     Proceed to Checkout
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </Link>
//                   <Link
//                     to="/cart"
//                     onClick={() => setCartOpen(false)}
//                     className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
//                   >
//                     View Cart
//                   </Link>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default MiniCart;
