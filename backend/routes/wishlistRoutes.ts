import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateUser, AuthRequest } from '../auth.js';
import { asyncHandler } from '../http.js';

const router = Router();

// GET wishlist products
router.get('/', asyncHandler(authenticateUser), asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const wishlistIds = user.wishlist || [];
  const products = await Promise.all(
    wishlistIds.map(async (id) => await db.findProductById(id))
  );

  return res.json({
    ids: wishlistIds,
    products: products.filter(Boolean)
  });
}));

// Toggle wishlist item
router.post('/toggle', asyncHandler(authenticateUser), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  const user = req.user!;
  const updatedIds = await db.toggleWishlist(user._id, productId);

  return res.json({
    ids: updatedIds,
    isSaved: updatedIds.includes(productId)
  });
}));

export default router;
