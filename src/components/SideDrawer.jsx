import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { 
  X, 
  Home, 
  ShoppingBag, 
  Tags, 
  ShoppingCart, 
  CreditCard, 
  User, 
  Settings,
  Package,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import { useState, useEffect } from 'react';
import { themeApi } from '../services/themeApi';

const SideDrawer = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  // Fetch hierarchical categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await themeApi.getHierarchicalCategories();
        // Only show Level 1 (Season) categories initially
        const level1Categories = categoriesData.filter(cat => cat.level === 1);
        setCategories(level1Categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const toggleCategoryExpansion = async (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    
    if (newExpanded.has(categoryId)) {
      // Collapse category
      newExpanded.delete(categoryId);
    } else {
      // Expand category - fetch children if not already loaded
      newExpanded.add(categoryId);
      
      // Fetch child categories if not already loaded
      const category = categories.find(cat => cat.id === categoryId);
      if (category && (!category.children || category.children.length === 0)) {
        try {
          const allCategories = await themeApi.getHierarchicalCategories();
          const updatedCategories = categories.map(cat => {
            if (cat.id === categoryId) {
              const children = allCategories.filter(c => c.parent_id === categoryId);
              return { ...cat, children };
            }
            return cat;
          });
          setCategories(updatedCategories);
        } catch (error) {
          console.error('Error fetching child categories:', error);
        }
      }
    }
    
    setExpandedCategories(newExpanded);
  };

  const renderCategoryChildren = (children, level = 2) => {
    if (!children || children.length === 0) return null;
    
    return children.map(child => (
      <li key={child.id} style={{ marginBottom: '2px' }}>
        <div
          style={{
            ...linkStyle,
            paddingLeft: `${level * 16}px`,
            fontSize: level === 2 ? '13px' : '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (child.level < 3) {
              toggleCategoryExpansion(child.id);
            } else {
              // Navigate to Level 3 category
              navigate(`/category/${child.id}`);
              onClose();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
            e.currentTarget.style.color = '#ffffff';
            const icon = e.currentTarget.querySelector('svg:last-child');
            if (icon) icon.style.color = '#f26522';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#d1d5db';
            const icon = e.currentTarget.querySelector('svg:last-child');
            if (icon) icon.style.color = '#6b7280';
          }}
        >
          {child.level < 3 ? (
            expandedCategories.has(child.id) ? 
              <ChevronDown style={{ ...iconStyle, marginRight: '8px', width: '14px', height: '14px' }} /> :
              <ChevronRight style={{ ...iconStyle, marginRight: '8px', width: '14px', height: '14px' }} />
          ) : (
            <div style={{ width: '22px', display: 'inline-block' }} />
          )}
          <span style={{ fontWeight: level === 2 ? '500' : '400' }}>{child.name}</span>
        </div>
        {expandedCategories.has(child.id) && child.children && (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {renderCategoryChildren(child.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };
  const navigationItems = [
    { id: 1, name: 'Home', icon: Home, path: '/' },
    { id: 2, name: 'All Products', icon: ShoppingBag, path: '/all-products' },
    // { id: 3, name: 'My Cart', icon: ShoppingCart, path: '/cart' },
    // { id: 4, name: 'My Orders', icon: Package, path: '/orders' },
  ];

  const adminItems = [
    { id: 9, name: 'Admin Dashboard', icon: Settings, path: '/admin' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      onClose(); // Close the drawer
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const drawerStyle = {
    width: window.innerWidth < 768 ? '80%' : '300px',
    backgroundColor: '#111827',
    zIndex: 9999,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  };

  const navStyle = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: '#4b5563 #1f2937'
  };

  const navStyleWebkit = {
    ...navStyle,
    '&::-webkit-scrollbar': {
      width: '6px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#1f2937'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#4b5563',
      borderRadius: '3px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#6b7280'
    }
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 9998
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: window.innerWidth < 768 ? '12px 16px' : '16px',
    borderBottom: '1px solid #374151',
    minHeight: '60px'
  };

  const navSectionStyle = {
    padding: window.innerWidth < 768 ? '12px 16px' : '16px',
    borderBottom: window.innerWidth < 768 ? '1px solid #374151' : 'none'
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: window.innerWidth < 768 ? '12px 16px' : '12px',
    color: '#d1d5db',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    minHeight: window.innerWidth < 768 ? '44px' : '40px',
    fontSize: window.innerWidth < 768 ? '16px' : '14px'
  };

  const linkHoverStyle = {
    backgroundColor: '#1f2937',
    color: '#ffffff'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: window.innerWidth < 768 ? '12px 16px' : '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: window.innerWidth < 768 ? '44px' : '40px',
    fontSize: window.innerWidth < 768 ? '16px' : '14px',
    width: '100%'
  };

  const iconStyle = {
    width: window.innerWidth < 768 ? '24px' : '20px',
    height: window.innerWidth < 768 ? '24px' : '20px',
    marginRight: window.innerWidth < 768 ? '16px' : '12px',
    color: '#6b7280',
    flexShrink: 0
  };

  const sectionTitleStyle = {
    fontSize: window.innerWidth < 768 ? '12px' : '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: window.innerWidth < 768 ? '12px' : '8px'
  };

  const footerStyle = {
    padding: window.innerWidth < 768 ? '12px 16px' : '16px',
    borderTop: '1px solid #374151',
    textAlign: 'center',
  };

  const logoStyle = {
    width: window.innerWidth < 768 ? '60px' : '80px',
    height: 'auto',
    margin: '0 auto 8px'
  };

  const copyrightStyle = {
    fontSize: window.innerWidth < 768 ? '11px' : '10px',
    color: '#6b7280'
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          style={overlayStyle}
          onClick={onClose}
        />
      )}
      
      {/* Side Drawer */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          ...drawerStyle,
          display: isOpen ? 'block' : 'none'
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ 
              fontSize: window.innerWidth < 768 ? '18px' : '16px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
            }}>
              Menu
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              padding: window.innerWidth < 768 ? '8px' : '6px',
              width: 'auto',
              minHeight: 'auto'
            }}
          >
            <X style={{ 
              width: window.innerWidth < 768 ? '24px' : '20px',
              height: window.innerWidth < 768 ? '24px' : '20px'
            }} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav 
          className="side-drawer-nav"
          style={{
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4b5563 #1f2937',
            maxHeight: 'calc(100vh - 200px)' // Force scrolling
          }}
        >
          <div style={navSectionStyle}>
            <h3 style={sectionTitleStyle}>
              Navigation
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {navigationItems.map((item) => (
                <li key={item.id} style={{ marginBottom: '4px' }}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.querySelector('svg').style.color = '#f26522';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                      e.currentTarget.querySelector('svg').style.color = '#6b7280';
                    }}
                  >
                    <item.icon style={iconStyle} />
                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collection Section */}
          <div style={navSectionStyle}>
            <h3 style={sectionTitleStyle}>
              Collection
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {categories.map((category) => (
                <li key={category.id} style={{ marginBottom: '2px' }}>
                  <div
                    style={{
                      ...linkStyle,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleCategoryExpansion(category.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.querySelector('svg:last-child').style.color = '#f26522';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                      e.currentTarget.querySelector('svg:last-child').style.color = '#6b7280';
                    }}
                  >
                    {expandedCategories.has(category.id) ? 
                      <ChevronDown style={{ ...iconStyle, marginRight: '8px', width: '14px', height: '14px' }} /> :
                      <ChevronRight style={{ ...iconStyle, marginRight: '8px', width: '14px', height: '14px' }} />
                    }
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                  </div>
                  {expandedCategories.has(category.id) && category.children && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {renderCategoryChildren(category.children, 2)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Section - Only show for admin users */}
          {user?.role === 'admin' && (
            <div style={navSectionStyle}>
              <h3 style={sectionTitleStyle}>
                Admin
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {adminItems.map((item) => (
                  <li key={item.id} style={{ marginBottom: '4px' }}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1f2937';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.querySelector('svg').style.color = '#f26522';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#d1d5db';
                        e.currentTarget.querySelector('svg').style.color = '#6b7280';
                      }}
                    >
                      <item.icon style={iconStyle} />
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Section */}
          <div style={navSectionStyle}>
            <h3 style={sectionTitleStyle}>
              Account
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ marginBottom: '4px' }}>
                {user ? (
                  <button
                    style={buttonStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.color = '#ffffff';
                      if (e.currentTarget.querySelector('svg')) {
                        e.currentTarget.querySelector('svg').style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                      if (e.currentTarget.querySelector('svg')) {
                        e.currentTarget.querySelector('svg').style.color = '#6b7280';
                      }
                    }}
                  >
                    <LogOut style={iconStyle} />
                    <span style={{ fontWeight: '500' }}>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={onClose}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.color = '#ffffff';
                      if (e.currentTarget.querySelector('svg')) {
                        e.currentTarget.querySelector('svg').style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                      if (e.currentTarget.querySelector('svg')) {
                        e.currentTarget.querySelector('svg').style.color = '#6b7280';
                      }
                    }}
                  >
                    <User style={iconStyle} />
                    <span style={{ fontWeight: '500' }}>Login</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Extra content to force scrolling */}
          {/* <div style={navSectionStyle}>
            <h3 style={sectionTitleStyle}>
              More Options
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>Settings</span>
                </div>
              </li>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>Help & Support</span>
                </div>
              </li>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>Privacy Policy</span>
                </div>
              </li>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>Terms of Service</span>
                </div>
              </li>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>About Us</span>
                </div>
              </li>
              <li style={{ marginBottom: '4px' }}>
                <div style={linkStyle}>
                  <span style={{ fontWeight: '500' }}>Contact</span>
                </div>
              </li>
            </ul>
          </div>*/}
        </nav> 

        {/* Footer */}
        <div style={footerStyle} className='mt-3'>
          <img 
            src={websiteLogo} 
            alt="Kids Colours" 
            style={logoStyle}
          />
          <p style={copyrightStyle}>© 2026 Kids Colours Store <br />
          <span className='text-orange'>Powered by Codebase Solutions</span></p>
          
        </div>
      </motion.div>
    </>
  );
};

export default SideDrawer;



