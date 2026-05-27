import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase, isPlaceholderClient } from '../lib/supabase';
import type { Product } from '../App';
import type { CartItem } from './CartDrawer';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  userId?: string;
  userEmail?: string;
  onAddToCart: (itemToAdd: Omit<CartItem, 'quantity'>) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  product,
  userId,
  userEmail,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<'4"' | '6"' | '8"'>('4"');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Customer detail fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');

  // Form error state
  const [orderError, setOrderError] = useState<string | null>(null);

  // Reset fields when a new product is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSize('4"');
      setCustomPhotoUrl('');
      setUploadError(null);
      setIsUploading(false);
      setCustomerName('');
      setMobileNumber('');
      setAddress('');
      setOrderError(null);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Pricing based on selected size
  const getPriceForSize = (): number => {
    if (selectedSize === '4"') return product.price_4in || product.price;
    if (selectedSize === '6"') return product.price_6in || product.price * 1.5;
    if (selectedSize === '8"') return product.price_8in || product.price * 2.0;
    return product.price;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `customizations/${fileName}`;

      const { error } = await supabase.storage
        .from('user-customizations')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-customizations')
        .getPublicUrl(filePath);

      setCustomPhotoUrl(publicUrl);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setUploadError(
        err.message || 'Failed to upload photo. Make sure the storage bucket "user-customizations" exists and is public.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToCartClick = () => {
    setOrderError(null);

    // Validate fields
    if (!customerName.trim()) {
      setOrderError('Please enter your name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setOrderError('Please enter a valid mobile number (at least 10 digits).');
      return;
    }
    if (!address.trim()) {
      setOrderError('Please enter your delivery address.');
      return;
    }

    const currentPrice = getPriceForSize();
    const cartItemId = `${product.id}-${selectedSize}-${Date.now()}`;

    onAddToCart({
      cartItemId,
      id: product.id,
      title: product.title,
      price: currentPrice,
      image: product.image,
      size: selectedSize,
      customPhotoUrl: customPhotoUrl || undefined,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      address: address.trim(),
    });

    onClose();
  };

  const currentPrice = getPriceForSize();

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal customize-modal" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose} aria-label="Close customization">
          <Icons.X size={18} />
        </button>

        {/* Modal Header details */}
        <div className="cust-modal-header">
          <img src={product.image} alt={product.title} className="cust-product-thumb" />
          <div>
            <h3 className="admin-modal-title">{product.title}</h3>
            <p className="cust-product-desc">{product.description}</p>
          </div>
        </div>

        <div className="cust-divider"></div>

        {/* Size Option Selector */}
        <div className="cust-form-section">
          <h4 className="cust-section-title">Select Dimensions (Height)</h4>
          <div className="size-selector-grid">
            <button
              type="button"
              className={`size-btn-option ${selectedSize === '4"' ? 'active' : ''}`}
              onClick={() => setSelectedSize('4"')}
            >
              <div className="size-label">4 Inches</div>
              <div className="size-price">₹{(product.price_4in || product.price).toFixed(2)}</div>
            </button>

            <button
              type="button"
              className={`size-btn-option ${selectedSize === '6"' ? 'active' : ''}`}
              onClick={() => setSelectedSize('6"')}
            >
              <div className="size-label">6 Inches</div>
              <div className="size-price">₹{(product.price_6in || product.price * 1.5).toFixed(2)}</div>
            </button>

            <button
              type="button"
              className={`size-btn-option ${selectedSize === '8"' ? 'active' : ''}`}
              onClick={() => setSelectedSize('8"')}
            >
              <div className="size-label">8 Inches</div>
              <div className="size-price">₹{(product.price_8in || product.price * 2.0).toFixed(2)}</div>
            </button>
          </div>
        </div>

        <div className="cust-divider"></div>

        {/* Image upload section */}
        <div className="cust-form-section">
          <h4 className="cust-section-title">Upload Reference Photo</h4>
          <p className="cust-section-subtitle">
            Upload the face photo or couple picture to customize this 3D-printed miniature.
          </p>

          <div className="cust-upload-area">
            {!customPhotoUrl ? (
              <div className="cust-upload-dropzone">
                <label htmlFor="cust-photo-upload" className="cust-upload-trigger-btn">
                  <Icons.UploadCloud size={24} />
                  <span>Choose Photo</span>
                </label>
                <input
                  id="cust-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="cust-uploaded-preview">
                <img src={customPhotoUrl} alt="Uploaded custom view" className="cust-preview-image" />
                <button
                  type="button"
                  className="cust-preview-remove-btn"
                  onClick={() => setCustomPhotoUrl('')}
                  aria-label="Remove image"
                >
                  <Icons.Trash2 size={16} />
                  <span>Change Photo</span>
                </button>
              </div>
            )}

            {isUploading && (
              <div className="cust-upload-loading">
                <Icons.Loader size={18} className="spinner" />
                <span>Uploading picture to Supabase...</span>
              </div>
            )}

            {uploadError && (
              <div className="cust-upload-error">
                <Icons.AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        <div className="cust-divider"></div>

        {/* Customer Details Section */}
        <div className="cust-form-section">
          <h4 className="cust-section-title">Your Details</h4>
          <p className="cust-section-subtitle">
            Please provide your contact and delivery information.
          </p>

          <div className="cust-details-form">
            <div className="cust-field-group">
              <label htmlFor="cust-name">
                <Icons.User size={14} />
                <span>Full Name *</span>
              </label>
              <input
                id="cust-name"
                type="text"
                placeholder="e.g., Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="cust-field-group">
              <label htmlFor="cust-mobile">
                <Icons.Phone size={14} />
                <span>Mobile Number *</span>
              </label>
              <input
                id="cust-mobile"
                type="tel"
                placeholder="e.g., 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <div className="cust-field-group">
              <label htmlFor="cust-address">
                <Icons.MapPin size={14} />
                <span>Delivery Address *</span>
              </label>
              <textarea
                id="cust-address"
                rows={3}
                placeholder="Full delivery address including city, state, and PIN code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {orderError && (
          <div className="cust-order-error">
            <Icons.AlertCircle size={16} />
            <span>{orderError}</span>
          </div>
        )}

        <div className="cust-divider"></div>

        {/* Bottom Add to Cart Button */}
        <button
          type="button"
          className="cust-add-cart-btn"
          onClick={handleAddToCartClick}
          disabled={isUploading}
        >
          <Icons.ShoppingBag size={18} />
          <span>Add to Cart • ₹{currentPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};
