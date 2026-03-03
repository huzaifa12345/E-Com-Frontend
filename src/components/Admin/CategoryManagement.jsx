import { useState } from 'react';
import { Edit, Trash2, Plus, Tags } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import HierarchicalCategorySelector from '../HierarchicalCategorySelector.jsx';

const CategoryManagement = ({ categories, onCategoriesChange }) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent_id: null
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setSelectedParentCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      parent_id: null
    });
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setSelectedParentCategory(category.parent || null);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      parent_id: category.parent_id || null
    });
    setShowCategoryForm(true);
  };

  const handleParentCategorySelect = (category) => {
    setSelectedParentCategory(category);
    setCategoryForm(prev => ({
      ...prev,
      parent_id: category ? category.id : null
    }));
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await themeApi.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated successfully!');
      } else {
        await themeApi.createCategory(categoryForm);
        toast.success('Category created successfully!');
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      onCategoriesChange(); // Refresh categories list
    } catch (error) {
      toast.error('Failed to save category: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await themeApi.deleteCategory(categoryId);
        toast.success('Category deleted successfully!');
        onCategoriesChange(); // Refresh categories list
      } catch (error) {
        toast.error('Failed to delete category: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <>
    <div className="category-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Category Management</h4>
          <small className="text-muted">
            Create hierarchical categories: Season → Gender → Custom Category
          </small>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleAddCategory}
          style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
        >
          <Plus size={16} className="me-2" />
          Add Category
        </button>
      </div>

      {/* Category Structure Info */}
      <div className="alert alert-info mb-4">
        <h6 className="alert-heading">
          <i className="fas fa-info-circle me-2"></i>
          Category Structure Guide
        </h6>
        <div className="row">
          <div className="col-md-4">
            <strong>Level 1 - Seasons:</strong>
            <ul className="mb-0 small">
              <li>Winter, Summer</li>
              <li>No parent category</li>
            </ul>
          </div>
          <div className="col-md-4">
            <strong>Level 2 - Gender:</strong>
            <ul className="mb-0 small">
              <li>Boys, Girls</li>
              <li>Parent: Season</li>
            </ul>
          </div>
          <div className="col-md-4">
            <strong>Level 3 - Custom:</strong>
            <ul className="mb-0 small">
              <li>Fashion, School, Party Wear</li>
              <li>Parent: Gender</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <>
        <div className="modal-backdrop show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
        <div className="modal fade show" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCategoryForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="mb-3">Parent Category (Optional)</h6>
                  <HierarchicalCategorySelector 
                    onCategorySelect={handleParentCategorySelect}
                    selectedCategory={selectedParentCategory}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder={selectedParentCategory ? 
                      `Enter ${selectedParentCategory.level === 1 ? 'Gender' : selectedParentCategory.level === 2 ? 'Custom' : 'Season'} category name` : 
                      'Enter season name'
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Describe this category..."
                  />
                </div>
                {selectedParentCategory && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Category Level:</strong> {selectedParentCategory.level + 1}
                    <br />
                    <strong>Parent:</strong> {selectedParentCategory.name}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveCategory}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Categories List */}
      <div className="categories-list">
        <div className="row">
          {categories.map(category => (
            <div key={category.id} className="col-md-4 mb-4">
              <div className={`card ${category.parent_id ? 'border-secondary' : 'border-primary'}`}>
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center">
                    <Tags size={16} className="me-2" style={{ 
                      color: category.parent_id ? '#6c757d' : '#f26522' 
                    }} />
                    {category.name}
                    {category.parent_id && (
                      <span className="badge bg-secondary ms-2">L{category.level}</span>
                    )}
                  </h5>
                  <p className="card-text">{category.description}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      <strong>Category Code:</strong> <code>{String(category.sort_order || 0).padStart(2, '0')}</code>
                      {category.parent_id && (
                        <span className="ms-2">
                          <strong>Parent ID:</strong> {category.parent_id}
                        </span>
                      )}
                    </small>
                  </p>
                  <div className="d-flex justify-content-between">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEditCategory(category)}
                      style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCategory(category.id)}
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
    </div>
    </>
  );
};

export default CategoryManagement;
