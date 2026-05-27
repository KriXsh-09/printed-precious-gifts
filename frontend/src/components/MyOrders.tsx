import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase, isPlaceholderClient } from '../lib/supabase';

interface Order {
  id: string;
  user_id: string;
  user_email: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  product_id: number;
  product_title: string;
  product_image: string | null;
  selected_size: string;
  custom_photo_url: string | null;
  price: number;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface MyOrdersProps {
  userId: string;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isPlaceholderClient) {
          console.log('[MyOrders Mock] Fetching orders for user:', userId);
          setOrders([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="my-orders-container">
      {/* Nav Header */}
      <div className="my-orders-nav-header">
        <a href="#" className="back-home-btn">
          <Icons.ArrowLeft size={16} />
          <span>Back to Home</span>
        </a>
      </div>

      <div className="my-orders-header">
        <div className="my-orders-header-icon">
          <Icons.Package size={28} />
        </div>
        <div>
          <h1 className="my-orders-title">My Orders</h1>
          <p className="my-orders-subtitle">Track your customized 3D-printed creations and their delivery status.</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="my-orders-loading">
          <Icons.Loader size={24} className="spinner" />
          <span>Loading your orders...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="my-orders-error">
          <Icons.AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="my-orders-empty">
          <Icons.PackageOpen size={56} className="empty-orders-icon" />
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet. Browse our collection to find your perfect customized 3D-printed gift!</p>
          <a href="#" className="my-orders-shop-btn">
            <Icons.ShoppingBag size={16} />
            <span>Start Shopping</span>
          </a>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="my-orders-list">
          {orders.map((order) => (
            <div key={order.id} className="my-order-card">
              <div className="my-order-card-top">
                <div className="my-order-product-info">
                  {order.product_image && (
                    <img
                      src={order.product_image}
                      alt={order.product_title}
                      className="my-order-product-img"
                    />
                  )}
                  <div className="my-order-details">
                    <h4 className="my-order-product-title">{order.product_title}</h4>
                    <div className="my-order-meta-badges">
                      <span className="my-order-size-badge">
                        <Icons.Ruler size={12} />
                        {order.selected_size}
                      </span>
                      {order.custom_photo_url && (
                        <span className="my-order-custom-badge">
                          <Icons.ImageIcon size={12} />
                          Custom Photo
                        </span>
                      )}
                    </div>
                    <p className="my-order-price">₹{Number(order.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="my-order-status-section">
                  <span className={`my-order-status-badge ${order.status}`}>
                    {order.status === 'pending' && (
                      <>
                        <Icons.Clock size={13} />
                        <span>Pending</span>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <>
                        <Icons.Loader size={13} className="spinner" />
                        <span>Processing</span>
                      </>
                    )}
                    {order.status === 'shipped' && (
                      <>
                        <Icons.Truck size={13} />
                        <span>Shipped</span>
                      </>
                    )}
                    {order.status === 'delivered' && (
                      <>
                        <Icons.CheckCircle size={13} />
                        <span>Delivered</span>
                      </>
                    )}
                    {order.status === 'cancelled' && (
                      <>
                        <Icons.XCircle size={13} />
                        <span>Cancelled</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="my-order-card-bottom">
                <div className="my-order-info-row">
                  <span className="my-order-info-label">
                    <Icons.Calendar size={13} />
                    Ordered
                  </span>
                  <span className="my-order-info-value">{formatDate(order.created_at)} at {formatTime(order.created_at)}</span>
                </div>
                <div className="my-order-info-row">
                  <span className="my-order-info-label">
                    <Icons.MapPin size={13} />
                    Delivery
                  </span>
                  <span className="my-order-info-value">{order.address}</span>
                </div>
                <div className="my-order-info-row">
                  <span className="my-order-info-label">
                    <Icons.Hash size={13} />
                    Order ID
                  </span>
                  <span className="my-order-info-value my-order-id-text">{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
