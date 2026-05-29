import React from 'react';
import * as Icons from 'lucide-react';
import type { Product } from '../App';

interface CollectionViewProps {
  collectionId: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const collectionMeta: Record<string, { title: string; desc: string; image: string }> = {
  divine: {
    title: 'Divine Statues',
    desc: 'Elegantly detailed sculptures of deities, spiritual icons, and sacred symbols crafted with high-fidelity resin 3D printing.',
    image: 'https://files.catbox.moe/rix4zz.png',
  },
  couples: {
    title: 'Customized Couples',
    desc: 'Romantic couple miniature figurines and anniversary keepsakes made from your personal photos. Perfect for weddings and anniversaries.',
    image: 'https://files.catbox.moe/j5bog0.png',
  },
  singles: {
    title: 'Customized Singles',
    desc: 'High-fidelity custom portrait busts, professional occupation miniatures, gaming characters, and personalized single figures.',
    image: 'https://files.catbox.moe/zhjil3.png',
  },
  lamps: {
    title: 'Lithophane Lamps',
    desc: 'Exquisite 3D-printed photo lamps that project your favorite memories when lit up. Complete with built-in warm LED light bases.',
    image: 'https://files.catbox.moe/ghoz6k.png',
  },
};

export const CollectionView: React.FC<CollectionViewProps> = ({
  collectionId,
  products,
  onAddToCart,
}) => {
  const meta = collectionMeta[collectionId] || {
    title: 'Products',
    desc: 'Explore our collection of custom 3D printed gifts.',
    image: 'https://files.catbox.moe/rix4zz.png',
  };

  const filteredProducts = products.filter((p) => p.collection_id === collectionId);

  return (
    <div className="collection-view-container">
      {/* Back navigation header */}
      <div className="collection-nav-header">
        <a href="#" className="back-home-btn">
          <Icons.ArrowLeft size={16} />
          <span>Back to Home</span>
        </a>
      </div>

      {/* Collection Hero Banner */}
      <div className="collection-hero-banner" style={{ backgroundImage: `url(${meta.image})` }}>
        <div className="collection-hero-overlay"></div>
        <div className="collection-hero-content">
          <span className="collection-hero-badge">Curated Series</span>
          <h1 className="collection-hero-title">{meta.title}</h1>
          <p className="collection-hero-desc">{meta.desc}</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="collection-products-section">
        <div className="section-header">
          <span className="section-badge">{filteredProducts.length} Items Available</span>
          <h2 className="section-title">Available Products</h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="collection-empty-state">
            <Icons.Inbox size={48} className="empty-box-icon" />
            <h3>No products found</h3>
            <p>We couldn't find any products in this collection. Please check back later!</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.title} className="product-image" />
                  {product.tag && <span className="product-badge">{product.tag}</span>}
                  {product.is_popular && <span className="product-badge popular">Popular</span>}
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
                      <span>Customize</span>
                      <Icons.ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
