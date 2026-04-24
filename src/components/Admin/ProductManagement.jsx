import { useState } from 'react';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import ProductTypeModal from '../ProductTypeModal';
import EnhancedSizeManager from '../EnhancedSizeManager';

const ProductManagement = ({ products, categories, onProductsChange }) => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productType, setProductType] = useState('single');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    sizes: [],
    status: 'active'
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Filter only Level 3 categories (product categories)
  const getProductCategories = () => {
    return categories.filter(category => category.level === 3);
  };

  // Get hierarchical path for a category
  const getCategoryPath = (category) => {
    if (!category.parent_id) return category.name;
    
    // Find parent categories
    const parent = categories.find(cat => cat.id === category.parent_id);
    if (!parent) return category.name;
    
    const grandParent = categories.find(cat => cat.id === parent.parent_id);
    if (!grandParent) return `${parent.name} → ${category.name}`;
    
    return `${grandParent.name} → ${parent.name} → ${category.name}`;
  };

  const handleAddProduct = () => {
    setShowProductTypeModal(true);
  };

  const handleProductTypeSelect = (type) => {
    setProductType(type);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      stock_quantity: '',
      image_url: '',
      sizes: [],
      status: 'active'
    });
    setShowProductTypeModal(false);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
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
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
        category_id: productForm.category_id || null
      };

      if (editingProduct) {
        await themeApi.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        // Use different API endpoints based on product type
        if (productType === 'single') {
          // For single size products, include the selected sizes
          await themeApi.createSingleSizeProduct({
            ...productData,
            sizes: productForm.sizes || []
          });
          toast.success('Single size product created successfully!');
        } else {
          // For all size products, don't include sizes (will use all available sizes)
          await themeApi.createAllSizeProduct(productData);
          toast.success('All size product created successfully!');
        }
      }

      setShowProductForm(false);
      setEditingProduct(null);
      onProductsChange(); // Refresh products list
    } catch (error) {
      toast.error('Failed to save product: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await themeApi.deleteProduct(productId);
        toast.success('Product deleted successfully!');
        onProductsChange(); // Refresh products list
      } catch (error) {
        toast.error('Failed to delete product: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleImageUpload = async (files) => {
    if (files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const imageUrls = [];
      for (let file of files) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await themeApi.uploadImage(formData);
        imageUrls.push(response.url);
      }
      
      setUploadedImages(imageUrls);
      setProductForm({ ...productForm, images: imageUrls });
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="product-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Product Management</h4>
        <button 
          className="btn btn-primary"
          onClick={handleAddProduct}
          style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
        >
          <Plus size={16} className="me-2" />
          Add Product
        </button>
      </div>

      {/* Product Type Modal */}
      {showProductTypeModal && (
        <ProductTypeModal
          onSelect={handleProductTypeSelect}
          onClose={() => setShowProductTypeModal(false)}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <>
        <div className="modal-backdrop show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
        <div className="modal fade show" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
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
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Category</label>
                    <select
                      className="form-select"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    >
                      <option value="">Select Product Category</option>
                      {getProductCategories().map(category => (
                        <option key={category.id} value={category.id}>
                          {getCategoryPath(category)}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Only Level 3 categories (e.g., Winter → Boys → Fashion)
                    </small>
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
                    {uploadedImages.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Uploaded Images:</small>
                        <div className="d-flex gap-2 mt-1">
                          {uploadedImages.map((url, index) => (
                            <img key={index} src={url} alt={`Upload ${index + 1}`} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          ))}
                        </div>
                      </div>
                    )}
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
                  className="btn btn-primary"
                  onClick={handleSaveProduct}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Products List */}
      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card">
              {product.image_url && (
                <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
              )}
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                {product.sku && (
                  <p className="card-text mb-1">
                    <small className="text-muted">
                      <strong>SKU:</strong> <code>{product.sku}</code>
                    </small>
                  </p>
                )}
                <p className="card-text">{product.description}</p>
                {product.category_id && (
                  <p className="card-text">
                    <small className="text-muted">
                      <strong>Category:</strong> {(() => {
                        const category = categories.find(cat => cat.id === product.category_id);
                        return category && category.level === 3 ? getCategoryPath(category) : 'Unknown';
                      })()}
                    </small>
                  </p>
                )}
                <p className="card-text"><strong>Price: ${product.price}</strong></p>
                <p className="card-text"><strong>Stock: {product.stock_quantity}</strong></p>
                <div className="d-flex justify-content-between">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEditProduct(product)}
                    style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                  >
                    <Edit size={14} />
                  </button>b
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
