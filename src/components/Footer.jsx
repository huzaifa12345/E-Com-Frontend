// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { 
//   Facebook, 
//   Twitter, 
//   Instagram, 
//   Youtube, 
//   Mail, 
//   Phone, 
//   MapPin,
//   CreditCard,
//   Shield,
//   Truck,
//   RefreshCw
// } from 'lucide-react';

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   const footerLinks = {
//     shop: [
//       { name: 'All Products', href: '/shop' },
//       { name: 'New Arrivals', href: '/shop?sort=new' },
//       { name: 'Best Sellers', href: '/shop?sort=popular' },
//       { name: 'Sale', href: '/shop?sort=sale' },
//       { name: 'Gift Cards', href: '/gift-cards' },
//     ],
//     help: [
//       { name: 'Customer Service', href: '/help' },
//       { name: 'Shipping Info', href: '/shipping' },
//       { name: 'Returns', href: '/returns' },
//       { name: 'Order Status', href: '/order-status' },
//       { name: 'Size Guide', href: '/size-guide' },
//     ],
//     about: [
//       { name: 'Our Story', href: '/about' },
//       { name: 'Careers', href: '/careers' },
//       { name: 'Press', href: '/press' },
//       { name: 'Sustainability', href: '/sustainability' },
//       { name: 'Affiliates', href: '/affiliates' },
//     ],
//     legal: [
//       { name: 'Privacy Policy', href: '/privacy' },
//       { name: 'Terms of Service', href: '/terms' },
//       { name: 'Cookie Policy', href: '/cookies' },
//       { name: 'Accessibility', href: '/accessibility' },
//       { name: 'GDPR', href: '/gdpr' },
//     ],
//   };

//   const socialLinks = [
//     { icon: Facebook, href: '#', label: 'Facebook' },
//     { icon: Twitter, href: '#', label: 'Twitter' },
//     { icon: Instagram, href: '#', label: 'Instagram' },
//     { icon: Youtube, href: '#', label: 'YouTube' },
//   ];

//   const trustBadges = [
//     { icon: Shield, text: 'Secure Payment' },
//     { icon: Truck, text: 'Free Shipping' },
//     { icon: RefreshCw, text: 'Easy Returns' },
//     { icon: CreditCard, text: 'Multiple Payment Options' },
//   ];

//   return (
//     <footer className="bg-gray-900 text-white">
//       {/* Newsletter Section */}
//       <div className="bg-gray-800 py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center"
//           >
//             <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
//             <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
//               Subscribe to our newsletter for exclusive offers, new product alerts, and 10% off your first order.
//             </p>
//             <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//               >
//                 Subscribe
//               </motion.button>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Main Footer Content */}
//       <div className="py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
//             {/* Brand Column */}
//             <div className="lg:col-span-2">
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//               >
//                 <h3 className="text-2xl font-bold mb-4">ShopHub</h3>
//                 <p className="text-gray-300 mb-6">
//                   Your trusted online shopping destination for quality products at great prices.
//                 </p>
                
//                 {/* Contact Info */}
//                 <div className="space-y-3">
//                   <div className="flex items-center space-x-3">
//                     <Mail className="w-5 h-5 text-blue-400" />
//                     <span className="text-gray-300">support@shophub.com</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <Phone className="w-5 h-5 text-blue-400" />
//                     <span className="text-gray-300">1-800-SHOP-HUB</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <MapPin className="w-5 h-5 text-blue-400" />
//                     <span className="text-gray-300">123 Commerce St, NY 10001</span>
//                   </div>
//                 </div>

//                 {/* Social Links */}
//                 <div className="flex space-x-4 mt-6">
//                   {socialLinks.map((social) => (
//                     <motion.a
//                       key={social.label}
//                       href={social.href}
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
//                     >
//                       <social.icon className="w-5 h-5" />
//                     </motion.a>
//                   ))}
//                 </div>
//               </motion.div>
//             </div>

//             {/* Links Columns */}
//             {Object.entries(footerLinks).map(([category, links]) => (
//               <motion.div
//                 key={category}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: 0.1 }}
//               >
//                 <h4 className="text-lg font-semibold mb-4 capitalize">
//                   {category === 'help' ? 'Customer Care' : category}
//                 </h4>
//                 <ul className="space-y-2">
//                   {links.map((link) => (
//                     <li key={link.name}>
//                       <Link
//                         to={link.href}
//                         className="text-gray-300 hover:text-white transition-colors"
//                       >
//                         {link.name}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Trust Badges */}
//       <div className="border-t border-gray-800 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {trustBadges.map((badge, index) => (
//               <motion.div
//                 key={badge.text}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="flex flex-col items-center text-center"
//               >
//                 <badge.icon className="w-8 h-8 text-blue-400 mb-2" />
//                 <span className="text-sm text-gray-300">{badge.text}</span>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-800 py-6">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <p className="text-gray-400 text-sm mb-4 md:mb-0">
//               © {currentYear} ShopHub. All rights reserved.
//             </p>
//             <div className="flex space-x-6">
//               <img
//                 src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg"
//                 alt="Visa"
//                 className="w-8 h-5 opacity-60"
//               />
//               <img
//                 src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg"
//                 alt="Mastercard"
//                 className="w-8 h-5 opacity-60"
//               />
//               <img
//                 src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amex/amex-original.svg"
//                 alt="Amex"
//                 className="w-8 h-5 opacity-60"
//               />
//               <img
//                 src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/paypal/paypal-original.svg"
//                 alt="PayPal"
//                 className="w-8 h-5 opacity-60"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
