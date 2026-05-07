import { useState } from 'react';
import { ShoppingCart, Eye, X } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';

const OrderManagement = ({ orders, onOrdersChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await themeApi.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Order status updated successfully!');
      onOrdersChange(); // Refresh orders list
    } catch (error) {
      toast.error('Failed to update order status: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      processing: { color: 'info', text: 'Processing' },
      shipped: { color: 'primary', text: 'Shipped' },
      delivered: { color: 'success', text: 'Delivered' },
      cancelled: { color: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  return (
    <div className="order-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Order Management</h4>
      </div>

      {/* Orders List */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.shipping_address?.first_name} {order.shipping_address?.last_name || 'Guest'}</td>
                <td>{order.total_amount}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedOrder(order)}
                    style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <>
          <div className="modal-backdrop show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }} onClick={() => setSelectedOrder(null)}></div>
          <div className="modal fade show d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
            <div className="modal-dialog modal-lg" style={{ width: '90%', maxWidth: '1000px' }}>
              <div className="modal-content">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title text-white"><strong>Order Details</strong> - #{selectedOrder.id}</h5>
                  <div className="title">
                    <strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedOrder(null)}
                  ></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="row mb-3">
                  {/* <div className="col-md-6">
                    <strong>Customer:</strong> {selectedOrder.user?.first_name && selectedOrder.user?.last_name ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : 'Guest'}
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Phone:</strong> {selectedOrder.user?.phone || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> {getStatusBadge(selectedOrder.status)}
                  </div> */}
                  
                </div>

                <div className="mb-3">
                  <strong>Customer Details:</strong>
                  <div className="p-3 bg-light rounded">
                    {selectedOrder.shipping_address && typeof selectedOrder.shipping_address === 'object' ? (
                      <div>
                        <div><strong>Customer Name:</strong> {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name }</div>
                        <div><strong>Email:</strong> {selectedOrder.shipping_address.email || 'N/A'}</div>
                        <div><strong>Phone:</strong> {selectedOrder.shipping_address.phone || 'N/A'}</div>
                        <div><strong>Address:</strong> {selectedOrder.shipping_address.address || 'N/A'}</div>
                        <div><strong>City:</strong> {selectedOrder.shipping_address.city || 'N/A'}</div>
                        <div><strong>State:</strong> {selectedOrder.shipping_address.state || 'N/A'}</div>
                        <div><strong>Zip Code:</strong> {selectedOrder.shipping_address.zip_code || 'N/A'}</div>
                        <div><strong>Country:</strong> {selectedOrder.shipping_address.country || 'N/A'}</div>
                      </div>
                    ) : (
                      <p className="mb-0">{selectedOrder.shipping_address || 'N/A'}</p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Order Items:</strong>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items?.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.product_snapshot?.image_url && (
                                  <img 
                                    src={item.product_snapshot.image_url} 
                                    alt={item.product_snapshot?.name || item.product_name}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                  />
                                )}
                                <div>
                                  <div>{item.product_snapshot?.name || item.product_name}</div>
                                  {item.product_snapshot?.sku && (
                                    <small className="text-muted">SKU: {item.product_snapshot.sku}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info text-white">
                                {item.selected_size || 'N/A'}
                              </span>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{item.unit_price || item.price}</td>
                            <td>{item.total_price || (item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Payment Information:</strong>
                  <div className="card bg-light mt-2">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Payment Method:</strong> 
                          <span className="badge ms-2">
                            {selectedOrder.payment_method || 'N/A'}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <strong>Payment Status:</strong> 
                          <span className={`badge ms-2 ${
                            selectedOrder.payment_status === 'paid' ? 'bg-success' : 
                            selectedOrder.payment_status === 'completed' ? 'bg-success' : 
                            selectedOrder.payment_status === 'pending' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {selectedOrder.payment_status || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {/* COD ke ilawa baki tamam methods (bank_transfer, card, etc.) par details show hongi */}
{selectedOrder.payment_method !== 'cod' && (
  <div className="mt-3">
    <h6>Payment Details:</h6>
    <div className="row">
      <div className="col-md-6">
        <strong>Account Holder Name:</strong> {selectedOrder.account_holder_name || 'N/A'}
      </div>
      <div className="col-md-6">
        <strong>Account Number:</strong> {selectedOrder.account_number || 'N/A'}
      </div>
      {/* <div className="col-md-6">
        <strong>Transaction ID:</strong> {selectedOrder.transaction_id || 'N/A'}
      </div> */}
    </div>
    
    {selectedOrder.payment_screenshot && (
      <div className="mt-3">
        <strong>Payment Screenshot:</strong>
        <div className="mt-2">
          <img 
            src={selectedOrder.payment_screenshot.startsWith('http') 
              ? selectedOrder.payment_screenshot 
              : `http://localhost:3001${selectedOrder.payment_screenshot}`}
            alt="Payment Screenshot"
            style={{ 
              maxWidth: '300px', 
              maxHeight: '200px', 
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'block'
            }}
            className="img-fluid"
            onClick={() => {
              const imageUrl = selectedOrder.payment_screenshot.startsWith('http') 
                ? selectedOrder.payment_screenshot 
                : `http://localhost:3001${selectedOrder.payment_screenshot}`;
              window.open(imageUrl, '_blank');
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            title="Click to view full size"
            onError={(e) => {
              if (!e.target.src.includes('http://localhost:3001')) {
                e.target.src = `http://localhost:3001${selectedOrder.payment_screenshot}`;
              }
            }}
          />
          {/* <small className="text-muted d-block mt-1">
            {selectedOrder.payment_screenshot}
          </small> */}
        </div>
      </div>
    )}
  </div>
)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Order Summary:</strong>
                  <div className="card bg-light mt-2">
                    <div className="card-body">
                      <div className="row">
                        {/* <div className="col-md-6">
                          <strong>Subtotal:</strong> {selectedOrder.subtotal || '0.00'}
                        </div> */}
                        <div className="col-md-6">
                          <strong>Shipping:</strong> {selectedOrder.shipping_amount || '0.00'}
                        </div>
                        <div className="col-md-6">
                          <strong>Total :</strong> <span className="text-success fw-bold">{selectedOrder.subtotal || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Update Status:</strong>
                  <div className="d-flex gap-2 mt-2">
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'pending')}
                      disabled={selectedOrder.status === 'pending'}
                    >
                      Pending
                    </button>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                      disabled={selectedOrder.status === 'processing'}
                    >
                      Processing
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                      disabled={selectedOrder.status === 'shipped'}
                    >
                      Shipped
                    </button>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                      disabled={selectedOrder.status === 'delivered'}
                    >
                      Delivered
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                      disabled={selectedOrder.status === 'cancelled'}
                    >
                      Cancelled
                    </button>
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
    </div>
  );
};

export default OrderManagement;
