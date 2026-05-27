import React, { useState, useEffect } from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

const slides = ['/hero_deity.png', '/hero_couple.png'];

export const Hero: React.FC<HeroProps> = ({
  title = 'Perfect Gifts for your loved ones',
  subtitle = 'Discover beautifully detailed deity statues, custom couple figurines, and personalized gifts crafted to perfection.',
  ctaText = 'Explore Collection',
  ctaHref = '#collection'
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // changes every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-container">
      {/* Slideshow background layers */}
      {slides.map((img, index) => (
        <div
          key={img}
          className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Decorative ambient glowing radial circles */}
      <div className="ambient-glow"></div>

      <div className="hero-content-wrapper">
        {/* Left Side: Call to Action Details */}
        <div className="hero-left">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <a href={ctaHref} className="cta-button">
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};
