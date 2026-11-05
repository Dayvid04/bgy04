import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

const appDir = (() => {
  try {
    if (typeof __dirname !== 'undefined') return __dirname;
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // fallback
  }
  return process.cwd();
})();

function validateProductionConfig() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET must be configured in production.');
  }
}

async function startServer() {
  validateProductionConfig();
  const port = Number(process.env.PORT) || 5000;
  await db.ensureSchema();
  const app = express();

  // Middlewares
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  if (frontendUrl) {
    app.use((req, res, next) => {
      const requestOrigin = req.headers.origin;
      if (requestOrigin === frontendUrl) {
        res.header('Access-Control-Allow-Origin', frontendUrl);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    });
  }
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/content', contentRoutes);

  // Catch unhandled API requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled request error:', error instanceof Error ? error.message : 'Unknown error');
    if (res.headersSent) {
      next(error);
      return;
    }
    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: 'Internal server error.' });
      return;
    }
    next(error);
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`BGY Footwear Server running on http://0.0.0.0:${port}`);
  });

  server.on('error', (error) => {
    throw error;
  });
}

startServer().catch((error) => {
  console.error('BGY server could not start. Check the configured environment and database connection.');
  console.error(error instanceof Error ? error.message : 'Unknown startup error');
  process.exitCode = 1;
});
