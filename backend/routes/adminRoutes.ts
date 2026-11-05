import { Router, Response } from 'express';
import { db, ProductDocument, OrderDocument } from '../db.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../auth.js';
import { asyncHandler } from '../http.js';

const router = Router();

// Protect all admin routes
router.use(asyncHandler(authenticateUser), requireAdmin);

// Dashboard Analytics
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await db.getProducts();
  const orders = await db.getOrders();
  const users = await db.getUsers();

  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalProducts = products.length;

  const lowStockProducts = products.filter(p => p.stock <= 15);
  const recentOrders = orders.slice(0, 8);

  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  return res.json({
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    categoryCounts
  });
}));

// Products CRUD
router.post('/products', asyncHandler(async (req: AuthRequest, res: Response) => {
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
  if (typeof name !== 'string' || name.trim().length > 200 || !Number.isFinite(Number(price)) || Number(price) <= 0 || Number(price) > 100000000) {
    return res.status(400).json({ error: 'Enter a valid product name and price.' });
  }

  const newProduct = await db.createProduct({
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

  await db.addAuditEntry(req.user!._id, 'create', 'product', { productId: newProduct._id, name: newProduct.name });

  return res.status(201).json(newProduct);
}));

router.put('/products/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.body.price !== undefined && (!Number.isFinite(Number(req.body.price)) || Number(req.body.price) <= 0)) {
    return res.status(400).json({ error: 'Product price must be greater than zero.' });
  }
  const updated = await db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  await db.addAuditEntry(req.user!._id, 'update', 'product', { productId: updated._id, name: updated.name });
  return res.json(updated);
}));

router.delete('/products/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found or already deleted.' });
  }
  await db.addAuditEntry(req.user!._id, 'delete', 'product', { productId: req.params.id });
  return res.json({ message: 'Product successfully deleted.', id: req.params.id });
}));

// Orders Management
router.get('/orders', asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await db.getOrders();
  return res.json(orders);
}));

router.put('/orders/:id/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderDocument['status'][] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  const updated = await db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  await db.addAuditEntry(req.user!._id, 'update', 'order', { orderId: updated._id, status });
  return res.json(updated);
}));

// Users Management
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = (await db.getUsers()).map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    address: u.address,
    createdAt: u.createdAt
  }));
  return res.json(users);
}));

router.put('/users/:id/role', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'customer') {
    return res.status(400).json({ error: 'Role must be admin or customer.' });
  }

  const updated = await db.updateUser(req.params.id, { role });
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }
  await db.addAuditEntry(req.user!._id, 'update', 'user_role', { userId: updated._id, role });
  return res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role
  });
}));

router.get('/content', asyncHandler(async (_req: AuthRequest, res: Response) => {
  return res.json(await db.getSiteContent());
}));

router.put('/users/:id/active', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { active } = req.body;
  if (typeof active !== 'boolean') return res.status(400).json({ error: 'Active status must be true or false.' });
  if (req.params.id === req.user!._id && !active) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  const updated = await db.updateUser(req.params.id, { active });
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  await db.addAuditEntry(req.user!._id, 'update', 'user', { userId: updated._id, active });
  return res.json({ _id: updated._id, active: updated.active });
}));

router.get('/content/audit', asyncHandler(async (_req: AuthRequest, res: Response) => {
  return res.json(await db.getAuditEntries());
}));

router.put('/content', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Website content must be an object.' });
  }
  const current = await db.getSiteContent();
  const next = { ...current };
  for (const [key, value] of Object.entries(req.body)) {
    if (!(key in current)) return res.status(400).json({ error: `Unknown website content field: ${key}` });
    if (typeof current[key] === 'string') {
      if (typeof value !== 'string' || value.length > (key === 'heroImage' ? 1000000 : 2000)) {
        return res.status(400).json({ error: `Invalid value for ${key}.` });
      }
      if (key === 'instagramUrl' && value && !/^https:\/\//i.test(value)) {
        return res.status(400).json({ error: 'Social media links must use HTTPS.' });
      }
      if (key === 'heroImage' && value && !/^(https:\/\/|\/|data:image\/(png|jpeg|webp);base64,)/i.test(value)) {
        return res.status(400).json({ error: 'Hero image must be an HTTPS URL, site path, or PNG/JPEG/WebP upload.' });
      }
      next[key] = value.trim();
    } else if (typeof current[key] === 'boolean') {
      if (typeof value !== 'boolean') return res.status(400).json({ error: `Invalid value for ${key}.` });
      next[key] = value;
    } else if (typeof current[key] === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({ error: `Invalid value for ${key}.` });
      }
      next[key] = value;
    }
  }
  for (const dateField of ['promotionStartsAt', 'promotionEndsAt']) {
    const value = next[dateField];
    if (typeof value === 'string' && value && !Number.isFinite(Date.parse(value))) {
      return res.status(400).json({ error: `Invalid date for ${dateField}.` });
    }
  }
  return res.json(await db.saveSiteContent(next, req.user!._id));
}));

export default router;
