import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoText?: string;
  navItems?: NavItem[];
  cartCount: number;
  onOpenCart: () => void;
  currentUser: any;
  onSignOut: () => void;
  onOpenAuth: (tab: 'signin' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoText = 'Giftworld',
  navItems = [
    { label: 'Most Popular', href: '#most-popular' },
    { label: 'Our Collection', href: '#collection' },
    { label: 'Support', href: '#support' }
  ],
  cartCount,
  onOpenCart,
  currentUser,
  onSignOut,
  onOpenAuth,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';
  const isAdmin = currentUser && currentUser.email?.toLowerCase() === adminEmail.toLowerCase();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      setIsProfileOpen(!isProfileOpen);
    } else {
      onOpenAuth('signin');
    }
  };

  const closeAllMenus = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  React.useEffect(() => {
    window.addEventListener('click', closeAllMenus);
    return () => window.removeEventListener('click', closeAllMenus);
  }, []);

  return (
    <header className="header-container">
      {/* Left Logo Tab */}
      <div className="header-logo-tab">
        <a href="/" className="logo-link" onClick={closeAllMenus}>
          <img src="https://files.catbox.moe/n8hhzh.jpg" alt="Giftworld Logo" className="logo-img" />
          <span>{logoText}</span>
        </a>
      </div>

      {/* Right Navigation & Icons Tab */}
      <div className="header-nav-tab">
        <nav className="nav-menu">
          {navItems.map((item, idx) => (
            <li key={idx}>
              <a href={item.href} className="nav-link">
                {item.label}
              </a>
            </li>
          ))}
        </nav>

        <div className="header-icons">
          {/* Cart Icon with badge - only visible when signed in */}
          {currentUser && (
            <button className="icon-btn cart-icon-btn" aria-label="Shopping Cart" onClick={onOpenCart}>
              <Icons.ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {/* Profile Option next to Cart */}
          <div className="profile-dropdown-wrapper">
            <button className="icon-btn profile-icon-btn" aria-label="Profile" onClick={handleProfileClick}>
              {currentUser ? <Icons.UserCheck size={20} strokeWidth={2} className="user-active-icon" /> : <Icons.User size={20} strokeWidth={2} />}
            </button>
            
            {isProfileOpen && currentUser && (
              <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="profile-dropdown-info">
                  <p className="profile-email-title">Signed in as</p>
                  {currentUser.user_metadata?.full_name && (
                    <p className="profile-name" style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem', marginBottom: '2px' }}>
                      {currentUser.user_metadata.full_name}
                    </p>
                  )}
                  <p className="profile-email">{currentUser.email}</p>
                  <div className="divider"></div>
                  {isAdmin && (
                    <>
                      <a href="#admin" className="profile-dropdown-btn" style={{ textDecoration: 'none' }} onClick={closeAllMenus}>
                        <Icons.Settings size={16} />
                        <span>Admin Dashboard</span>
                      </a>
                      <div className="divider"></div>
                    </>
                  )}
                  <button className="profile-dropdown-btn" onClick={() => { onOpenCart(); closeAllMenus(); }}>
                    <Icons.ShoppingBag size={16} />
                    <span>My Cart ({cartCount})</span>
                  </button>
                  <a href="#my-orders" className="profile-dropdown-btn" style={{ textDecoration: 'none' }} onClick={closeAllMenus}>
                    <Icons.Package size={16} />
                    <span>My Orders</span>
                  </a>
                  <div className="divider"></div>
                  <button className="profile-dropdown-btn signout-btn" onClick={() => { onSignOut(); closeAllMenus(); }}>
                    <Icons.LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="icon-btn mobile-menu-btn" 
            aria-label="Open Menu" 
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
          >
            {isMobileMenuOpen ? <Icons.X size={20} strokeWidth={2} /> : <Icons.Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeAllMenus}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo-link">
                <img src="https://files.catbox.moe/n8hhzh.jpg" alt="Giftworld Logo" className="logo-img" />
                <span>{logoText}</span>
              </div>
              <button className="icon-btn close-btn" onClick={closeAllMenus}>
                <Icons.X size={20} />
              </button>
            </div>
            
            <nav className="mobile-nav-list">
              {navItems.map((item, idx) => (
                <a key={idx} href={item.href} className="mobile-nav-link" onClick={closeAllMenus}>
                  {item.label}
                </a>
              ))}
              {currentUser && (
                <>
                  {isAdmin && (
                    <a href="#admin" className="mobile-nav-link" onClick={closeAllMenus}>
                      Admin Dashboard
                    </a>
                  )}
                  <a href="#my-orders" className="mobile-nav-link" onClick={closeAllMenus}>
                    My Orders
                  </a>
                  <a href="#cart" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onOpenCart(); closeAllMenus(); }}>
                    Cart ({cartCount} items)
                  </a>
                </>
              )}
            </nav>

            <div className="mobile-auth-section">
              {currentUser ? (
                <div className="mobile-profile-info">
                  <div className="user-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                      <Icons.User size={20} />
                      <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{currentUser.user_metadata?.full_name || 'Customer'}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', paddingLeft: '28px' }}>{currentUser.email}</span>
                  </div>
                  <button className="mobile-action-btn signout-btn" onClick={() => { onSignOut(); closeAllMenus(); }}>
                    <Icons.LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <button className="mobile-action-btn register" onClick={() => { onOpenAuth('signin'); closeAllMenus(); }}>
                    <Icons.LogIn size={16} />
                    <span>Sign In / Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
