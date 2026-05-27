import React from 'react';
import * as Icons from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="why-choose-us-section">
      <div className="section-header">
        <span className="section-badge">Why Giftworld</span>
        <h2 className="section-title">Why People Choose Us</h2>
        <p className="section-subtitle">
          Premium custom 3D prints and personalized creations crafted with detail, care, and love. Here is why thousands trust us to capture their precious moments.
        </p>
      </div>

      <div className="wcu-container">
        {/* Left Side: Quality & Delivery */}
        <div className="wcu-col wcu-left-col">
          <div className="wcu-card">
            <div className="wcu-icon-wrapper">
              <Icons.Award size={24} className="wcu-icon" />
            </div>
            <div className="wcu-card-content">
              <h3 className="wcu-card-title">Premium Quality & Detail</h3>
              <p className="wcu-card-description">
                High-precision resin and material prints with hand-finished detailing for a premium, artistic look.
              </p>
            </div>
          </div>

          <div className="wcu-card">
            <div className="wcu-icon-wrapper">
              <Icons.Truck size={24} className="wcu-icon" />
            </div>
            <div className="wcu-card-content">
              <h3 className="wcu-card-title">Safe & Express Delivery</h3>
              <p className="wcu-card-description">
                Secure double-box packaging to ensure your fragile custom sculptures arrive in perfect, pristine condition.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Image Banner */}
        <div className="wcu-center-col">
          <div className="wcu-image-wrapper">
            <img 
              src="/why_choose_us.png" 
              alt="Custom 3D printed lithophane gift" 
              className="wcu-banner-img" 
            />
            <div className="wcu-image-overlay"></div>
          </div>
        </div>

        {/* Right Side: Pricing & Trust */}
        <div className="wcu-col wcu-right-col">
          <div className="wcu-card">
            <div className="wcu-icon-wrapper">
              <Icons.Tag size={24} className="wcu-icon" />
            </div>
            <div className="wcu-card-content">
              <h3 className="wcu-card-title">Fair & Transparent Pricing</h3>
              <p className="wcu-card-description">
                Custom personalized art should be accessible. Honest pricing with zero hidden fees or charges.
              </p>
            </div>
          </div>

          <div className="wcu-card">
            <div className="wcu-icon-wrapper">
              <Icons.Heart size={24} className="wcu-icon" />
            </div>
            <div className="wcu-card-content">
              <h3 className="wcu-card-title">Loved by Thousands</h3>
              <p className="wcu-card-description">
                Over 10,000+ custom gifts created and delivered, bringing tears of joy and smiles to families nationwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
