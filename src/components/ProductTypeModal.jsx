import { useState } from 'react';
import { Package, Users } from 'lucide-react';

const ProductTypeModal = ({ onSelect, onClose }) => {
  return (
    <>
      <div className="modal-backdrop show" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 1040 
      }}></div>
      <div className="modal fade show" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 1050, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <div className="modal-dialog" style={{ margin: 'auto' }}>
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">Select Product Type</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div 
                    className="card h-100 cursor-pointer product-type-card"
                    onClick={() => onSelect('single')}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-body text-center">
                      <Package size={48} className="mb-3" style={{ color: '#f26522' }} />
                      <h5 className="card-title">Single Size Product</h5>
                      <p className="card-text text-muted">
                        Product with individual sizes and quantities
                      </p>
                      <ul className="list-unstyled text-start">
                        <li><small>✓ Add sizes individually</small></li>
                        <li><small>✓ Set quantity per size</small></li>
                        <li><small>✓ Size-specific inventory</small></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div 
                    className="card h-100 cursor-pointer product-type-card"
                    onClick={() => onSelect('all')}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-body text-center">
                      <Users size={48} className="mb-3" style={{ color: '#f26522' }} />
                      <h5 className="card-title">All Size Product</h5>
                      <p className="card-text text-muted">
                        Product with same quantity for all sizes
                      </p>
                      <ul className="list-unstyled text-start">
                        <li><small>✓ Set one quantity for all</small></li>
                        <li><small>✓ Auto-apply to all sizes</small></li>
                        <li><small>✓ Quick inventory setup</small></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductTypeModal;
