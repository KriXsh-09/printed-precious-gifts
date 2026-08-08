import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { Product } from '../App';
import { supabase, isPlaceholderClient } from '../lib/supabase';

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: number | string;
  product_title: string;
  product_image: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsProps {
  products: Product[];
  reviews: Review[];
  currentUser: any;
  onAddReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  onOpenAuth: (tab: 'signin' | 'register') => void;
}

export const Reviews: React.FC<ReviewsProps> = ({
  products,
  reviews,
  currentUser,
  onAddReview,
  onOpenAuth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | string>(products[0]?.id || 0);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [purchasedProductIds, setPurchasedProductIds] = useState<(number | string)[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      if (!currentUser) {
        setPurchasedProductIds([]);
        return;
      }
      setOrdersLoading(true);
      try {
        if (isPlaceholderClient) {
          setPurchasedProductIds([1, 2, 3]); // mock products for review in fallback
          setOrdersLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('product_id')
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        const ids = data ? Array.from(new Set(data.map((o: any) => o.product_id))) : [];
        setPurchasedProductIds(ids);
      } catch (err) {
        console.error('Error fetching purchased products for review check:', err);
        setPurchasedProductIds([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, [currentUser, isModalOpen]);

  const reviewableProducts = products.filter((p) => purchasedProductIds.some((id) => String(id) === String(p.id)));
  const selectedProduct = reviewableProducts.find((p) => String(p.id) === String(selectedProductId));

  const handleOpenWriteReview = () => {
    if (!currentUser) {
      alert('Please sign in to write a review.');
      onOpenAuth('signin');
      return;
    }
    // Set default selected product if not set
    if (reviewableProducts.length > 0) {
      setSelectedProductId(reviewableProducts[0].id);
    }
    setRating(5);
    setComment('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedProduct) {
      setErrorMsg('Please select a product to review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please write a review comment.');
      return;
    }

    if (comment.length > 250) {
      setErrorMsg('Review must be 250 characters or less.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Anonymous';
      
      await onAddReview({
        user_id: currentUser.id,
        user_name: userName,
        product_id: selectedProduct.id,
        product_title: selectedProduct.title,
        product_image: selectedProduct.image,
        rating,
        comment,
      });

      setIsModalOpen(false);
      alert('Thank you! Your review has been submitted successfully.');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <section id="reviews" className="reviews-section">
      <div className="section-header">
        <span className="section-badge">Client Stories</span>
        <h2 className="section-title">Customer Reviews</h2>
        <p className="section-subtitle">
          Here is what our happy customers are saying about their beautifully detailed custom 3D gifts.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="reviews-empty-state">
          <Icons.MessageSquareQuote size={48} className="empty-review-icon" />
          <h3>No reviews yet</h3>
          <p>Be the first one to share your wonderful experience!</p>
          <button className="write-review-trigger-btn" onClick={handleOpenWriteReview}>
            Write a Review
          </button>
        </div>
      ) : (
        <>
          <div className="reviews-grid-wrapper">
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-user-info">
                      <span className="review-user-name">{review.user_name}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Icons.Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? 'var(--accent-gold)' : 'none'}
                          stroke={i < review.rating ? 'var(--accent-gold)' : 'var(--text-muted)'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="review-text">"{review.comment}"</p>

                  <div className="review-product-details">
                    <img src={review.product_image} alt={review.product_title} className="review-product-thumb" />
                    <div className="review-product-info">
                      <span className="review-product-label">Reviewed for:</span>
                      <span className="review-product-title">{review.product_title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <button className="write-review-trigger-btn" onClick={handleOpenWriteReview}>
              Write a Review
            </button>
          </div>
        </>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
              <Icons.X size={18} />
            </button>

            {ordersLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px' }}>
                <Icons.Loader size={24} className="spinner" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Checking purchased items...</span>
              </div>
            ) : reviewableProducts.length === 0 ? (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <Icons.AlertTriangle size={36} color="var(--accent-gold)" style={{ marginBottom: '12px', display: 'inline-block' }} />
                <h4 style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px', fontSize: '1.05rem' }}>No Purchased Products</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                  You can only review products you have actually ordered. Explore our collections and place an order to share your feedback!
                </p>
                <button className="write-review-trigger-btn" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="admin-modal-title">Share Your Experience</h3>
                <p className="admin-modal-subtitle">
                  Your feedback helps us create better 3D printed treasures.
                </p>

                {errorMsg && (
                  <div className="auth-message error">
                    <Icons.AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="review-product">Select Product to Review *</label>
                    <select
                      id="review-product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      required
                    >
                      {reviewableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <div className="review-product-preview" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '12px', marginBottom: '15px' }}>
                      <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text-dark)' }}>{selectedProduct.title}</p>
                        <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>{selectedProduct.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Your Rating *</label>
                    <div className="rating-select-stars" style={{ display: 'flex', gap: '8px', padding: '5px 0' }}>
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isHighlighted = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                          >
                            <Icons.Star
                              size={28}
                              fill={isHighlighted ? 'var(--accent-gold)' : 'none'}
                              stroke={isHighlighted ? 'var(--accent-gold)' : 'var(--text-muted)'}
                              strokeWidth={1.8}
                              style={{ transition: 'transform 0.1s ease', transform: isHighlighted ? 'scale(1.1)' : 'scale(1)' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="review-comment">Your Review *</label>
                      <span style={{ fontSize: '0.8rem', color: comment.length > 220 ? '#ef4444' : 'var(--text-muted)' }}>
                        {comment.length} / 250
                      </span>
                    </div>
                    <textarea
                      id="review-comment"
                      rows={4}
                      maxLength={250}
                      placeholder="What did you love about it? (e.g. details, size, colors, delivery speed...)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="spinner">Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Review</span>
                        <Icons.Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
