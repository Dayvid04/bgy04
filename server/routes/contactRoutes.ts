import { Router, Response, Request } from 'express';
import { db } from '../db.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const savedMessage = db.createContactMessage({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : undefined,
    message: message.trim()
  });

  res.status(201).json({
    message: 'Message received. A BGY client concierge specialist will respond within 24 hours.',
    data: savedMessage
  });
});

export default router;
