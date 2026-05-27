import React from 'react';
import * as Icons from 'lucide-react';

export interface CartItem {
  cartItemId: string;
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  customPhotoUrl?: string;
  customerName?: string;
  mobileNumber?: string;
  address?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => Promise<void>;
  isCheckingOut: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckingOut,
}) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h3>Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h3>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <Icons.X size={22} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="cart-drawer-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <Icons.ShoppingBag size={48} className="empty-cart-icon" />
              <h4>Your cart is empty</h4>
              <p>Explore our beautiful collections to find the perfect customized 3D printed gift.</p>
              <button className="cart-shop-btn" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item-card">
                  <img src={item.image} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.title}</h4>

                    {/* Show size and customization details */}
                    {item.size && (
                      <span className="cart-item-size-badge">
                        <Icons.Ruler size={12} />
                        Size: {item.size}
                      </span>
                    )}

                    {(item.customerName || item.mobileNumber || item.address || item.customPhotoUrl) && (
                      <div className="cart-item-details-list">
                        {item.customerName && (
                          <div className="cart-item-detail-row">
                            <span className="cart-item-detail-label">Name:</span>
                            <span>{item.customerName}</span>
                          </div>
                        )}
                        {item.mobileNumber && (
                          <div className="cart-item-detail-row">
                            <span className="cart-item-detail-label">Mobile:</span>
                            <span>{item.mobileNumber}</span>
                          </div>
                        )}
                        {item.address && (
                          <div className="cart-item-detail-row">
                            <span className="cart-item-detail-label">Address:</span>
                            <span>{item.address}</span>
                          </div>
                        )}
                        {item.customPhotoUrl && (
                          <div className="cart-item-detail-row" style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="cart-item-custom-badge" style={{ margin: 0, alignSelf: 'flex-start' }}>
                                <Icons.ImageIcon size={12} />
                                Custom Photo
                              </span>
                              <img src={item.customPhotoUrl} alt="Custom print upload" className="cart-item-custom-thumb" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-selector">
                        <button 
                          className="qty-btn" 
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Icons.Minus size={12} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        >
                          <Icons.Plus size={12} />
                        </button>
                      </div>
                      <button 
                        className="item-remove-btn" 
                        onClick={() => onRemoveItem(item.cartItemId)}
                        aria-label="Remove item"
                      >
                        <Icons.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-subtotal-val">₹{subtotal.toFixed(2)}</span>
            </div>
            <p className="cart-tax-notice" style={{ fontStyle: 'italic', marginBottom: '10px' }}>
              Direct checkout. Payment system integration planned.
            </p>
            <button 
              className="cart-checkout-btn" 
              onClick={onCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Icons.Loader size={16} className="spinner" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order • ₹{subtotal.toFixed(2)}</span>
                  <Icons.ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
