import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateUser, AuthRequest } from '../auth.js';

const router = Router();

// GET wishlist products
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const wishlistIds = user.wishlist || [];
  const products = wishlistIds
    .map(id => db.findProductById(id))
    .filter(p => p !== undefined);

  res.json({
    ids: wishlistIds,
    products
  });
});

// Toggle wishlist item
router.post('/toggle', authenticateUser, (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  const user = req.user!;
  const updatedIds = db.toggleWishlist(user._id, productId);

  res.json({
    ids: updatedIds,
    isSaved: updatedIds.includes(productId)
  });
});

export default router;
