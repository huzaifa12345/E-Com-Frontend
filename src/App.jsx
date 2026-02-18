import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeHome from './pages/ThemeHome';
import DynamicCategory from './pages/DynamicCategory';
import ThemeProductDetail from './pages/ThemeProductDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import theme CSS
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/theme-fixes.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            {/* <ThemeNavbar /> */}
            <main>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/home" element={<ThemeHome />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/product/:id" element={<ThemeProductDetail />} />
                  <Route path="/product-detail/:id" element={<ProductDetail />} />
                  <Route path="/:categorySlug" element={<DynamicCategory />} />
                </Routes>
              </AnimatePresence>
            </main>
            {/* <Footer />
            <MiniCart /> */}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#f26522',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ff4b4b',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
