import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Clients
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const hasServiceKey = supabaseServiceRoleKey && supabaseServiceRoleKey !== 'placeholder-service-role-key';
const supabaseAdmin = hasServiceKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : supabase;

const getSupabaseClient = (req) => {
  if (isPlaceholder) return supabase;
  
  if (hasServiceKey) {
    return supabaseAdmin;
  }
  
  const authHeader = req?.headers?.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  
  return supabase;
};

// --- Helper Mock Store (for testing/development fallback) ---
const mockOrders = [];

// Helper to filter payload to only columns that exist in the database table
const getFilteredPayload = async (table, payload) => {
  try {
    const { data } = await supabase.from(table).select().limit(1);
    const validColumns = (data && data.length > 0) ? Object.keys(data[0]) : [];
    if (validColumns.length === 0) {
      // Predefined default columns if table is completely empty
      const defaults = {
        products: ['title', 'description', 'price', 'image', 'collection_id', 'is_popular', 'rating', 'reviews'],
        orders: ['user_id', 'user_email', 'customer_name', 'mobile_number', 'address', 'product_id', 'product_title', 'product_image', 'selected_size', 'custom_photo_url', 'price', 'quantity', 'status']
      };
      validColumns.push(...(defaults[table] || []));
    }
    
    const filtered = {};
    for (const key of Object.keys(payload)) {
      if (validColumns.includes(key) && payload[key] !== undefined) {
        filtered[key] = payload[key];
      }
    }
    return filtered;
  } catch (err) {
    console.error(`Error filtering payload for ${table}:`, err);
    return payload;
  }
};

// --- MIDDLEWARES ---

// User authentication JWT token validator
const authenticateUser = async (req, res, next) => {
  if (isPlaceholder) {
    // Simulated auth check in placeholder mode
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Auth header missing or invalid' });
    }
    const mockEmail = authHeader.split(' ')[1] || 'customer@example.com';
    req.user = {
      id: 'mock-uuid-1234',
      email: mockEmail,
      user_metadata: { full_name: 'Mock Customer' },
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Admin authentication verification middleware
const requireAdmin = async (req, res, next) => {
  const userEmail = req.user?.email || '';
  const envAdminEmail = process.env.ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';

  // 1. Core verification check: matches env admin email
  if (userEmail.toLowerCase() === envAdminEmail.toLowerCase()) {
    req.userRole = 'admin';
    return next();
  }

  if (isPlaceholder) {
    return res.status(403).json({ error: 'Access denied: Administrator permissions required' });
  }

  try {
    // 2. Query user_roles relation to verify admin status
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();

    if (error || !data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrator permissions required' });
    }

    req.userRole = 'admin';
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ error: 'Internal server error verifying administrator access' });
  }
};

// --- ENDPOINTS ---

// API route to get Hero section details
app.get('/api/hero', (req, res) => {
  res.json({
    logo: {
      text: 'Giftworld',
      icon: 'Gift'
    },
    navigation: [
      { label: 'Most Popular', href: '#most-popular' },
      { label: 'Our Collection', href: '#collection' },
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
});

// Dynamic role checker endpoint
app.get('/api/auth/role', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email || '';
    const envAdminEmail = process.env.ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';

    // Env admin match -> Automatically assure admin role is populated inDB
    if (userEmail.toLowerCase() === envAdminEmail.toLowerCase()) {
      if (!isPlaceholder) {
        const client = getSupabaseClient(req);
        await client.from('user_roles').upsert({ user_id: userId, role: 'admin' });
      }
      return res.json({ role: 'admin' });
    }

    if (isPlaceholder) {
      return res.json({ role: 'customer' });
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.json({ role: 'customer' });
    }
    res.json({ role: data.role });
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ error: 'Failed to retrieve user role' });
  }
});

// Get user orders or admin orders list
app.get('/api/orders', authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email || '';
    const envAdminEmail = process.env.ADMIN_EMAIL || 'giftworldonlineofficial@gmail.com';
    const isAdmin = userEmail.toLowerCase() === envAdminEmail.toLowerCase();

    if (isPlaceholder) {
      const filtered = isAdmin ? mockOrders : mockOrders.filter(o => o.user_id === req.user.id);
      return res.json(filtered);
    }

    const client = getSupabaseClient(req);
    let query = client.from('orders').select('*');

    if (!isAdmin) {
      // Query to ensure the customer only views their own orders
      const { data: roleCheck } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', req.user.id)
        .single();
      
      if (!roleCheck || roleCheck.role !== 'admin') {
        query = query.eq('user_id', req.user.id);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error listing orders:', err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// Submit a new order
app.post('/api/orders', authenticateUser, async (req, res) => {
  try {
    const orderPayloads = req.body;
    const items = Array.isArray(orderPayloads) ? orderPayloads : [orderPayloads];

    // Server-side validation
    for (const item of items) {
      if (!item.product_id || !item.product_title || !item.price || !item.quantity) {
        return res.status(400).json({ error: 'Invalid order data: missing required fields' });
      }
      if (item.quantity <= 0 || item.price <= 0) {
        return res.status(400).json({ error: 'Invalid quantity or price value' });
      }
      
      // Inject authenticated user parameters
      item.user_id = req.user.id;
      item.user_email = req.user.email || '';
      item.status = 'pending';
    }

    if (isPlaceholder) {
      const createdItems = items.map(item => {
        const order = {
          ...item,
          id: `mock-order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockOrders.unshift(order);
        return order;
      });
      return res.status(201).json(createdItems);
    }

    const client = getSupabaseClient(req);
    const { data, error } = await client.from('orders').insert(items).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Update order delivery status (Admin only)
app.put('/api/orders/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (isPlaceholder) {
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx !== -1) {
        mockOrders[idx].status = status;
        mockOrders[idx].updated_at = new Date().toISOString();
        return res.json([mockOrders[idx]]);
      }
      return res.status(404).json({ error: 'Order not found' });
    }

    const client = getSupabaseClient(req);
    const { data, error } = await client
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin-only product publishing endpoint
app.post('/api/products', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular } = req.body;
    if (!title || !image || !price) {
      return res.status(400).json({ error: 'Missing title, price, or image' });
    }

    if (isPlaceholder) {
      const newProd = {
        id: Date.now(),
        title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular,
        rating: 4.8, reviews: 45
      };
      return res.status(201).json(newProd);
    }

    const payload = { title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular };
    const filteredPayload = await getFilteredPayload('products', payload);
    
    const client = getSupabaseClient(req);
    const { data, error } = await client.from('products').insert([filteredPayload]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin-only product update endpoint
app.put('/api/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular } = req.body;

    if (isPlaceholder) {
      return res.json({ id: Number(id), title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular });
    }

    const payload = { title, description, price, price_4in, price_6in, price_8in, image, collection_id, is_popular };
    const filteredPayload = await getFilteredPayload('products', payload);

    const client = getSupabaseClient(req);
    const { data, error } = await client
      .from('products')
      .update(filteredPayload)
      .eq('id', Number(id))
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin-only product deletion endpoint
app.delete('/api/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isPlaceholder) {
      return res.json({ message: 'Product deleted successfully (mock)' });
    }

    const client = getSupabaseClient(req);
    const { error } = await client.from('products').delete().eq('id', Number(id));
    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
