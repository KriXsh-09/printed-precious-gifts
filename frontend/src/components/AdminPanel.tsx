import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase, isPlaceholderClient } from '../lib/supabase';
import type { Product } from '../App';

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

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => void;
  onUpdateProduct: (id: number | string, product: Partial<Product>) => void;
  onDeleteProduct: (id: number | string) => void;
}

const collectionsList = [
  { id: 'divine', label: 'Divine Statues' },
  { id: 'couples', label: 'Customized Couples' },
  { id: 'singles', label: 'Customized Singles' },
  { id: 'vault', label: 'Vault' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price4in, setPrice4in] = useState('');
  const [price6in, setPrice6in] = useState('');
  const [price8in, setPrice8in] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [collectionId, setCollectionId] = useState('divine');
  const [isPopular, setIsPopular] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [togglingOrderId, setTogglingOrderId] = useState<string | null>(null);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      if (isPlaceholderClient) {
        console.log('[Admin Mock] Fetching all orders');
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });


      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrdersError(err.message || 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setTogglingOrderId(orderId);

    try {
      if (isPlaceholderClient) {
        console.log('[Admin Mock] Change order status:', orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setTogglingOrderId(null);
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setTogglingOrderId(null);
    }
  };

  const handleDownloadPhoto = async (url: string, productTitle: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${productTitle.replace(/\s+/g, '_')}_custom_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Cross-origin fetch failed, opening in a new tab instead:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 4) {
      setUploadError('Maximum 4 images allowed per product.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Ensure the admin role is seeded in user_roles before uploading.
      // The storage policy checks user_roles for admin access.
      await supabase.rpc('ensure_admin_role');

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, publicUrl]);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setUploadError(err.message || 'Failed to upload image. Make sure the storage bucket "product-images" is created and public.');
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPrice4in('');
    setPrice6in('');
    setPrice8in('');
    setImages(['https://files.catbox.moe/rix4zz.png']); // default fallback
    setCollectionId('divine');
    setIsPopular(false);
    setErrorMsg(null);
    setUploadError(null);
    setIsUploading(false);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice4in(product.price_4in?.toString() || product.price.toString());
    setPrice6in(product.price_6in?.toString() || (product.price * 1.5).toString());
    setPrice8in(product.price_8in?.toString() || (product.price * 2).toString());
    // Populate images from product.images array, or fall back to single image
    const productImages = (product.images && product.images.length > 0) ? product.images : [product.image];
    setImages(productImages);
    setCollectionId(product.collection_id);
    setIsPopular(product.is_popular);
    setErrorMsg(null);
    setUploadError(null);
    setIsUploading(false);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedPrice4in = parseFloat(price4in);
    const parsedPrice6in = parseFloat(price6in);
    const parsedPrice8in = parseFloat(price8in);

    if (isNaN(parsedPrice4in) || parsedPrice4in <= 0 ||
        isNaN(parsedPrice6in) || parsedPrice6in <= 0 ||
        isNaN(parsedPrice8in) || parsedPrice8in <= 0) {
      setErrorMsg('Please enter valid positive prices for all sizes (4", 6", 8").');
      return;
    }

    if (!title.trim() || images.length === 0) {
      setErrorMsg('Title and at least one image are required.');
      return;
    }

    const payload = {
      title,
      description,
      price: parsedPrice4in, // base price legacy fallback
      price_4in: parsedPrice4in,
      price_6in: parsedPrice6in,
      price_8in: parsedPrice8in,
      image: images[0], // primary thumbnail for backward compatibility
      images, // full images array
      collection_id: collectionId,
      is_popular: isPopular,
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: number | string, productTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      onDeleteProduct(id);
    }
  };

  // Stats Calculations
  const totalProducts = products.length;
  const popularCount = products.filter((p) => p.is_popular).length;
  const divineCount = products.filter((p) => p.collection_id === 'divine').length;
  const couplesCount = products.filter((p) => p.collection_id === 'couples').length;
  const singlesCount = products.filter((p) => p.collection_id === 'singles').length;
  const lampsCount = products.filter((p) => p.collection_id === 'lamps' || p.collection_id === 'readymade' || p.collection_id === 'vault').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="admin-panel-container">
      {/* Admin Nav Header */}
      <div className="admin-nav-header">
        <a href="#" className="back-home-btn">
          <Icons.ArrowLeft size={16} />
          <span>Back to Storefront</span>
        </a>
      </div>

      <div className="admin-header-section">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage products, orders, and configure your storefront.</p>
        </div>
        {activeTab === 'products' && (
          <button className="admin-add-btn" onClick={openAddForm}>
            <Icons.Plus size={16} />
            <span>Add New Product</span>
          </button>
        )}
        {activeTab === 'orders' && (
          <button className="admin-add-btn" onClick={fetchOrders}>
            <Icons.RefreshCw size={16} />
            <span>Refresh Orders</span>
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="admin-tab-bar">
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Icons.Package size={16} />
          <span>Products</span>
          <span className="admin-tab-count">{totalProducts}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Icons.ShoppingCart size={16} />
          <span>Orders</span>
          {orders.length > 0 && <span className="admin-tab-count">{orders.length}</span>}
        </button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
          {/* Stats Board */}
          <div className="admin-stats-board">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <Icons.Layers size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{totalProducts}</span>
                <span className="stat-label">Total Products</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper gold">
                <Icons.Award size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{popularCount}</span>
                <span className="stat-label">Popular Items</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info-mini-grid">
                <div className="mini-stat">
                  <span className="mini-val">{divineCount}</span>
                  <span className="mini-label">Divine</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{couplesCount}</span>
                  <span className="mini-label">Couples</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{singlesCount}</span>
                  <span className="mini-label">Singles</span>
                </div>
                 <div className="mini-stat">
                  <span className="mini-val">{lampsCount}</span>
                  <span className="mini-label">Vault</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Info</th>
                  <th>Collection</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No products available. Click "Add New Product" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const collectionName = collectionsList.find((c) => c.id === product.collection_id)?.label || 'None';
                    const thumbImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-prod-cell">
                            <img src={thumbImg} alt={product.title} className="admin-prod-thumb" />
                            <div>
                              <div className="admin-prod-title">{product.title}</div>
                              <div className="admin-prod-desc">{product.description || 'No description provided.'}</div>
                              {product.images && product.images.length > 1 && (
                                <div className="admin-prod-img-count">
                                  <Icons.Images size={12} />
                                  <span>{product.images.length} images</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-collection-badge ${product.collection_id}`}>
                            {collectionName}
                          </span>
                        </td>
                        <td>
                          <span className="admin-price-cell">₹{product.price.toFixed(2)}</span>
                        </td>
                        <td>
                          {product.is_popular ? (
                            <span className="admin-popular-badge">
                              <Icons.Sparkles size={12} />
                              <span>Most Popular</span>
                            </span>
                          ) : (
                            <span className="admin-standard-badge">Standard</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions-cell">
                            <button className="admin-action-btn edit" onClick={() => openEditForm(product)} aria-label="Edit product">
                              <Icons.Edit2 size={15} />
                            </button>
                            <button type="button" className="admin-action-btn delete" onClick={(e) => handleDelete(e, product.id, product.title)} aria-label="Delete product">
                              <Icons.Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <>
          {/* Orders Stats */}
          <div className="admin-stats-board">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <Icons.ShoppingCart size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{orders.length}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper gold">
                <Icons.Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{pendingOrders}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <Icons.CheckCircle size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{deliveredOrders}</span>
                <span className="stat-label">Delivered</span>
              </div>
            </div>
          </div>

          {/* Orders Loading */}
          {ordersLoading && (
            <div className="admin-orders-loading">
              <Icons.Loader size={24} className="spinner" />
              <span>Loading orders...</span>
            </div>
          )}

          {/* Orders Error */}
          {ordersError && (
            <div className="admin-orders-error">
              <Icons.AlertCircle size={18} />
              <span>{ordersError}</span>
            </div>
          )}

          {/* Orders Table */}
          {!ordersLoading && !ordersError && (
            <div className="admin-table-wrapper">
              <table className="admin-table admin-orders-table">
                <thead>
                  <tr>
                    <th>Order Info</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        No orders received yet. Orders from customers will appear here.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="admin-order-id-cell">
                            <span className="admin-order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="admin-order-date">{formatDate(order.created_at)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-customer-cell">
                            <span className="admin-customer-name">{order.customer_name}</span>
                            <span className="admin-customer-email">{order.user_email}</span>
                            <span className="admin-customer-phone">
                              <Icons.Phone size={11} />
                              {order.mobile_number}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-order-product-cell">
                            {order.product_image && (
                              <img src={order.product_image} alt={order.product_title} className="admin-prod-thumb" />
                            )}
                            <div>
                              <div className="admin-prod-title">{order.product_title}</div>
                              <div className="admin-prod-desc">Size: {order.selected_size}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-price-cell">₹{Number(order.price).toFixed(2)}</span>
                        </td>
                        <td>
                          <div className="admin-status-select-wrapper">
                            {togglingOrderId === order.id ? (
                              <div className="admin-status-loading-spinner" style={{ padding: '6px 14px', display: 'inline-flex', alignItems: 'center' }}>
                                <Icons.Loader size={14} className="spinner" />
                              </div>
                            ) : (
                              <select
                                className={`admin-status-select ${order.status}`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                                disabled={togglingOrderId === order.id}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="admin-actions-cell">
                            {order.custom_photo_url && (
                              <button
                                className="admin-action-btn download"
                                onClick={() => handleDownloadPhoto(order.custom_photo_url!, order.product_title)}
                                aria-label="Download custom photo"
                                title="Download custom photo"
                              >
                                <Icons.Download size={15} />
                              </button>
                            )}
                            <button
                              className="admin-action-btn view"
                              onClick={() => {
                                alert(
                                  `Order Details:\n\nOrder ID: ${order.id}\nCustomer: ${order.customer_name}\nEmail: ${order.user_email}\nPhone: ${order.mobile_number}\nAddress: ${order.address}\n\nProduct: ${order.product_title}\nSize: ${order.selected_size}\nPrice: ₹${Number(order.price).toFixed(2)}\nStatus: ${order.status}\n\nOrdered: ${formatDate(order.created_at)}`
                                );
                              }}
                              aria-label="View order details"
                              title="View full details"
                            >
                              <Icons.Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="admin-modal" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setIsFormOpen(false)} aria-label="Close form">
              <Icons.X size={18} />
            </button>

            <h3 className="admin-modal-title">
              {editingProduct ? 'Edit Product details' : 'Add New Product'}
            </h3>
            <p className="admin-modal-subtitle">
              Fill in the details below to publish this 3D-printed creation.
            </p>

            {errorMsg && (
              <div className="auth-message error">
                <Icons.AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="prod-title">Product Title *</label>
                <input
                  id="prod-title"
                  type="text"
                  placeholder="e.g., Mini Portrait Bust"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Prices by Size (₹) *</label>
                <div className="form-group-prices">
                  <div className="price-input-col">
                    <label htmlFor="prod-price-4in" style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>4" Size</label>
                    <input
                      id="prod-price-4in"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 500"
                      value={price4in}
                      onChange={(e) => setPrice4in(e.target.value)}
                      required
                    />
                  </div>
                  <div className="price-input-col">
                    <label htmlFor="prod-price-6in" style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>6" Size</label>
                    <input
                      id="prod-price-6in"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 800"
                      value={price6in}
                      onChange={(e) => setPrice6in(e.target.value)}
                      required
                    />
                  </div>
                  <div className="price-input-col">
                    <label htmlFor="prod-price-8in" style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>8" Size</label>
                    <input
                      id="prod-price-8in"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1200"
                      value={price8in}
                      onChange={(e) => setPrice8in(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  rows={3}
                  placeholder="Describe the customization options, scale, finish details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Product Images * <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 400 }}>(up to 4)</span></label>
                
                {/* Image Grid */}
                <div className="admin-images-grid">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="admin-image-slot filled">
                      <img src={imgUrl} alt={`Product ${index + 1}`} className="admin-image-preview" />
                      <button
                        type="button"
                        className="admin-image-remove-btn"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Icons.X size={14} />
                      </button>
                      {index === 0 && <span className="admin-image-primary-tag">Primary</span>}
                    </div>
                  ))}

                  {/* Add image slot (only show if < 4 images) */}
                  {images.length < 4 && (
                    <div className="admin-image-slot empty">
                      <label htmlFor="file-upload" className="admin-image-add-label">
                        <Icons.Plus size={22} />
                        <span>Add Photo</span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="upload-status loading">
                    <Icons.Loader size={16} className="spinner" />
                    <span>Uploading image to Supabase...</span>
                  </div>
                )}

                {uploadError && (
                  <div className="upload-status error">
                    <Icons.AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-collection">Product Category *</label>
                  <select
                    id="prod-collection"
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                  >
                    {collectionsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                    />
                    <span>Show in "Most Popular" Section</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="admin-submit-btn">
                <span>{editingProduct ? 'Save Product changes' : 'Publish Product'}</span>
                <Icons.ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
