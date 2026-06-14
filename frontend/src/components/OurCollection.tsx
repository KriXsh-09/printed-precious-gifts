import React from 'react';
import * as Icons from 'lucide-react';

interface CollectionItem {
  id: number;
  title: string;
  count: string;
  description: string;
  image: string;
  href: string;
}

const collections: CollectionItem[] = [
  {
    id: 1,
    title: 'Divine Statues',
    count: '24 Items',
    description: 'Elegantly detailed sculptures of deities, spiritual icons, and sacred symbols.',
    image: 'https://files.catbox.moe/rix4zz.png',
    href: '#collections/divine',
  },
  {
    id: 2,
    title: 'Customized Couples',
    count: '12 Items',
    description: 'Romantic couple miniature figurines and anniversary keepsakes made from photos.',
    image: 'https://files.catbox.moe/j5bog0.png',
    href: '#collections/couples',
  },
  {
    id: 3,
    title: 'Customized Singles',
    count: '18 Items',
    description: 'High-fidelity portrait busts, hobbyist miniatures, and personalized single figures.',
    image: 'https://files.catbox.moe/zhjil3.png', // Reusing couple/single statue visual
    href: '#collections/singles',
  },
  {
    id: 4,
    title: 'Vault',
    count: '8 Items',
    description: 'Exquisite pre-designed 3D-printed models, exclusive home decor, and creative ready-made treasures.',
    image: 'https://files.catbox.moe/ghoz6k.png',
    href: '#collections/vault',
  },
];

export const OurCollection: React.FC = () => {
  return (
    <section id="collection" className="collection-section">
      <div className="section-header">
        <span className="section-badge">Curated Series</span>
        <h2 className="section-title">Explore Our Collection</h2>
        <p className="section-subtitle">
          Browse through our specialized categories of high-quality 3D printed custom gifts and spiritual decor.
        </p>
      </div>

      <div className="collection-grid">
        {collections.map((item) => (
          <div key={item.id} className="collection-card" onClick={() => window.location.hash = item.href}>
            <div 
              className="collection-card-bg" 
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="collection-overlay" />
            
            <div className="collection-content">
              <span className="collection-count">{item.count}</span>
              <h3 className="collection-title">{item.title}</h3>
              <p className="collection-description">{item.description}</p>
              
              <a href={item.href} className="collection-link">
                <span>View Collection</span>
                <Icons.ArrowUpRight size={16} className="link-arrow" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
