import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { Product } from '../App';

const defaultPopularProducts: Product[] = [
  {
    id: 1,
    title: 'Divine Ganesha Statue',
    description: 'Detailed 3D printed deity statue in antique bronze finish.',
    price: 49.00,
    rating: 4.9,
    reviews: 124,
    image: 'https://files.catbox.moe/hhyds5.png',
    collection_id: 'divine',
    is_popular: true,
    tag: 'Best Seller',
  },
  {
    id: 2,
    title: 'Personalized Couple Sculpture',
    description: 'Custom 3D miniature figurines sculpted from your photos.',
    price: 129.00,
    rating: 4.8,
    reviews: 86,
    image: 'https://files.catbox.moe/zhjil3.png',
    collection_id: 'couples',
    is_popular: true,
    tag: 'Customizable',
  },
  {
    id: 3,
    title: 'Lithophane Magic Lamp',
    description: 'Cylindrical photo lamp that glows with your favorite memory.',
    price: 69.00,
    rating: 4.9,
    reviews: 210,
    image: 'https://files.catbox.moe/ghoz6k.png',
    collection_id: 'lamps',
    is_popular: true,
    tag: 'Trending',
  },
  {
    id: 4,
    title: 'Custom 3D Nameplate',
    description: 'Premium home nameplate with raised lettering and marble texture.',
    price: 39.00,
    rating: 4.7,
    reviews: 58,
    image: 'https://files.catbox.moe/ash2mc.png',
    collection_id: 'singles',
    is_popular: true,
    tag: 'New',
  },
];

interface MostPopularProps {
  onAddToCart: (product: Product) => void;
  popularProducts?: Product[];
}

export const MostPopular: React.FC<MostPopularProps> = ({ onAddToCart, popularProducts = defaultPopularProducts }) => {
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string | number, number>>({});

  const handleMouseEnter = (productId: number | string, imageCount: number) => {
    if (imageCount > 1) {
      setActiveImageIndexes(prev => ({
        ...prev,
        [productId]: ((prev[productId] || 0) + 1) % imageCount
      }));
    }
  };

  const handleMouseLeave = (productId: number | string) => {
    setActiveImageIndexes(prev => ({
      ...prev,
      [productId]: 0
    }));
  };

  return (
    <section id="most-popular" className="popular-section">
      <div className="section-header">
        <span className="section-badge">Customer Favorites</span>
        <h2 className="section-title">Most Popular Gifts</h2>
        <p className="section-subtitle">
          Our highest-rated 3D printed creations and personalized keepsakes, loved by thousands.
        </p>
      </div>

      <div className="products-grid">
        {popularProducts.map((product) => {
          const productImages = (product.images && product.images.length > 0)
            ? product.images
            : [product.image];
          const activeIdx = activeImageIndexes[product.id] || 0;
          const currentImg = productImages[activeIdx] || product.image;

          const isReadymade = product.collection_id === 'vault' || product.collection_id === 'readymade' || product.collection_id === 'lamps';

          return (
            <div
              key={product.id}
              className="product-card"
              onMouseEnter={() => handleMouseEnter(product.id, productImages.length)}
              onMouseLeave={() => handleMouseLeave(product.id)}
            >
              <div className="product-image-wrapper">
                <img src={currentImg} alt={product.title} className="product-image" />
                {product.tag && <span className="product-badge">{product.tag}</span>}
                
                {/* Image Gallery Dot Indicators */}
                {productImages.length > 1 && (
                  <div className="product-dots-indicator">
                    {productImages.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`dot-pill ${dotIdx === activeIdx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndexes(prev => ({ ...prev, [product.id]: dotIdx }));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <div className="product-info-left">
                  <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star
                        key={i}
                        size={13}
                        fill={i < Math.round(product.rating || 5) ? "var(--accent-gold)" : "none"}
                        stroke={i < Math.round(product.rating || 5) ? "var(--accent-gold)" : "var(--text-muted)"}
                      />
                    ))}
                    <span className="rating-val" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginLeft: '2px' }}>
                      {(product.rating || 5.0).toFixed(1)}
                    </span>
                    <span className="rating-count" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({product.reviews || 0})
                    </span>
                  </div>
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                </div>
                
                <div className="product-info-right">
                  <span className="product-price">₹{product.price.toFixed(2)}</span>
                  <button 
                    className="customize-btn"
                    onClick={() => onAddToCart(product)}
                  >
                    <span>{isReadymade ? 'Buy Now' : 'Customize'}</span>
                    {isReadymade ? <Icons.ShoppingCart size={14} /> : <Icons.ArrowRight size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
