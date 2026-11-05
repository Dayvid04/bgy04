import { Router } from 'express';
import { db } from '../db.js';
import { asyncHandler } from '../http.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const content = await db.getSiteContent();
  const now = Date.now();
  const startsAt = typeof content.promotionStartsAt === 'string' ? Date.parse(content.promotionStartsAt) : NaN;
  const endsAt = typeof content.promotionEndsAt === 'string' ? Date.parse(content.promotionEndsAt) : NaN;
  const withinSchedule = (!Number.isFinite(startsAt) || now >= startsAt) && (!Number.isFinite(endsAt) || now <= endsAt);
  return res.json({ ...content, promotionActive: content.promotionActive === true && withinSchedule });
}));

export default router;
