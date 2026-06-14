import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MostPopular } from './components/MostPopular';
import { WhyChooseUs } from './components/WhyChooseUs';
import { OurCollection } from './components/OurCollection';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { supabase, isPlaceholderClient } from './lib/supabase';
import * as Icons from 'lucide-react';
import Lenis from 'lenis';
import { AdminPanel } from './components/AdminPanel';
import { CollectionView } from './components/CollectionView';
import { CustomizeModal } from './components/CustomizeModal';
import { MyOrders } from './components/MyOrders';
import { Support } from './components/Support';
import { Reviews } from './components/Reviews';
import type { Review } from './components/Reviews';

interface BackendData {
  logo: {
    text: string;
    icon: string;
  };
  navigation: Array<{ label: string; href: string }>;
  hero: {
    title: string;
    subtitle: string;
    cta: {
      text: string;
      href: string;
    };
  };
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  price_4in?: number;
  price_6in?: number;
  price_8in?: number;
  rating: number;
  reviews: number;
  image: string;
  collection_id: string;
  is_popular: boolean;
  tag?: string;
}

const defaultProducts: Product[] = [
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
    tag: 'Best Seller'
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
    tag: 'Customizable'
  },
  {
    id: 3,
    title: 'Lithophane Magic Lamp',
    description: 'Cylindrical photo lamp that glows with your favorite memory.',
    price: 69.00,
    rating: 4.9,
    reviews: 210,
    image: 'https://files.catbox.moe/ghoz6k.png',
    collection_id: 'vault',
    is_popular: true,
    tag: 'Trending'
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
    tag: 'New'
  },
  {
    id: 5,
    title: 'Shiva Meditating Sculpture',
    description: 'Serene meditating Lord Shiva statue, resin printed, matte gray stone finish.',
    price: 59.00,
    rating: 4.9,
    reviews: 42,
    image: 'https://files.catbox.moe/rix4zz.png',
    collection_id: 'divine',
    is_popular: false
  },
  {
    id: 6,
    title: 'Radha Krishna Statue',
    description: 'Detailed divine couple miniature in white marble resin finish.',
    price: 89.00,
    rating: 4.8,
    reviews: 31,
    image: 'https://files.catbox.moe/rix4zz.png',
    collection_id: 'divine',
    is_popular: false
  },
  {
    id: 7,
    title: 'Custom Hand-in-Hand Miniature',
    description: 'A beautiful keepsake capturing a couple holding hands, resin-cast detail.',
    price: 99.00,
    rating: 4.9,
    reviews: 23,
    image: 'https://files.catbox.moe/j5bog0.png',
    collection_id: 'couples',
    is_popular: false
  },
  {
    id: 8,
    title: 'Mini Portrait Bust',
    description: 'Highly detailed 1:6 scale portrait bust printed from your profile photo.',
    price: 79.00,
    rating: 4.8,
    reviews: 19,
    image: 'https://files.catbox.moe/zhjil3.png',
    collection_id: 'singles',
    is_popular: false
  },
  {
    id: 9,
    title: 'Rotating Photo Cube Lamp',
    description: 'Four-sided lithophane cube lamp containing 4 of your custom pictures.',
    price: 99.00,
    rating: 4.9,
    reviews: 67,
    image: 'https://files.catbox.moe/ghoz6k.png',
    collection_id: 'vault',
    is_popular: false
  }
];

const defaultReviews: Review[] = [
  {
    id: 'rev-1',
    user_id: 'user-1',
    user_name: 'Aarav Sharma',
    product_id: 1,
    product_title: 'Divine Ganesha Statue',
    product_image: 'https://files.catbox.moe/hhyds5.png',
    rating: 5,
    comment: 'Absolutely gorgeous! The level of detail on Ganesha is stunning, and the antique bronze finish looks extremely premium on my office desk. Highly recommend!',
    created_at: '2026-05-15T12:00:00Z',
  },
  {
    id: 'rev-2',
    user_id: 'user-2',
    user_name: 'Priya Patel',
    product_id: 2,
    product_title: 'Personalized Couple Sculpture',
    product_image: 'https://files.catbox.moe/zhjil3.png',
    rating: 5,
    comment: 'I ordered this for our 5th anniversary. It turned out beyond my expectations! The resemblance is amazing and the seller was very helpful with customization. Thank you!',
    created_at: '2026-05-18T15:30:00Z',
  },
  {
    id: 'rev-3',
    user_id: 'user-3',
    user_name: 'Karan Malhotra',
    product_id: 3,
    product_title: 'Lithophane Magic Lamp',
    product_image: 'https://files.catbox.moe/ghoz6k.png',
    rating: 4,
    comment: 'Unique gift idea. The photos show up beautifully when the light is switched on. A bit smaller than expected, but the quality makes up for it.',
    created_at: '2026-05-22T09:45:00Z',
  }
];

