import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductTypeModal from '../components/ProductTypeModal';
import EnhancedSizeManager from '../components/EnhancedSizeManager';
import SizeManagement from '../components/Admin/SizeManagement';
import OrderManagement from '../components/Admin/OrderManagement';
import StockManagement from '../components/Admin/StockManagement';
import CategoryManagement from '../components/Admin/CategoryManagement';
import WebsiteSettings from '../components/Admin/WebsiteSettings';
import FailedEmails from '../components/Admin/FailedEmails';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Settings, 
  Menu, 
  X,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Search,
  Mail
} from 'lucide-react';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states for CRUD operations
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nextSku, setNextSku] = useState('001');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    images: [],
    status: 'active'
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productType, setProductType] = useState('single');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
            
      // Only fetch data if user is authenticated
      if (!isAuthenticated || !user) {
                setLoading(false);
        return;
      }

      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          themeApi.getProducts({ limit: 1000 }).catch(err => {
            console.error('Products API error:', err);
            return { products: [] };
          }),
          themeApi.getCategories().catch(err => {
            console.error('Categories API error:', err);
            return [];
          }),
          themeApi.getAllOrders().catch(err => {
            console.error('Orders API error:', err);
            return { orders: [] };
          })
        ]);
        console.log('API Response - Products:', productsRes);
        console.log('Products count from API:', productsRes.products?.length || 0);
        console.log('Pagination info:', productsRes.pagination);
        
        setProducts(productsRes.products || []);
        setCategories(categoriesRes || []);
        setOrders(ordersRes.orders || []);

        // Calculate stats
        const totalProducts = productsRes.products?.length || 0;
        console.log('Total products set in state:', totalProducts);
        const totalRevenue = ordersRes.orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

        setStats({
          totalProducts,
          totalOrders: ordersRes.orders?.length || 0,
          totalRevenue,
          totalUsers: 0 // Will be updated when users endpoint is ready
        });

      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          // Let the interceptor handle the redirect
        } else {
          toast.error('Failed to load admin data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Add user dependency to wait for AuthContext to load

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'categories', name: 'Categories', icon: Tags },
    { id: 'sizes', name: 'Sizes', icon: TrendingUp },
    // { id: 'stock', name: 'Stock Management', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    // { id: 'failed-emails', name: 'Failed Emails', icon: Mail },
    // { id: 'users', name: 'Users', icon: Users },
    { id: 'website-settings', name: 'Website Settings', icon: Settings },
    // { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await themeApi.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete product: ' + (error.response?.data?.error || error.message));
        console.error('Product delete error:', error);
      }
    }
  };

  const handleAddProduct = () => {
    setShowProductTypeModal(true);
  };

  // Fetch next SKU when adding new product
  const fetchNextSku = async () => {
    try {
      const skuData = await themeApi.getNextSKU();
      setNextSku(skuData.sku || '001');
    } catch (error) {
      console.error('Error fetching next SKU:', error);
      setNextSku('001');
    }
  };

  const handleProductTypeSelect = (type) => {
    setProductType(type);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: '',
      stock_quantity: '',
      image_url: '',
      sizes: [],
      status: 'active'
    });
    fetchNextSku(); // Fetch next SKU for new product
    setShowProductTypeModal(false);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || '',
      image_url: product.image_url || '',
      sizes: product.sizes || [],
      status: product.status || 'active'
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    try {
      // Ensure proper data types
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
        stock_quantity: parseInt(productForm.stock_quantity),
        category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
        image_url: uploadedImages.length > 0 ? uploadedImages[0] : productForm.image_url,
        images: uploadedImages,
        is_active: productForm.status === 'active',
        brand: productForm.brand
      };
      
      if (editingProduct) {
        await themeApi.updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        toast.success('Product updated successfully!');
      } else {
        // Use different API endpoints based on product type
        let newProduct;
        if (productType === 'single') {
          // For single size products, include the selected sizes
          newProduct = await themeApi.createSingleSizeProduct({
            ...productData,
            sizes: productForm.sizes || []
          });
          toast.success('Single size product created successfully!');
        } else {
          // For all size products, don't include sizes (will use all available sizes)
          newProduct = await themeApi.createAllSizeProduct(productData);
          toast.success('All size product created successfully!');
        }
        setProducts([...products, newProduct]);
        // Fetch next SKU for next product creation
        fetchNextSku();
      }
      setShowProductForm(false);
      setUploadedImages([]);
    } catch (error) {
      toast.error('Failed to save product: ' + (error.response?.data?.error || error.message));
      console.error('Product save error:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders(); // Refresh orders
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const result = await themeApi.uploadImages(Array.from(files));
      setUploadedImages(prev => [...prev, ...result.images]);
      toast.success(`${result.images.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="row">
      {/* Stats Cards - Kids Colours Theme */}
      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card" style={{ backgroundColor: '#f26522', color: 'white' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0">Total Products</h5>
                <h2 className="mb-0">{stats.totalProducts || 0}</h2>
              </div>
              <div className="col-auto">
                <Package size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card" style={{ backgroundColor: '#007bff', color: 'white' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0">Total Orders</h5>
                <h2 className="mb-0">{stats.totalOrders || 0}</h2>
              </div>
              <div className="col-auto">
                <ShoppingCart size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card" style={{ backgroundColor: '#28a745', color: 'white' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0">Total Revenue</h5>
                <h2 className="mb-0">{(stats.totalRevenue || 0).toFixed(2)}</h2>
              </div>
              <div className="col-auto">
                <DollarSign size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#262626', color: 'white' }}>
            <h5 className="mb-0" style={{ color: 'white' }}>Top Products</h5>
          </div>
          <div className="card-body">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
              >
                <div className="d-flex align-items-center flex-grow-1">
                  <img
                    src={product.image_url || '/src/assets/images/tshirt-img.png'}
                    alt={product.name}
                    className="rounded"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', marginRight: '14px' }}
                  />
                  <div className="overflow-hidden">
                    <h6 className="mb-1 text-truncate" style={{ maxWidth: '220px' }}>
                      {product.name}
                    </h6>
                    {/* <small className="text-muted d-block">
                      Rs. {Number(product.price || 0).toFixed(2)}
                    </small> */}
                  </div>
                </div>
                <span
                  className="ms-3"
                  style={{ color: '#f26522', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  Rs. {Number(product.price || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#262626', color: 'white' }}>
            <h5 className="mb-0" style={{ color: 'white' }}>Categories</h5>
          </div>
          <div className="card-body">
            {categories.map((category) => (
              <div key={category.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center">
                  <Tags size={20} className="me-3" style={{ color: '#f26522' }} />
                  <div>
                    <h6 className="mb-1">{category.name}</h6>
                    <small className="text-muted">{category.description || 'No description'}</small>
                  </div>
                </div>
                {/* <span className="badge badge-primary">{category.product_count || 0} products</span> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#262626', color: 'white' }}>
            <h5 className="mb-0" style={{color: 'white'}}>Products Management</h5>
            <div className="d-flex align-items-center">
              <div className="input-group me-3" style={{ width: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary">
                    <Search size={16} />
                  </button>
                </div>
              </div>
              <button 
                className="btn" 
                style={{ backgroundColor: '#f26522', color: 'white' }}
                onClick={handleAddProduct}
              >
                <Plus size={16} className="mr-2" />
                Add Product
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Category</th>
                    <th className="text-center">Price</th>
                    {/* <th className="text-center">Stock</th> */}
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={product.image_url || '/src/assets/images/tshirt-img.png'} 
                              alt={product.name} 
                              className="rounded me-3" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-0">{product.name}</h6>
                              {product.description && (
                                <small className="text-muted d-block">
                                  {product.description.substring(0, 50)}
                                  {product.description.length > 50 && '...'}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{product.category_relation?.name || 'N/A'}</td>
                        <td className="text-center">
                          {product.discount_price ? (
                            <>
                              <span className="text-decoration-line-through text-muted">Rs. {Number(product.price || 0).toFixed(2)}</span>
                              <br />
                              <span className="text-success fw-bold">Rs. {Number(product.discount_price).toFixed(2)}</span>
                              <br />
                              <small className="text-danger">
                                -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                              </small>
                            </>
                          ) : (
                            <span>Rs. {Number(product.price || 0).toFixed(2)}</span>
                          )}
                        </td>
                        {/* <td className="text-center text-white">
                          <span className={`badge ${product.stock_quantity > 10 ? 'bg-success' : 'bg-danger'}`}>
                            {product.stock_quantity}
                          </span>
                        </td> */}
                        <td className="text-center text-white">
                          <span className={`badge ${product.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group justify-content-center">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-orange" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly={true}>
      <div>
        {/* Header Section - Kids Colours Theme */}
        <div className="container">
          <div className="header_section_top">
            <div className="row">
              <div className="col-sm-12">
                <div className="custom_menu"
                style={{backgroundColor: 'black'}}>
                  <ul>
                    <li><Link to="/admin">Dashboard</Link></li>
                    {/* <li><Link to="/admin/products">Products</Link></li>
                    <li><Link to="/admin/orders">Orders</Link></li>
                     */}
                    <li><Link to="/">Back to Store</Link></li>
                    <li><Link to="/login">Logout</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div>
        <div className="container">
          <div className="row">
           
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-md-3 ${sidebarOpen ? '' : 'd-none'}`}>
            <div className="card">
              {/* <div className="card-header" style={{ backgroundColor: '#262626', color: 'white' }}>
                <h5 className="text-center" style={{ color: 'white' }}>Admin Menu</h5>
              </div> */}
              <div className="list-group list-group-flush">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`list-group-item list-group-item-action d-flex align-items-center ${
                      activeTab === item.id ? 'active' : ''
                    }`}
                    style={activeTab === item.id ? { backgroundColor: '#f26522', borderColor: '#f26522' } : {}}
                  >
                    <item.icon size={16} className="me-3" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`col-md-9 ${sidebarOpen ? '' : 'col-12'}`}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-outline-secondary"
              >
                <Menu size={16} />
              </button>
              <h2 className="text-capitalize">{activeTab}</h2>
            </div>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'categories' && (
              <CategoryManagement 
                categories={categories} 
                onCategoriesChange={() => {
                  // Refresh categories
                  const fetchData = async () => {
                    try {
                      const categoriesRes = await themeApi.getCategories();
                      setCategories(categoriesRes);
                    } catch (error) {
                      console.error('Error fetching categories:', error);
                      toast.error('Failed to fetch categories');
                    }
                  };
                  fetchData();
                }} 
              />
            )}
            {activeTab === 'sizes' && <SizeManagement />}
            {/* {activeTab === 'stock' && <StockManagement />} */}
            {activeTab === 'orders' && <OrderManagement orders={orders} onOrdersChange={() => {
                  // Refresh orders
                  const fetchData = async () => {
                    try {
                      const ordersRes = await themeApi.getAllOrders();
                      setOrders(ordersRes.orders || []);
                    } catch (error) {
                      console.error('Error fetching orders:', error);
                      toast.error('Failed to fetch orders');
                    }
                  };
                  fetchData();
                }} />}
            {activeTab === 'failed-emails' && <FailedEmails />}
            {activeTab === 'website-settings' && <WebsiteSettings />}
            {activeTab === 'users' && (
              <div className="text-center py-5">
                <Users size={48} className="mb-3" style={{ color: '#f26522' }} />
                <h3>Users Management</h3>
                <p className="text-muted">Coming soon...</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-5">
                <Settings size={48} className="mb-3" style={{ color: '#f26522' }} />
                <h3>Settings</h3>
                <p className="text-muted">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <>
          <div className="modal-backdrop show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
          <div className="modal fade show" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto'
          }}>
            <div className="modal-dialog modal-lg" style={{ margin: 'auto', maxHeight: '95vh' }}>
              <div className="modal-content" style={{ maxHeight: '95vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowProductForm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">SKU (Auto-generated)</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={editingProduct ? editingProduct.sku || 'N/A' : nextSku}
                        disabled
                        readOnly
                      />
                      <small className="text-muted">
                        {editingProduct ? 'Existing SKU cannot be changed' : `Next SKU: ${nextSku}`}
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Discount Price (Optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.discount_price}
                        onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                        placeholder="Leave empty for no discount"
                      />
                    </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {(() => {
                        // Get all Level 3 categories with their full hierarchy path
                        const level3Categories = categories.filter(cat => cat.level === 3);
                        
                        return level3Categories.map(category => {
                          // Find parent (Level 2 - Gender)
                          const gender = categories.find(cat => cat.id === category.parent_id);
                          if (!gender) return null;
                          
                          // Find grandparent (Level 1 - Season)
                          const season = categories.find(cat => cat.id === gender.parent_id);
                          if (!season) return null;
                          
                          const displayName = `${season.name} → ${gender.name} → ${category.name}`;
                          
                          return (
                            <option key={category.id} value={category.id}>
                              {displayName}
                            </option>
                          );
                        }).filter(Boolean);
                      })()}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <EnhancedSizeManager 
                      productType={productType}
                      sizes={productForm.sizes || []}
                      onChange={(sizes) => setProductForm({ ...productForm, sizes })}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Product Images (Max 4 images)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                    />
                    <small className="text-muted">
                      Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)
                    </small>
                  </div>
                  
                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="col-12 mb-3">
                      <label className="form-label">Uploaded Images</label>
                      <div className="row">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="col-md-3 col-sm-6 mb-2">
                            <div className="position-relative">
                              <img 
                                src={image} 
                                alt={`Upload ${index + 1}`}
                                className="img-fluid rounded"
                                style={{ height: '100px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                onClick={() => removeUploadedImage(index)}
                                style={{ borderRadius: '50%', width: '25px', height: '25px', padding: '0' }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">Or Image URL (Fallback)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter image URL if not uploading files"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowProductForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  style={{ backgroundColor: '#f26522', color: 'white' }}
                  onClick={handleSaveProduct}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <>
          <div className="modal-backdrop show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
          <div className="modal fade show" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto'
          }}>
            <div className="modal-dialog modal-lg" style={{ margin: 'auto', maxHeight: '95vh' }}>
              <div className="modal-content" style={{ maxHeight: '95vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <div className="modal-header">
                  <h5 className="modal-title">Order Details - #{selectedOrder.order_number}</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setSelectedOrder(null)}
                  ></button>
                </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p>
                      <strong>Name:</strong> {selectedOrder.user ? 
                        `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : 
                        `${selectedOrder.shipping_address?.first_name} ${selectedOrder.shipping_address?.last_name}`
                      }<br/>
                      <strong>Email:</strong> {selectedOrder.user?.email || selectedOrder.shipping_address?.email}<br/>
                      <strong>Phone:</strong> {selectedOrder.shipping_address?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p>
                      <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}<br/>
                      <strong>Status:</strong> <span className={`badge ${
                        selectedOrder.status === 'delivered' ? 'bg-success' :
                        selectedOrder.status === 'cancelled' ? 'bg-danger' :
                        selectedOrder.status === 'shipped' ? 'bg-info' :
                        'bg-warning'
                      }`}>{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span><br/>
                      <strong>Payment Method:</strong> {selectedOrder.payment_method?.charAt(0).toUpperCase() + selectedOrder.payment_method?.slice(1) || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <h6 className="mt-3">Shipping Address</h6>
                <p>
                  {selectedOrder.shipping_address?.address}<br/>
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}<br/>
                  {selectedOrder.shipping_address?.postal_code}<br/>
                  {selectedOrder.shipping_address?.country}
                </p>

                <h6 className="mt-3">Order Items</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6 offset-md-6">
                    <table className="table table-sm">
                      <tr>
                        <td>Subtotal:</td>
                        <td>{selectedOrder.subtotal}</td>
                      </tr>
                      <tr>
                        <td>Shipping:</td>
                        <td>{selectedOrder.shipping_amount}</td>
                      </tr>
                      <tr>
                        <th>Total:</th>
                        <th>{selectedOrder.total_amount}</th>
                      </tr>
                    </table>
                  </div>
                </div>

                <div className="mt-3">
                  <h6>Update Status</h6>
                  <div className="btn-group" role="group">
                    {selectedOrder.status !== 'pending' && (
                      <button 
                        className="btn btn-warning"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'pending');
                          setSelectedOrder({...selectedOrder, status: 'pending'});
                        }}
                      >
                        Pending
                      </button>
                    )}
                    {selectedOrder.status !== 'processing' && (
                      <button 
                        className="btn btn-info"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'processing');
                          setSelectedOrder({...selectedOrder, status: 'processing'});
                        }}
                      >
                        Processing
                      </button>
                    )}
                    {selectedOrder.status !== 'shipped' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'shipped');
                          setSelectedOrder({...selectedOrder, status: 'shipped'});
                        }}
                      >
                        Shipped
                      </button>
                    )}
                    {selectedOrder.status !== 'delivered' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'delivered');
                          setSelectedOrder({...selectedOrder, status: 'delivered'});
                        }}
                      >
                        Delivered
                      </button>
                    )}
                    {selectedOrder.status !== 'cancelled' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'cancelled');
                          setSelectedOrder({...selectedOrder, status: 'cancelled'});
                        }}
                      >
                        Cancelled
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
      
      {/* Product Type Modal */}
      {showProductTypeModal && (
        <ProductTypeModal
          onSelect={handleProductTypeSelect}
          onClose={() => setShowProductTypeModal(false)}
        />
      )}
    </div>
    </ProtectedRoute>
  );
};

export default Admin;
