import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateUser, AuthRequest } from '../auth.js';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (name.trim().toLowerCase() === 'admin') {
    return res.status(400).json({ error: 'The name admin is reserved for the administrator.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    phone: phone?.trim(),
    role: 'customer',
    wishlist: []
  });

  const token = generateToken(newUser);
  res.status(201).json({
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address,
      wishlist: newUser.wishlist
    },
    token
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const loginIdentifier = String(email).trim().toLowerCase();
  const user = loginIdentifier === 'admin'
    ? db.getUsers().find(candidate => candidate.role === 'admin')
    : db.findUserByEmail(loginIdentifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials. Password is incorrect.' });
  }

  const token = generateToken(user);
  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      wishlist: user.wishlist || []
    },
    token
  });
});

// Current User
router.get('/me', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({
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
});

// Update Profile
router.put('/profile', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const { name, phone, address } = req.body;
  const updated = db.updateUser(req.user._id, {
    ...(name ? { name: name.trim() } : {}),
    ...(phone !== undefined ? { phone: phone.trim() } : {}),
    ...(address ? { address } : {})
  });

  if (!updated) return res.status(404).json({ error: 'User not found.' });

  res.json({
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
});

export default router;