function App() {
  const [data, setData] = useState<BackendData | null>({
    logo: {
      text: 'Giftworld',
      icon: 'Gift'
    },
    navigation: [
      { label: 'Most Popular', href: '#most-popular' },
      { label: 'Our Collection', href: '#collection' },
      { label: 'Vault', href: '#collections/vault' },
      { label: 'Support', href: '#support' }
    ],
    hero: {
      title: 'Perfect Gifts for your loved ones',
      subtitle: 'Discover beautifully detailed deity statues, custom couple figurines, and personalized gifts crafted to perfection.',
      cta: {
        text: 'Explore Collection',
        href: '#collection'
      }
    }
  });
  const [loading, setLoading] = useState(true);
  
  // API base URL
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_BASE_URL || 'https://giftworld-backend.onrender.com');

  // Cart, Auth & Products States
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'customer' | 'admin'>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [currentView, setCurrentView] = useState<string>('home');
  const currentViewRef = useRef(currentView);

  // Customization Modal State
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [pendingCustomizeProduct, setPendingCustomizeProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleOpenCustomize = (product: Product) => {
    if (!user) {
      // User not logged in — save the product and prompt login
      setPendingCustomizeProduct(product);
      setAuthTab('signin');
      setIsAuthOpen(true);
      return;
    }
    
    if (product.collection_id === 'vault' || product.collection_id === 'readymade' || product.collection_id === 'lamps') {
      handleAddToCart({
        cartItemId: `${product.id}-vault-${Date.now()}`,
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        size: 'Standard',
      });
      return;
    }
    
    setCustomizeProduct(product);
  };

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Hash change listener for router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      let nextView = 'home';
      if (hash === '#admin') {
        nextView = 'admin';
      } else if (hash === '#my-orders') {
        nextView = 'my-orders';
      } else if (hash === '#support' || hash.startsWith('#support/')) {
        nextView = 'support';
      } else if (hash.startsWith('#collections/')) {
        const id = hash.replace('#collections/', '');
        nextView = `collection-${id}`;
      }

      const prevView = currentViewRef.current;
      setCurrentView(nextView);

      const isHomeAnchor = hash && 
        !hash.startsWith('#collections/') && 
        !hash.startsWith('#support') && 
        !hash.startsWith('#my-orders') && 
        hash !== '#admin' && 
        hash !== '#' && 
        hash !== '#/';

      if (isHomeAnchor) {
        if (prevView !== 'home') {
          // Transitioning from another view to home view: wait for rendering, then scroll
          setTimeout(() => {
            const id = hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo(0, 0);
            }
          }, 100);
        } else {
          // Already on home view: let the browser/Lenis handle anchor scrolling.
          // Do NOT scroll to top.
        }
      } else {
        // Not a home anchor (e.g. going to admin, collection, or home-top), scroll to top.
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic role checker based on backend API
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole('customer');
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setUserRole('customer');
          return;
        }
        const res = await fetch(`${API_BASE}/api/auth/role`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
          // If admin, ensure the user_roles row exists in Supabase DB
          // This is required for storage upload policies to work
          if (data.role === 'admin') {
            supabase.rpc('ensure_admin_role').then(({ error }) => {
              if (error) console.warn('ensure_admin_role RPC failed (run supabase_ensure_admin_fn.sql):', error.message);
            });
          }
        } else {
          setUserRole('customer');
        }
      } catch (err) {
        console.warn('Failed to fetch role from backend API:', err);
        // Check env fallback locally
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';
        const isAdmin = user && user.email?.toLowerCase() === adminEmail.toLowerCase();
        setUserRole(isAdmin ? 'admin' : 'customer');
      }
    };

    fetchUserRole();
  }, [user]);

  // Route Guard for Admin Panel & My Orders
  useEffect(() => {
    if (currentView === 'admin') {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';
      const isAdminUser = user && (userRole === 'admin' || user.email?.toLowerCase() === adminEmail.toLowerCase());
      if (!isAdminUser) {
        window.location.hash = '';
        setCurrentView('home');
      }
    }
    if (currentView === 'my-orders' && !user) {
      window.location.hash = '';
      setCurrentView('home');
    }
  }, [currentView, user, userRole]);

  // Seed / Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (isPlaceholderClient) {
          throw new Error('Placeholder client: bypass remote read');
        }
        
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) throw error;

        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          localStorage.setItem('giftworld_products', JSON.stringify(dbProducts));
        } else {
          // Seed database if empty
          const { error: seedError } = await supabase.from('products').insert(defaultProducts);
          if (!seedError) {
            setProducts(defaultProducts);
            localStorage.setItem('giftworld_products', JSON.stringify(defaultProducts));
          }
        }
      } catch (err) {
        console.warn('Supabase products fetch bypassed or failed, using LocalStorage. Error:', err);
        const local = localStorage.getItem('giftworld_products');
        if (local) {
          setProducts(JSON.parse(local));
        } else {
          setProducts(defaultProducts);
          localStorage.setItem('giftworld_products', JSON.stringify(defaultProducts));
        }
      }
    };

    fetchProducts();
  }, []);

  // Seed / Load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (isPlaceholderClient) {
          throw new Error('Placeholder client: bypass remote read');
        }
        
        const { data: dbReviews, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;

        if (dbReviews && dbReviews.length > 0) {
          setReviews(dbReviews);
          localStorage.setItem('giftworld_reviews', JSON.stringify(dbReviews));
        } else {
          // Seed database with default reviews if empty
          const { error: seedError } = await supabase.from('reviews').insert(defaultReviews);
          if (!seedError) {
            setReviews(defaultReviews);
            localStorage.setItem('giftworld_reviews', JSON.stringify(defaultReviews));
          }
        }
      } catch (err) {
        console.warn('Supabase reviews fetch bypassed or failed, using LocalStorage. Error:', err);
        const local = localStorage.getItem('giftworld_reviews');
        if (local) {
          setReviews(JSON.parse(local));
        } else {
          setReviews(defaultReviews);
          localStorage.setItem('giftworld_reviews', JSON.stringify(defaultReviews));
        }
      }
    };

    fetchReviews();
  }, []);

  // Supabase Auth state listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        // Force redirect to home on sign in
        window.location.hash = '';
        setCurrentView('home');
      } else {
        setUser(null);
        // Force redirect to home on sign out
        window.location.hash = '';
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch backend details
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      fetch('http://localhost:5000/api/hero')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
          })
          .then((jsonData: BackendData) => {
            setData(jsonData);
            setLoading(false);
          })
          .catch(() => {
            console.log('Backend API optional fetch bypassed, using default client-side data.');
            setLoading(false);
          });
    } else {
      setLoading(false);
    }
  }, []);

  // Product CRUD Handlers
  const handleAddProduct = async (newProd: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProd)
      });
      if (!res.ok) throw new Error('Backend insertion failed');
      
      const savedProduct = await res.json();
      const updated = [...products, savedProduct];
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));
    } catch (err) {
      console.warn('Backend API add product failed, using client fallback. Error:', err);
      const freshProduct: Product = {
        ...newProd,
        id: Date.now(), // Unique ID fallback
        rating: 4.8,
        reviews: 45,
      };

      const updated = [...products, freshProduct];
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));

      try {
        if (!isPlaceholderClient) {
          await supabase.from('products').insert([newProd]);
        }
      } catch (dbErr) {
        console.error('Supabase fallback insert failed:', dbErr);
      }
    }
  };

  const handleUpdateProduct = async (id: number, updatedFields: Partial<Product>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Backend update failed');
      
      const updatedProduct = await res.json();
      const updated = products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p));
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));
    } catch (err) {
      console.warn('Backend API update product failed, using client fallback. Error:', err);
      const updated = products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));

      try {
        if (!isPlaceholderClient) {
          await supabase.from('products').update(updatedFields).eq('id', id);
        }
      } catch (dbErr) {
        console.error('Supabase fallback update failed:', dbErr);
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Backend deletion failed');
      
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));
    } catch (err) {
      console.warn('Backend API delete product failed, using client fallback. Error:', err);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('giftworld_products', JSON.stringify(updated));

      try {
        if (!isPlaceholderClient) {
          await supabase.from('products').delete().eq('id', id);
        }
      } catch (dbErr) {
        console.error('Supabase fallback delete failed:', dbErr);
      }
    }
  };

  const handleAddReview = async (newReview: Omit<Review, 'id' | 'created_at'>) => {
    const freshReview: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const updated = [freshReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('giftworld_reviews', JSON.stringify(updated));

    try {
      if (!isPlaceholderClient) {
        await supabase.from('reviews').insert([newReview]);
      }
    } catch (err) {
      console.error('Supabase insert review failed:', err);
    }
  };

  // Cart Operations
  const handleAddToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartItemId === itemToAdd.cartItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.cartItemId === itemToAdd.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...itemToAdd, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleCheckout = async (shippingDetails?: { customerName: string; mobileNumber: string; address: string }) => {
    if (!user) {
      alert('Please login to place an order.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const orderPayloads = cart.map((item) => ({
        user_id: user.id,
        user_email: user.email || '',
        customer_name: item.customerName || shippingDetails?.customerName || 'Customer',
        mobile_number: item.mobileNumber || shippingDetails?.mobileNumber || '',
        address: item.address || shippingDetails?.address || '',
        product_id: item.id,
        product_title: item.title,
        product_image: item.image,
        selected_size: item.size || 'Standard',
        custom_photo_url: item.customPhotoUrl || null,
        price: item.price,
        quantity: item.quantity,
        status: 'pending',
      }));

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayloads)
      });

      if (!res.ok) {
        throw new Error('API checkout failed');
      }

      setCart([]);
      setIsCartOpen(false);
      alert('Order placed successfully! You can track it in My Orders.');
      window.location.hash = '#my-orders';
    } catch (err: any) {
      console.warn('Backend API checkout failed, using client fallback. Error:', err);
      try {
        if (isPlaceholderClient) {
          console.log('[Checkout Mock] Placing orders for items:', cart);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setCart([]);
          setIsCartOpen(false);
          alert('Order placed successfully! You can track it in My Orders.');
          window.location.hash = '#my-orders';
          return;
        }

        const orderPayloads = cart.map((item) => ({
          user_id: user.id,
          user_email: user.email || '',
          customer_name: item.customerName || shippingDetails?.customerName || 'Customer',
          mobile_number: item.mobileNumber || shippingDetails?.mobileNumber || '',
          address: item.address || shippingDetails?.address || '',
          product_id: item.id,
          product_title: item.title,
          product_image: item.image,
          selected_size: item.size || 'Standard',
          custom_photo_url: item.customPhotoUrl || null,
          price: item.price,
          quantity: item.quantity,
          status: 'pending',
        }));

        const { error } = await supabase.from('orders').insert(orderPayloads);
        if (error) throw error;

        setCart([]);
        setIsCartOpen(false);
        alert('Order placed successfully! You can track it in My Orders.');
        window.location.hash = '#my-orders';
      } catch (fallbackErr: any) {
        console.error('Checkout failed completely:', fallbackErr);
        alert(`Failed to place order: ${fallbackErr.message}`);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.hash = '';
      setCurrentView('home');
      alert('Successfully signed out!');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleOpenAuth = (tab: 'signin' | 'register') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-wrapper">
      <main className="main-content">
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'var(--hero-height)',
            color: '#4b5563',
            fontSize: '1.2rem',
            fontWeight: 500
          }}>
            Loading Giftworld...
          </div>
        ) : (
          <>
            <Header 
              logoText={data?.logo?.text} 
              navItems={data?.navigation}
              cartCount={cartCount}
              onOpenCart={() => setIsCartOpen(true)}
              currentUser={user}
              onSignOut={handleSignOut}
              onOpenAuth={handleOpenAuth}
              isAdminUser={userRole === 'admin'}
            />

            {/* Dynamic View rendering */}
            {currentView === 'admin' ? (
              <AdminPanel
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            ) : currentView === 'my-orders' && user ? (
              <MyOrders userId={user.id} />
            ) : currentView === 'support' ? (
              <Support />
            ) : currentView.startsWith('collection-') ? (
              <CollectionView
                collectionId={currentView.replace('collection-', '')}
                products={products}
                onAddToCart={handleOpenCustomize}
              />
            ) : (
              <>
                <Hero 
                  title={data?.hero?.title} 
                  subtitle={data?.hero?.subtitle} 
                  ctaText={data?.hero?.cta?.text} 
                  ctaHref={data?.hero?.cta?.href} 
                />
                <MostPopular 
                  onAddToCart={handleOpenCustomize} 
                  // Pass down only marked popular items
                  popularProducts={products.filter((p) => p.is_popular)} 
                />
                <WhyChooseUs />
                <OurCollection />
                <Reviews
                  products={products}
                  reviews={reviews}
                  currentUser={user}
                  onAddReview={handleAddReview}
                  onOpenAuth={handleOpenAuth}
                />
              </>
            )}
            
            {/* Elegant Footer */}
            <footer className="footer-container">
              <div className="footer-content">
                <div className="footer-brand">
                  <div className="logo-link">
                    <Icons.Gift className="logo-icon" size={24} strokeWidth={2.2} />
                    <span>Giftworld</span>
                  </div>
                  <p className="footer-desc">Premium 3D printed custom miniatures, spiritual deity statues, and customized gifts designed to capture your special moments forever.</p>
                </div>
                <div className="footer-links-group">
                  <div className="footer-links-col">
                    <h4>Collections</h4>
                    <a href="#collections/divine">Divine Statues</a>
                    <a href="#collections/couples">Custom Couples</a>
                    <a href="#collections/singles">Custom Singles</a>
                    <a href="#collections/vault">Vault</a>
                  </div>
                  <div className="footer-links-col">
                    <h4>Support</h4>
                    <a href="#support/faq">FAQs</a>
                    <a href="#support/shipping">Shipping & Returns</a>
                    <a href="https://wa.me/917542043169" target="_blank" rel="noopener noreferrer">Contact Us</a>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Giftworld. All rights reserved.</p>
                <div className="footer-socials">
                  <a href="#instagram" aria-label="Instagram" className="social-icon-link">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#facebook" aria-label="Facebook" className="social-icon-link">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="#twitter" aria-label="Twitter" className="social-icon-link">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </footer>

            {/* Global Drawer and Modals */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
            />

            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => {
                setIsAuthOpen(false);
                // Clear pending product if user closes auth without signing in
                if (!user) setPendingCustomizeProduct(null);
              }}
              initialTab={authTab}
              onAuthSuccess={(userData) => {
                setUser(userData);
                // Auto-open customize modal or add direct if readymade
                if (pendingCustomizeProduct) {
                  const prod = pendingCustomizeProduct;
                  setPendingCustomizeProduct(null);
                  setTimeout(() => {
                    if (prod.collection_id === 'vault' || prod.collection_id === 'readymade' || prod.collection_id === 'lamps') {
                      handleAddToCart({
                        cartItemId: `${prod.id}-vault-${Date.now()}`,
                        id: prod.id,
                        title: prod.title,
                        price: prod.price,
                        image: prod.image,
                        size: 'Standard',
                      });
                    } else {
                      setCustomizeProduct(prod);
                    }
                  }, 500);
                }
              }}
            />

            <CustomizeModal
              isOpen={customizeProduct !== null}
              onClose={() => setCustomizeProduct(null)}
              product={customizeProduct}
              userId={user?.id}
              userEmail={user?.email}
              onAddToCart={handleAddToCart}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
