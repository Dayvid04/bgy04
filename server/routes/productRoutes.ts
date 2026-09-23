import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateUser, AuthRequest } from '../auth.js';

const router = Router();

// GET all products with filtering, searching, sorting
router.get('/', (req, res) => {
  let products = db.getProducts();

  const {
    search,
    category,
    gender,
    size,
    color,
    minPrice,
    maxPrice,
    featured,
    newArrival,
    onSale,
    sort
  } = req.query;

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Gender filter
  if (gender && typeof gender === 'string') {
    products = products.filter(p => p.gender === gender);
  }

  // Size filter
  if (size) {
    const numSize = Number(size);
    if (!isNaN(numSize)) {
      products = products.filter(p => p.sizes.includes(numSize));
    }
  }

  // Color filter
  if (color && typeof color === 'string') {
    const c = color.toLowerCase();
    products = products.filter(p => p.colors.some(col => col.name.toLowerCase().includes(c)));
  }

  // Price range
  if (minPrice) {
    const min = Number(minPrice);
    if (!isNaN(min)) {
      products = products.filter(p => (p.discountPrice || p.price) >= min);
    }
  }
  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max)) {
      products = products.filter(p => (p.discountPrice || p.price) <= max);
    }
  }

  // Flags
  if (featured === 'true') {
    products = products.filter(p => p.featured);
  }
  if (newArrival === 'true') {
    products = products.filter(p => p.newArrival);
  }
  if (onSale === 'true') {
    products = products.filter(p => !!p.discountPrice && p.discountPrice < p.price);
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({
    total: products.length,
    products
  });
});

// GET single product by ID
router.get('/:id', (req, res) => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// POST review to product
router.post('/:id/reviews', authenticateUser, (req: AuthRequest, res: Response) => {
  const { rating, title, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and review comment are required.' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  const user = req.user!;
  const updatedProduct = db.addReview(req.params.id, {
    userId: user._id,
    userName: user.name,
    rating: numRating,
    title: title ? title.trim() : 'Verified Review',
    comment: comment.trim()
  });

  if (!updatedProduct) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.status(201).json(updatedProduct);
});

export default router;
