import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';

const EnhancedSizeManager = ({ productType, sizes, onChange }) => {
  const [newSize, setNewSize] = useState({ size: '', quantity: 1 });
  const [allSizesQuantity, setAllSizesQuantity] = useState(1);

  const commonSizes = ['9-12 months', '12-18 months', '18-24 months', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years', '9-10 years'];

  const addSize = () => {
    if (newSize.size && newSize.quantity > 0) {
      const updatedSizes = [...sizes, { ...newSize }];
      onChange(updatedSizes);
      setNewSize({ size: '', quantity: 1 });
    }
  };

  const removeSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onChange(updatedSizes);
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) => 
      i === index ? { ...size, [field]: field === 'quantity' ? parseInt(value) || 0 : value } : size
    );
    onChange(updatedSizes);
  };

  const applyToAllSizes = () => {
    if (allSizesQuantity > 0) {
      const updatedSizes = commonSizes.map(size => ({
        size,
        quantity: allSizesQuantity
      }));
      onChange(updatedSizes);
    }
  };

  if (productType === 'all') {
    return (
      <div className="enhanced-size-manager">
        <div className="card">
          <div className="card-header bg-orange text-white" style={{ backgroundColor: '#f26522' }}>
            <h6 className="mb-0">
              <Package size={16} className="me-2" />
              All Size Product - Same Quantity for All Sizes
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Quantity for All Sizes</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={allSizesQuantity}
                  onChange={(e) => setAllSizesQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
                <small className="text-muted">
                  This quantity will be applied to all sizes: {commonSizes.join(', ')}
                </small>
              </div>
              <div className="col-md-4">
                <label className="form-label">&nbsp;</label>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={applyToAllSizes}
                  disabled={allSizesQuantity <= 0}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  Apply to All Sizes
                </button>
              </div>
            </div>

            {sizes && sizes.length > 0 && (
              <div className="mt-3">
                <label className="form-label">Current Sizes</label>
                <div className="row">
                  {sizes.map((sizeItem, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="card">
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{sizeItem.size}</span>
                            <span className="badge bg-success">{sizeItem.quantity} units</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2">
              <small className="text-muted">
                JSON Preview: {JSON.stringify(sizes || [])}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single Size Product (original functionality)
  return (
    <div className="enhanced-size-manager">
      <div className="card">
        <div className="card-header bg-orange text-white" style={{ backgroundColor: '#f26522' }}>
          <h6 className="mb-0">
            <Package size={16} className="me-2" />
            Single Size Product - Individual Size Management
          </h6>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Add Sizes</label>
            <div className="row g-2">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={newSize.size}
                  onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                >
                  <option value="">Select size</option>
                  {commonSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  min="1"
                  value={newSize.quantity}
                  onChange={(e) => setNewSize({ ...newSize, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={addSize}
                  disabled={!newSize.size || newSize.quantity <= 0}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {sizes && sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Current Sizes</label>
              <div className="row">
                {sizes.map((sizeItem, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <div className="card">
                      <div className="card-body p-2">
                        <div className="row g-2">
                          <div className="col-6">
                            <select
                              className="form-select form-select-sm"
                              value={sizeItem.size}
                              onChange={(e) => updateSize(index, 'size', e.target.value)}
                            >
                              {commonSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-4">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="0"
                              value={sizeItem.quantity}
                              onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                            />
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm w-100"
                              onClick={() => removeSize(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">
                            Size: {sizeItem.size} | Quantity: {sizeItem.quantity}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2">
            <small className="text-muted">
              JSON Preview: {JSON.stringify(sizes || [])}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSizeManager;
