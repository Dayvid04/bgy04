# BGY Footwear

BGY is a modern footwear storefront and ecommerce app for premium sneakers and lifestyle products.

## Features

- Premium sneaker storefront
- Product catalog and quick-view browsing
- Shopping cart and wishlist flows
- Checkout and order management
- Admin product and order tools
- Contact form and customer support routes

## Project structure

- `src/`: React frontend, pages, components, contexts, and browser API client
- `backend/`: Express backend entrypoint, authentication, database service, and API routes
- `public/`: Static files copied directly into the frontend build
- `database/`: MySQL schema and seed data
- `data/`: Legacy JSON data retained for reference; the active backend uses MySQL through `backend/db.ts`
- `dist/`: Generated production build; do not edit manually

The backend starts at `backend/index.ts`. Its API route files are in `backend/routes/`, while database and authentication logic are in `backend/db.ts` and `backend/auth.ts`.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your environment values.
3. Start the app:
   ```bash
   npm run dev
   ```

## Production build

```bash
npm run build
npm start
```

## Deployment

The recommended production setup uses Render for the Express API and Vercel for the Vite frontend.

### 1. Create the MySQL database

Create a hosted MySQL database, then import `database/bgy_mysql.sql`. Keep its host, port, database name, username, and password available for Render.

The active persistence layer is MySQL. The legacy `data/bgy_database.json` file is not used by the current backend, so it is preserved without introducing a second database implementation. Render's local filesystem is ephemeral; use hosted MySQL for persistent production data.

### 2. Deploy the API to Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository. Render will read `render.yaml`.
3. Set the prompted values:
   - `FRONTEND_URL`: the final Vercel URL, for example `https://bgy.vercel.app`
   - `DB_HOST`, `DB_USER`, and `DB_PASSWORD`: values from the MySQL provider
4. Deploy and verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

The Render service uses:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

### 3. Deploy the frontend to Vercel

1. In Vercel, choose **Add New > Project** and import the same GitHub repository.
2. Keep the framework preset as **Vite**.
3. Add this environment variable for **Production**:
   - `VITE_API_URL`: `https://YOUR-RENDER-SERVICE.onrender.com`
4. Deploy the project.
5. Copy the Vercel production URL into Render's `FRONTEND_URL`, then redeploy the Render service.

`vercel.json` keeps client-side routes working when a page is refreshed.

## Environment variables

```bash
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key
VITE_API_URL=https://your-render-service.onrender.com
FRONTEND_URL=https://your-domain.com
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=bgy
DB_CONNECTION_LIMIT=10
ADMIN_EMAIL=
ADMIN_PASSWORD=
DEMO_CUSTOMER_EMAIL=
DEMO_CUSTOMER_PASSWORD=
```
