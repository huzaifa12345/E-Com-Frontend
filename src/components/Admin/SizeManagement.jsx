import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';

const SizeManagement = () => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState({ size: '', description: '' });
  const [editingSize, setEditingSize] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await themeApi.getSizes();
      setSizes(data);
    } catch (error) {
      toast.error('Failed to fetch sizes');
    } finally {
      setLoading(false);
    }
  };

  const addSize = async () => {
    if (!newSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.createSize(newSize);
      toast.success('Size added successfully!');
      setNewSize({ size: '', description: '' });
      fetchSizes();
    } catch (error) {
      toast.error('Failed to add size');
    }
  };

  const updateSize = async () => {
    if (!editingSize || !editingSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.updateSize(editingSize.id, editingSize);
      toast.success('Size updated successfully!');
      setEditingSize(null);
      fetchSizes();
    } catch (error) {
      toast.error('Failed to update size');
    }
  };

  const deleteSize = async (id) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
      try {
        await themeApi.deleteSize(id);
        toast.success('Size deleted successfully!');
        fetchSizes();
      } catch (error) {
        toast.error('Failed to delete size');
      }
    }
  };

  const startEdit = (size) => {
    setEditingSize({ ...size });
  };

  const cancelEdit = () => {
    setEditingSize(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="size-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <Package size={20} className="me-2" style={{ color: '#f26522' }} />
          Size Management
        </h4>
      </div>

      {/* Add New Size */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white" style={{ backgroundColor: '#f26522' }}>
          <h6 className="mb-0">Add New Size</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Size Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 2-3 years, 9-12 months"
                value={newSize.size}
                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Suitable for kids aged 2-3 years"
                value={newSize.description}
                onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
              />
            </div>
            <div className="col-12">
              <button
                className="btn btn-primary"
                onClick={addSize}
                style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
              >
                <Plus size={16} className="me-2" />
                Add Size
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sizes List */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h6 className="mb-0">Available Sizes ({sizes.length})</h6>
        </div>
        <div className="card-body">
          {sizes.length === 0 ? (
            <div className="text-center py-4">
              <Package size={48} className="text-muted mb-3" />
              <p className="text-muted">No sizes found. Add your first size above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Size Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.id}>
                      <td>{size.id}</td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editingSize.size}
                            onChange={(e) => setEditingSize({ ...editingSize, size: e.target.value })}
                          />
                        ) : (
                          <strong>{typeof size.size === 'string' ? size.size : JSON.stringify(size.size)}</strong>
                        )}
                      </td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editingSize.description || ''}
                            onChange={(e) => setEditingSize({ ...editingSize, description: e.target.value })}
                          />
                        ) : (
                          <span className="text-muted">{size.description || 'No description'}</span>
                        )}
                      </td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={updateSize}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={cancelEdit}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => startEdit(size)}
                              style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteSize(size.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeManagement;
