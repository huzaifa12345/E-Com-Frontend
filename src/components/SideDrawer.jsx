import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  ShoppingBag,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import { useState, useEffect, useMemo } from 'react';
import { themeApi } from '../services/themeApi';
import './SideDrawer.css';

/** Flatten Level 1 seasons → unique Level 2 genders with merged Level 3 children */
function buildGenderCollections(roots = []) {
  const byName = new Map();

  roots.forEach((season) => {
    (season.children || []).forEach((gender) => {
      const key = (gender.name || '').trim().toLowerCase();
      if (!key) return;

      if (!byName.has(key)) {
        byName.set(key, {
          id: gender.id,
          name: gender.name.trim(),
          sort_order: gender.sort_order ?? 0,
          children: [...(gender.children || [])],
        });
        return;
      }

      const existing = byName.get(key);
      const seen = new Set(existing.children.map((c) => c.id));
      (gender.children || []).forEach((child) => {
        if (!seen.has(child.id)) {
          existing.children.push(child);
          seen.add(child.id);
        }
      });
    });
  });

  return Array.from(byName.values()).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
  );
}

function genderTone(name = '') {
  const n = name.toLowerCase();
  if (n.includes('boy')) return 'boys';
  if (n.includes('girl')) return 'girls';
  return 'default';
}

const SideDrawer = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const tree = await themeApi.getHierarchicalCategories();
        const roots = Array.isArray(tree) ? tree : [];
        setCategories(buildGenderCollections(roots));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const navigationItems = useMemo(
    () => [
      { id: 1, name: 'Home', icon: Home, path: '/' },
      { id: 2, name: 'All Products', icon: ShoppingBag, path: '/all-products' },
    ],
    []
  );

  const adminItems = useMemo(
    () => [{ id: 9, name: 'Admin Dashboard', icon: Settings, path: '/admin' }],
    []
  );

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const goToCategory = (id) => {
    navigate(`/category/${id}`);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sd-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="sd-drawer"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!isOpen}
      >
        <div className="sd-header">
          <div className="sd-brand">
            <p className="sd-brand-sub">Kids Colours</p>
            <h2 className="sd-brand-title">Shop Menu</h2>
          </div>
          <button type="button" className="sd-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sd-nav">
          <div className="sd-section">
            <h3 className="sd-section-title">Navigate</h3>
            <ul className="sd-list">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link to={item.path} onClick={onClose} className="sd-link">
                    <item.icon className="sd-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sd-section">
            <h3 className="sd-section-title">Collection</h3>
            {loadingCats && <p className="sd-empty">Loading styles…</p>}
            {!loadingCats && categories.length === 0 && (
              <p className="sd-empty">No collections yet</p>
            )}
            <ul className="sd-list">
              {categories.map((category) => {
                const open = expandedCategories.has(category.id);
                const tone = genderTone(category.name);
                const hasChildren = (category.children || []).length > 0;

                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className={`sd-gender sd-gender--${tone}${open ? ' is-open' : ''}`}
                      onClick={() => {
                        if (hasChildren) toggleCategoryExpansion(category.id);
                        else goToCategory(category.id);
                      }}
                      aria-expanded={hasChildren ? open : undefined}
                    >
                      <span className="sd-gender-left">
                        <span className="sd-gender-dot" aria-hidden />
                        <span className="sd-gender-name">{category.name}</span>
                      </span>
                      {hasChildren && <ChevronDown className="sd-chevron" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {open && hasChildren && (
                        <motion.ul
                          className="sd-children"
                          data-tone={tone}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                          {category.children
                            .slice()
                            .sort(
                              (a, b) =>
                                (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                                a.name.localeCompare(b.name)
                            )
                            .map((child) => (
                              <li key={child.id}>
                                <button
                                  type="button"
                                  className="sd-leaf"
                                  onClick={() => goToCategory(child.id)}
                                >
                                  {child.name}
                                </button>
                              </li>
                            ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {user?.role === 'admin' && (
            <div className="sd-section">
              <h3 className="sd-section-title">Admin</h3>
              <ul className="sd-list">
                {adminItems.map((item) => (
                  <li key={item.id}>
                    <Link to={item.path} onClick={onClose} className="sd-link">
                      <item.icon className="sd-icon" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sd-section">
            <h3 className="sd-section-title">Account</h3>
            <ul className="sd-list">
              <li>
                {user ? (
                  <button type="button" className="sd-btn" onClick={handleLogout}>
                    <LogOut className="sd-icon" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link to="/login" onClick={onClose} className="sd-btn">
                    <User className="sd-icon" />
                    <span>Login</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </nav>

        <div className="sd-footer">
          <img src={websiteLogo} alt="Kids Colours" className="sd-footer-logo" />
          <p className="sd-footer-copy">
            © 2026 Kids Colours Store
            <br />
            <span className="sd-footer-powered">Powered by Codebase Solutions</span>
          </p>
        </div>
      </motion.aside>
    </>
  );
};

export default SideDrawer;
