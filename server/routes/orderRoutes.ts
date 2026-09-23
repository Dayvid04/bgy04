import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateUser, optionalUser, AuthRequest } from '../auth.js';

const router = Router();

// Create new order (can be authenticated or guest)
router.post('/', optionalUser, (req: AuthRequest, res: Response) => {
  const {
    products,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    customerInfo
  } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one product.' });
  }

  const hasValidAddress =
    shippingAddress &&
    shippingAddress.fullName &&
    (shippingAddress.district || shippingAddress.city) &&
    (shippingAddress.deliveryLocation || shippingAddress.street);

  if (!hasValidAddress) {
    return res.status(400).json({ error: 'Complete delivery address is required (Full Name, District, Delivery Location).' });
  }

  // Validate items and verify inventory
  let subtotal = 0;
  const verifiedProducts = [];

  for (const item of products) {
    const prod = db.findProductById(item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product ${item.name || item.productId} is no longer available.` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod.name}. Available: ${prod.stock}` });
    }

    const itemPrice = prod.discountPrice || prod.price;
    subtotal += itemPrice * item.quantity;

    verifiedProducts.push({
      productId: prod._id,
      name: prod.name,
      image: prod.images[0] || item.image,
      price: itemPrice,
      size: Number(item.size),
      color: item.color || prod.colors[0]?.name || 'Standard',
      quantity: Number(item.quantity)
    });
  }

  // Rwanda delivery: Free over 50,000 RWF, otherwise 3,000 RWF
  const defaultShipping = subtotal >= 50000 ? 0 : 3000;
  const shippingCost = req.body.shippingCost !== undefined ? Number(req.body.shippingCost) : defaultShipping;
  const discount = req.body.discount ? Number(req.body.discount) : 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const userId = req.user ? req.user._id : 'guest_' + Date.now();
  const userEmail = req.user ? req.user.email : (customerInfo?.email || 'customer@bgy.rw');
  const userName = req.user ? req.user.name : (shippingAddress.fullName || 'Valued Guest');

  const district = (shippingAddress.district || shippingAddress.city || 'Gasabo').trim();
  const deliveryLocation = (shippingAddress.deliveryLocation || shippingAddress.street || '').trim();
  const phone = (shippingAddress.phone || customerInfo?.phone || '').trim();

  const newOrder = db.createOrder({
    userId,
    userEmail,
    userName,
    products: verifiedProducts,
    shippingAddress: {
      fullName: shippingAddress.fullName.trim(),
      phone,
      district,
      deliveryLocation,
      street: deliveryLocation,
      city: district,
      state: 'Rwanda',
      zip: '0000',
      country: 'Rwanda'
    },
    shippingMethod: shippingMethod || 'Public transport courier (buyer risk)',
    paymentMethod: paymentMethod || 'MTN Mobile Money',
    subtotal,
    shippingCost,
    discount,
    total,
    status: 'Confirmed'
  });

  res.status(201).json(newOrder);
});

// Get user orders
router.get('/my-orders', authenticateUser, (req: AuthRequest, res: Response) => {
  const orders = db.getUserOrders(req.user!._id);
  res.json(orders);
});

// Get single order by ID or orderNumber
router.get('/:id', optionalUser, (req: AuthRequest, res: Response) => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Security check: if user is logged in, ensure they own it or are admin
  if (req.user && req.user.role !== 'admin' && order.userId !== req.user._id) {
    return res.status(403).json({ error: 'Unauthorized to view this order.' });
  }

  res.json(order);
});

export default router;
