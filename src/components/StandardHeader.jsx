import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SideDrawer from './SideDrawer';

const StandardHeader = () => {
  const { getCartItemsCount } = useCart();
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  return (
    <>
      {/* Clean Standard Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Kids Colours
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/shop" className="text-gray-600 hover:text-gray-900">Shop</Link>
              <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
                Cart
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>
              <Link to="/checkout" className="text-gray-600 hover:text-gray-900">Checkout</Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
              <button 
                onClick={() => setSideDrawerOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Drawer */}
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </>
  );
};

export default StandardHeader;
