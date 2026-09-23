import { Router, Response } from 'express';
import { db, ProductDocument, OrderDocument } from '../db.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateUser, requireAdmin);

// Dashboard Analytics
router.get('/stats', (req: AuthRequest, res: Response) => {
  const products = db.getProducts();
  const orders = db.getOrders();
  const users = db.getUsers();

  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalProducts = products.length;

  const lowStockProducts = products.filter(p => p.stock <= 15);
  const recentOrders = orders.slice(0, 8);

  // Category sales / product counts
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  res.json({
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    categoryCounts
  });
});

// Products CRUD
router.post('/products', (req: AuthRequest, res: Response) => {
  const {
    name,
    tagline,
    description,
    price,
    deliveryPrice,
    otherProvinceDeliveryPrice,
    discountPrice,
    images,
    category,
    gender,
    sizes,
    colors,
    stock,
    featured,
    newArrival,
    specs
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const newProduct = db.createProduct({
    name: name.trim(),
    tagline: tagline ? tagline.trim() : 'BGY Modern Footwear',
    description: description ? description.trim() : 'Selected for dependable comfort, modern style, and everyday wear.',
    price: Number(price),
    deliveryPrice: deliveryPrice !== undefined ? Number(deliveryPrice) : 3000,
    otherProvinceDeliveryPrice: otherProvinceDeliveryPrice !== undefined ? Number(otherProvinceDeliveryPrice) : 5000,
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop'],
    category: category || 'Sneakers',
    gender: gender || 'unisex',
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes.map(Number) : [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Matte Black', hex: '#111111' }],
    stock: Number(stock) || 10,
    featured: Boolean(featured),
    newArrival: Boolean(newArrival),
    specs: specs || {
      upperMaterial: 'Technical Ripstop & Leather',
      midsole: 'Nitrogen-Infused Hyper-Foam',
      outsole: 'High-Abrasion Carbon Grip',
      weight: '310g',
      drop: '8mm'
    }
  });

  res.status(201).json(newProduct);
});

router.put('/products/:id', (req: AuthRequest, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(updated);
});

router.delete('/products/:id', (req: AuthRequest, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found or already deleted.' });
  }
  res.json({ message: 'Product successfully deleted.', id: req.params.id });
});

// Orders Management
router.get('/orders', (req: AuthRequest, res: Response) => {
  const orders = db.getOrders();
  res.json(orders);
});

router.put('/orders/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderDocument['status'][] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(updated);
});

// Users Management
router.get('/users', (req: AuthRequest, res: Response) => {
  const users = db.getUsers().map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    address: u.address,
    createdAt: u.createdAt
  }));
  res.json(users);
});

router.put('/users/:id/role', (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'customer') {
    return res.status(400).json({ error: 'Role must be admin or customer.' });
  }

  const updated = db.updateUser(req.params.id, { role });
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role
  });
});

export default router;
