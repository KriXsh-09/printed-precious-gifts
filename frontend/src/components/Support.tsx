import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does the custom photo order process work?",
    answer: "Simply select your desired product collection (such as divine deities, couples, or lithophane lamps), choose the height, fill out your delivery details, and upload your high-quality reference photo. After adding to cart and placing your order, our professional design team reviews the photo, creates a high-detail 3D model, and outputs it to our advanced precision 3D printers."
  },
  {
    question: "What type of photos work best for custom prints?",
    answer: "We recommend close-up portrait or couple photos with clear facial details, front-facing angles, and good natural lighting. High-resolution, well-focused photos help our 3D designers capture the exact contours and features, leading to a much higher quality custom miniature."
  },
  {
    question: "Can I cancel or modify my customized order?",
    answer: "Because custom digital modeling and 3D printing starts shortly after an order is placed, cancellations or detail modifications can only be made within 2 hours of placing your order. To request changes, please email support@giftworld.in immediately with your order ID."
  },
  {
    question: "What materials do you use for printing?",
    answer: "We utilize premium, eco-friendly PLA (polylactic acid) polymer filaments for our beautiful lithophane lamps, and high-density, impact-resistant marble resins for our detailed deity statues and custom portrait miniatures. This ensures a clean, smooth matte finish alongside excellent structural durability."
  },
  {
    question: "How can I track my order status?",
    answer: "You can track the status of your order at any time! Click on your profile icon in the top navigation bar, select 'My Orders', and view the live status. The status will update from Pending (order received), to Processing (design & print stage), Shipped (on its way), and finally Delivered."
  }
];

export const Support: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  useEffect(() => {
    const scrollToSection = () => {
      const hash = window.location.hash;
      if (hash.endsWith('/shipping')) {
        const el = document.getElementById('shipping-returns');
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      } else if (hash.endsWith('/faq')) {
        const el = document.getElementById('faq-accordion');
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    };

    scrollToSection();
    window.addEventListener('hashchange', scrollToSection);
    return () => window.removeEventListener('hashchange', scrollToSection);
  }, []);

  return (
    <div className="support-container">
      {/* Navigation Header */}
      <div className="support-nav-header">
        <a href="#" className="back-home-btn">
          <Icons.ArrowLeft size={16} />
          <span>Back to Storefront</span>
        </a>
      </div>

      {/* Main Header */}
      <div className="support-header">
        <div className="support-header-icon">
          <Icons.HelpCircle size={28} />
        </div>
        <div>
          <h1 className="support-title">Support & Help Center</h1>
          <p className="support-subtitle">Find information on shipping terms, return guidelines, and frequently asked questions.</p>
        </div>
      </div>

      {/* Section 1: Shipping & Returns T&C */}
      <section id="shipping-returns" className="support-section">
        <h2 className="section-title-bar">
          <Icons.Truck size={20} />
          <span>Shipping & Return Policies</span>
        </h2>
        
        <div className="shipping-tc-grid">
          <div className="tc-card">
            <div className="tc-card-header">
              <Icons.ShieldCheck size={20} className="tc-icon gold" />
              <h3>Custom Production & Transit</h3>
            </div>
            <p>Every customized 3D creation requires 2-4 business days for custom digital modeling, printing, and hand-finishing. Shipping takes an additional 3-5 business days depending on your location in India.</p>
          </div>

          <div className="tc-card">
            <div className="tc-card-header">
              <Icons.Inbox size={20} className="tc-icon blue" />
              <h3>Premium Secure Packaging</h3>
            </div>
            <p>To guarantee that your spiritual statues and custom figurines arrive in pristine condition, we package each item in dual-layer thick bubble wrap, secure foam cavities, and high-impact shipping boxes.</p>
          </div>

          <div className="tc-card full-width">
            <div className="tc-card-header">
              <Icons.AlertTriangle size={20} className="tc-icon red" />
              <h3>Return & Replacement Policy</h3>
            </div>
            <p>Because custom-printed orders are uniquely modeled and printed from your personal photos, we are unable to accept returns, exchanges, or refunds for changes of mind. However, <strong>we provide a 100% free replacement</strong> if your item arrives damaged in transit or exhibits manufacturing defects. Please email a photo of the damaged package and product to support@giftworld.in within 24 hours of delivery.</p>
          </div>
        </div>
      </section>

      {/* Section 2: Frequently Asked Questions (FAQ) */}
      <section id="faq-accordion" className="support-section">
        <h2 className="section-title-bar">
          <Icons.MessageSquare size={20} />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="faq-list">
          {faqData.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`faq-item-card ${isOpen ? 'active' : ''}`}>
                <button 
                  className="faq-question-btn" 
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <Icons.ChevronDown size={18} className="faq-chevron" />
                </button>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer-content">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
