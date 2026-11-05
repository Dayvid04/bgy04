import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateUser, AuthRequest, setAuthCookie, clearAuthCookie } from '../auth.js';
import { asyncHandler } from '../http.js';

const router = Router();
const STATIC_ADMIN_EMAIL = 'admin';
const STATIC_ADMIN_PASSWORD = '15477';

async function ensureStaticAdmin() {
  return db.reconcileStaticAdminAccount();
}

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name.trim() || !email.trim() || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === STATIC_ADMIN_EMAIL) {
    return res.status(409).json({ error: 'This account is reserved for the static admin login.' });
  }
  if (normalizedName.length < 2 || normalizedName.length > 80 || /[\u0000-\u001f<>]/.test(normalizedName)) {
    return res.status(400).json({ error: 'Name must be 2 to 80 characters and contain no control or markup characters.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 255) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 12 and 128 characters.' });
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    const digitsOnly = String(phone).replace(/\D/g, '');
    if (!/^\d+$/.test(String(phone).trim()) || digitsOnly.length > 10) {
      return res.status(400).json({ error: 'Phone number must contain only digits and cannot exceed 10 numbers.' });
    }
  }

  const existing = await db.findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await db.createUser({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    phone: phone ? String(phone).trim() : undefined,
    role: 'customer',
    active: true,
    wishlist: [],
    address: undefined,
  });

  const token = generateToken(newUser);
  setAuthCookie(res, token);
  return res.status(201).json({
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address,
      wishlist: newUser.wishlist
    }
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const loginIdentifier = String(email).trim().toLowerCase();

  if (loginIdentifier === STATIC_ADMIN_EMAIL && password === STATIC_ADMIN_PASSWORD) {
    const adminUser = await ensureStaticAdmin();
    const token = generateToken(adminUser);
    setAuthCookie(res, token);
    return res.json({
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
        address: adminUser.address,
        wishlist: adminUser.wishlist || []
      }
    });
  }

  const user = await db.findUserByEmail(loginIdentifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }

  if (!user.active) {
    return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);
  return res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      wishlist: user.wishlist || []
    }
  });
}));

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Signed out.' });
});

// Current User
router.get('/me', asyncHandler(authenticateUser), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      address: req.user.address,
      wishlist: req.user.wishlist || []
    }
  });
}));

// Update Profile
router.put('/profile', asyncHandler(authenticateUser), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const { name, phone, address } = req.body;
  const updated = await db.updateUser(req.user._id, {
    ...(name ? { name: name.trim() } : {}),
    ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
    ...(address ? { address } : {})
  });

  if (!updated) return res.status(404).json({ error: 'User not found.' });

  return res.json({
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      address: updated.address,
      wishlist: updated.wishlist || []
    }
  });
}));

export default router;
