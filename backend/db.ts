import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'admin';
  active: boolean;
  address?: {
    fullName?: string;
    phone?: string;
    district?: string;
    deliveryLocation?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist: string[];
  createdAt: string;
}

export interface ReviewDocument {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface ProductDocument {
  _id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  deliveryPrice?: number;
  otherProvinceDeliveryPrice?: number;
  discountPrice?: number;
  images: string[];
  category: string;
  gender: 'men' | 'women' | 'unisex';
  sizes: number[];
  colors: { name: string; hex: string }[];
  stock: number;
  rating: number;
  numReviews: number;
  reviews: ReviewDocument[];
  featured: boolean;
  newArrival: boolean;
  specs: {
    upperMaterial: string;
    midsole: string;
    outsole: string;
    weight: string;
    drop: string;
  };
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: number;
  color: string;
  quantity: number;
}

export interface OrderDocument {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone?: string;
    district?: string;
    deliveryLocation?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Pending' | 'Paid' | 'Refunded';
  createdAt: string;
}

export interface SiteContent {
  [key: string]: string | boolean | number;
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: '',
  heroEyebrow: 'RWANDA FOOTWEAR COLLECTION',
  heroTitle: 'STEP INTO BGY',
  heroDescription: 'Premium footwear for men and women — modern movement, daily wear, and confident style.',
  heroImage: '/nike.jpeg',
  heroImageAlt: 'Nike sneaker product image',
  primaryButtonText: 'Shop Now',
  secondaryButtonText: 'Explore Collection',
  menEyebrow: "Men's Collection",
  menTitle: 'All Sneakers',
  menDescription: "Explore every men’s sneaker selected by BGY for everyday confidence.",
  menButtonText: "Shop Men's",
  womenEyebrow: "Women's Collection",
  womenTitle: 'All Collection',
  womenDescription: "Explore every women’s sneaker selected for comfort, style, and daily movement.",
  womenButtonText: "Shop Women's",
  closingEyebrow: 'Movement. Identity. Modern Footwear.',
  closingQuote: 'The best footwear balances performance, comfort, and style.',
  closingDescription: 'BGY curates premium footwear for men and women that feels right, looks polished, and serves real life in Rwanda and beyond.',
  closingButtonText: 'Learn About BGY',
  showMenSection: true,
  showWomenSection: true,
  showBenefits: true,
  showClosing: true,
  footerDescription: 'Premium footwear for men and women, selected for everyday movement.',
  contactEmail: 'hello@bgy.rw',
  contactPhone: '+250 795 139 456',
  instagramUrl: 'https://www.instagram.com/bgy_kicks/',
  navShop: 'Sneakers',
  navNewIn: 'New In',
  navAbout: 'About',
  navContact: 'Contact',
  promotionTitle: '',
  promotionMessage: '',
  promotionDiscountPercent: 0,
  promotionStartsAt: '',
  promotionEndsAt: '',
  promotionActive: false,
  aboutBadge: 'ABOUT BGY',
  aboutHeroTitle: 'A trusted footwear retailer for',
  aboutHeroHighlight: 'modern Rwanda',
  aboutHeroText: 'BGY is a Rwanda-based retail business focused on premium footwear for everyday movement, work, travel, and city life.',
  aboutSelectionBadge: 'HOW WE SELECT',
  aboutSelectionTitle: 'Curated for comfort, style, and performance',
  aboutSelectionText: 'We look beyond trends to offer footwear that balances quality, versatility, and value for customers in Rwanda and beyond.',
  aboutComfortTitle: 'Everyday Comfort',
  aboutComfortText: 'We prioritize pairs that feel good from the first wear, with supportive fit, durable materials, and practical design.',
  aboutDesignTitle: 'Smart Design',
  aboutDesignText: 'Our collections are selected for clean silhouettes, dependable construction, and strong visual appeal.',
  aboutValueTitle: 'Trusted Value',
  aboutValueText: 'We focus on accessible premium footwear that delivers quality, confidence, and long-term wear.',
  aboutApproachBadge: 'OUR APPROACH',
  aboutApproachTitle: 'Why customers choose BGY',
  aboutApproachText1: 'BGY is built as a professional retail business focused on premium, contemporary footwear.',
  aboutApproachText2: 'That means thoughtful selection, clear product information, responsive service, and a dependable shopping experience in Rwanda.',
  aboutCuratedQuality: 'Curated Quality',
  aboutRetailExcellence: 'Retail Excellence',
  aboutCtaTitle: 'Discover the BGY collection',
  aboutCtaButton: 'Shop Footwear',
  aboutImage: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop',
  aboutImageAlt: 'BGY footwear retail showroom',
  contactBadge: 'CLIENT SERVICES & SUPPORT',
  contactHeading: 'Connect with BGY',
  contactResponseTime: 'Average concierge response time:',
  contactResponseTimeValue: 'Under 2 hours',
  contactResponseTimeSuffix: 'during store support hours.',
  contactStoreHours: 'Store Hours',
  contactStoreHoursValue: 'Mon - Sat: 08:00 - 19:00 CAT',
  contactDeliveryLabel: 'Rwanda Delivery',
  contactDeliveryValue: 'Rubavu & Kigali: Wed & Sat',
  contactConciergeLabel: 'Direct Concierge',
  contactConciergeValue: '24/7 client specialist support',
  contactInquiryTitle: 'Send a Customer Inquiry',
  contactInquirySubtitle: 'For order support, sizing questions, or general retail inquiries.',
  contactSuccessMsg: 'Message transmitted to the BGY Client Concierge. We will reply shortly.',
  contactFullNameLabel: 'Full Name',
  contactFullNamePlaceholder: 'Enter your names..',
  contactEmailLabel: 'Email Address',
  contactEmailPlaceholder: 'bgy@gmail.com',
  contactSubjectLabel: 'Subject',
  contactSubjectPlaceholder: 'Inquiry on...',
  contactMessageLabel: 'Message',
  contactMessagePlaceholder: 'Details on your enquiry...',
  contactSubmitButton: 'Dispatch Message',
  contactSendingLabel: 'Sending...',
  contactChannelsTitle: 'Direct Channels',
  contactStorePointsTitle: 'Store & Service Points',
  contactStoreName: 'BGY Gisenyi Store',
  contactLocation: 'Rubavu, Rwanda',
  contactFaqBadge: 'Frequently Clarified',
  contactFaqTitle: 'Client Questions & Answers',
  contactFaq1Question: 'How does BGY footwear sizing compare to other brands?',
  contactFaq1Answer: 'BGY silhouettes use standard European sizing. Choose your usual Eur size from 35 to 45.',
  contactFaq2Question: 'When are deliveries made?',
  contactFaq2Answer: 'Rubavu and Kigali deliveries are made every Wednesday and Saturday for a small transport fee.',
  contactFaq3Question: 'What is the BGY 30-day trial return policy?',
  contactFaq3Answer: 'You have 30 days from receipt to try your BGY footwear indoors on clean surfaces.',
  contactFaq4Question: 'Are BGY shoes produced in limited batches?',
  contactFaq4Answer: 'Yes. Each silhouette is released in limited runs. Members receive priority access to the next allocation.',
};

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bgy',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
});

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function jsonValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `BGY-${rand}`;
}

function mapUserRow(row: any): UserDocument {
  return {
    _id: row.user_id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || undefined,
    role: row.role === 'admin' ? 'admin' : 'customer',
    active: row.is_active !== 0,
    address: parseJson(row.address, undefined),
    wishlist: Array.isArray(parseJson(row.wishlist, [])) ? parseJson(row.wishlist, []) : [],
    createdAt: row.created_at,
  };
}

function mapProductRow(row: any): ProductDocument {
  const images = Array.isArray(parseJson(row.images, [])) ? parseJson(row.images, []) : [];
  const sizes = Array.isArray(parseJson(row.sizes, [])) ? parseJson(row.sizes, []) : [];
  const colors = Array.isArray(parseJson(row.colors, [])) ? parseJson(row.colors, []) : [];
  const reviews = Array.isArray(parseJson(row.reviews, [])) ? parseJson(row.reviews, []) : [];
  const specs = parseJson(row.specs, {
    upperMaterial: '',
    midsole: '',
    outsole: '',
    weight: '',
    drop: ''
  });

  return {
    _id: row.product_id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: Number(row.price || 0),
    deliveryPrice: row.delivery_price !== null ? Number(row.delivery_price) : undefined,
    otherProvinceDeliveryPrice: row.other_province_delivery_price !== null ? Number(row.other_province_delivery_price) : undefined,
    discountPrice: row.discount_price !== null ? Number(row.discount_price) : undefined,
    images,
    category: row.category || 'Sneakers',
    gender: row.gender || 'unisex',
    sizes,
    colors,
    stock: Number(row.stock || 0),
    rating: Number(row.rating || 0),
    numReviews: Number(row.num_reviews || 0),
    reviews,
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    specs,
    createdAt: row.created_at,
  };
}

function mapOrderRow(row: any): OrderDocument {
  return {
    _id: row.order_id,
    orderNumber: row.order_number,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    products: Array.isArray(parseJson(row.products, [])) ? parseJson(row.products, []) : [],
    shippingAddress: parseJson(row.shipping_address, {
      fullName: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    }),
    shippingMethod: row.shipping_method || '',
    paymentMethod: row.payment_method || '',
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    status: row.status || 'Pending',
    paymentStatus: row.payment_status || 'Unpaid',
    createdAt: row.created_at,
  };
}

function mapContactRow(row: any): ContactMessage {
  return {
    _id: row.message_id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    message: row.message,
    createdAt: row.created_at,
  };
}

class DatabaseService {
  async ensureSchema() {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
    });

    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'bgy'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
      await connection.query(`USE \`${process.env.DB_NAME || 'bgy'}\``);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(20) DEFAULT NULL,
          role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          address JSON DEFAULT NULL,
          wishlist JSON DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          tagline VARCHAR(255) DEFAULT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          delivery_price DECIMAL(10,2) DEFAULT 0.00,
          other_province_delivery_price DECIMAL(10,2) DEFAULT 0.00,
          discount_price DECIMAL(10,2) DEFAULT NULL,
          images JSON DEFAULT NULL,
          category VARCHAR(100) DEFAULT 'Sneakers',
          gender ENUM('men','women','unisex') NOT NULL DEFAULT 'unisex',
          sizes JSON DEFAULT NULL,
          colors JSON DEFAULT NULL,
          stock INT NOT NULL DEFAULT 0,
          rating DECIMAL(3,1) DEFAULT 0.0,
          num_reviews INT DEFAULT 0,
          reviews JSON DEFAULT NULL,
          featured TINYINT(1) DEFAULT 0,
          new_arrival TINYINT(1) DEFAULT 0,
          specs JSON DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(100) NOT NULL UNIQUE,
          order_number VARCHAR(50) NOT NULL UNIQUE,
          user_id VARCHAR(100) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          products JSON NOT NULL,
          shipping_address JSON NOT NULL,
          shipping_method VARCHAR(255) DEFAULT NULL,
          payment_method VARCHAR(255) DEFAULT NULL,
          subtotal DECIMAL(10,2) DEFAULT 0.00,
          shipping_cost DECIMAL(10,2) DEFAULT 0.00,
          discount DECIMAL(10,2) DEFAULT 0.00,
          total DECIMAL(10,2) DEFAULT 0.00,
          status VARCHAR(50) NOT NULL DEFAULT 'Pending',
          payment_status VARCHAR(30) NOT NULL DEFAULT 'Unpaid',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message_id VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) DEFAULT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS site_content (
          singleton_id TINYINT PRIMARY KEY,
          content JSON NOT NULL,
          updated_by VARCHAR(100) DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          admin_user_id VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          entity VARCHAR(100) NOT NULL,
          details JSON DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_admin_audit_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      const [userColumns]: any[] = await connection.query(`SHOW COLUMNS FROM users LIKE 'is_active'`);
      if (userColumns.length === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`);
      }
      const [orderColumns]: any[] = await connection.query(`SHOW COLUMNS FROM orders LIKE 'payment_status'`);
      if (orderColumns.length === 0) {
        await connection.query(`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'Unpaid'`);
      }

      // Keep the administrator available even when customer accounts already exist.
      const adminEmail = 'admin';
      const adminPassword = '15477';
      const salt = bcrypt.genSaltSync(10);
      const adminHash = bcrypt.hashSync(adminPassword, salt);
      const [adminRows]: any[] = await connection.execute(
        `SELECT user_id FROM users WHERE role = 'admin' ORDER BY created_at DESC LIMIT 1`
      );
      if (adminRows.length === 0) {
        await connection.execute(
          `INSERT INTO users (user_id, name, email, password_hash, phone, role, address, wishlist, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'usr_admin_1',
            'BGY Director',
            adminEmail,
            adminHash,
            '+250788123456',
            'admin',
            JSON.stringify({ street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' }),
            JSON.stringify(['prod_bgy_aero_1']),
            1
          ]
        );
      } else {
        await connection.execute(
          `UPDATE users SET name = ?, email = ?, password_hash = ?, phone = ?, role = 'admin', address = ?, wishlist = ?, is_active = 1 WHERE user_id = ?`,
          [
            'BGY Director',
            adminEmail,
            adminHash,
            '+250788123456',
            JSON.stringify({ street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' }),
            JSON.stringify(['prod_bgy_aero_1']),
            adminRows[0].user_id
          ]
        );
      }

      const demoEmail = process.env.DEMO_CUSTOMER_EMAIL?.trim().toLowerCase();
      const demoPassword = process.env.DEMO_CUSTOMER_PASSWORD;
      if (demoEmail && demoPassword) {
        const [demoRows]: any[] = await connection.execute(`SELECT COUNT(*) AS count FROM users WHERE email = ?`, [demoEmail]);
        if (Number(demoRows[0].count) === 0) {
          const salt = bcrypt.genSaltSync(10);
          const demoHash = bcrypt.hashSync(demoPassword, salt);
          await connection.execute(
            `INSERT INTO users (user_id, name, email, password_hash, phone, role, address, wishlist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'usr_demo_customer',
              'BGY Demo Customer',
              demoEmail,
              demoHash,
              null,
              'customer',
              null,
              JSON.stringify([])
            ]
          );
        }
      }

      const [productRows]: any[] = await connection.execute(`SELECT COUNT(*) AS count FROM products`);
      // Render's local filesystem is ephemeral; use a persistent production database for durable data.
      if (Number(productRows[0].count) === 0) {
        await connection.execute(
          `INSERT INTO products (product_id, name, tagline, description, price, delivery_price, other_province_delivery_price, discount_price, images, category, gender, sizes, colors, stock, rating, num_reviews, reviews, featured, new_arrival, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
          [
            'prod_bgy_aero_1', 'BGY Aero-1 Proto', 'A bold everyday sneaker selected for comfort and confident movement', 'The Aero-1 Proto brings a clean athletic profile, breathable materials, and responsive cushioning together for everyday movement.', 240.00, 3000.00, 5000.00, 210.00, JSON.stringify(['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop']), 'Sneakers', 'men', JSON.stringify([35,36,37,38,39,40,41,42,43,44,45]), JSON.stringify([{ name: 'Onyx / Crimson', hex: '#111111' }, { name: 'Pure White', hex: '#F9FAFB' }]), 24, 4.9, 38, JSON.stringify([]), 1, 1, JSON.stringify({ upperMaterial: 'Engineered Technical Ripstop & Full-Grain Trim', midsole: 'Nitrogen-Infused Hyper-Foam', outsole: 'High-Abrasion Carbon Grip Compound', weight: '285g (Men 9US)', drop: '8mm' }),
            'prod_bgy_phantom_low', 'BGY Phantom Low', 'Architectural monochrome luxury for everyday motion', 'Stripped of all noise. The Phantom Low is molded from premium buttery calfskin leather with a concealed lacing tunnel and bespoke BGY sculptured cupsole.', 215.00, 3000.00, 5000.00, null, JSON.stringify(['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop']), 'Sneakers', 'women', JSON.stringify([35,36,37,38,39,40,41,42,43,44,45]), JSON.stringify([{ name: 'Matte Obsidian', hex: '#0B0B0B' }, { name: 'Chalk White', hex: '#FFFFFF' }]), 18, 4.8, 24, JSON.stringify([]), 1, 0, JSON.stringify({ upperMaterial: 'Italian Tanned Calfskin & Supple Lining', midsole: 'Ergonomic Memory Foam Core', outsole: 'Vulcanized Low-Profile Rubber', weight: '340g', drop: '6mm' })
          ]
        );
      }
    } finally {
      await connection.end();
    }
  }

  async getUsers(): Promise<UserDocument[]> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM users ORDER BY created_at DESC`);
    return rows.map(mapUserRow);
  }

  async findUserById(id: string): Promise<UserDocument | undefined> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM users WHERE user_id = ? LIMIT 1`, [id]);
    return rows[0] ? mapUserRow(rows[0]) : undefined;
  }

  async reconcileStaticAdminAccount(): Promise<UserDocument> {
    const adminEmail = 'admin';
    const adminPassword = '15477';
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    const [rows]: any[] = await pool.execute(`SELECT * FROM users WHERE role = 'admin' ORDER BY created_at DESC LIMIT 1`);

    if (rows.length === 0) {
      const generatedId = 'usr_admin_1';
      await pool.execute(
        `INSERT INTO users (user_id, name, email, password_hash, phone, role, address, wishlist, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedId,
          'BGY Director',
          adminEmail,
          adminHash,
          '+250788123456',
          'admin',
          JSON.stringify({ street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' }),
          JSON.stringify(['prod_bgy_aero_1']),
          1
        ]
      );
      return {
        _id: generatedId,
        name: 'BGY Director',
        email: adminEmail,
        passwordHash: adminHash,
        phone: '+250788123456',
        role: 'admin',
        active: true,
        address: { street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' },
        wishlist: ['prod_bgy_aero_1'],
        createdAt: new Date().toISOString(),
      };
    }

    const targetUser = rows[0];
    await pool.execute(
      `UPDATE users SET name = ?, email = ?, password_hash = ?, phone = ?, role = 'admin', address = ?, wishlist = ?, is_active = 1 WHERE user_id = ?`,
      [
        'BGY Director',
        adminEmail,
        adminHash,
        '+250788123456',
        JSON.stringify({ street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' }),
        JSON.stringify(['prod_bgy_aero_1']),
        targetUser.user_id,
      ]
    );

    return {
      _id: targetUser.user_id,
      name: 'BGY Director',
      email: adminEmail,
      passwordHash: adminHash,
      phone: '+250788123456',
      role: 'admin',
      active: true,
      address: { street: 'KN 7 Rd, Kicukiro', city: 'Kigali', state: 'Kigali City', zip: '00100', country: 'Rwanda' },
      wishlist: ['prod_bgy_aero_1'],
      createdAt: targetUser.created_at,
    };
  }

  async findUserByEmail(email: string): Promise<UserDocument | undefined> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`, [email]);
    return rows[0] ? mapUserRow(rows[0]) : undefined;
  }

  async createUser(userData: Omit<UserDocument, '_id' | 'createdAt'>): Promise<UserDocument> {
    const userId = 'usr_' + generateId();
    await pool.execute(
      `INSERT INTO users (user_id, name, email, password_hash, phone, role, address, wishlist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userData.name,
        userData.email,
        userData.passwordHash,
        userData.phone || null,
        userData.role,
        jsonValue(userData.address),
        jsonValue(userData.wishlist || [])
      ]
    );
    return { ...userData, _id: userId, createdAt: new Date().toISOString() };
  }

  async updateUser(id: string, updates: Partial<UserDocument>): Promise<UserDocument | null> {
    const existing = await this.findUserById(id);
    if (!existing) return null;

    const next = { ...existing, ...updates };
    await pool.execute(
      `UPDATE users SET name = ?, phone = ?, role = ?, address = ?, wishlist = ?, is_active = ? WHERE user_id = ?`,
      [next.name, next.phone || null, next.role, jsonValue(next.address), jsonValue(next.wishlist || []), next.active ? 1 : 0, id]
    );
    return next;
  }

  async getProducts(): Promise<ProductDocument[]> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM products ORDER BY created_at DESC`);
    return rows.map(mapProductRow);
  }

  async findProductById(id: string): Promise<ProductDocument | undefined> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM products WHERE product_id = ? LIMIT 1`, [id]);
    return rows[0] ? mapProductRow(rows[0]) : undefined;
  }

  async createProduct(productData: Omit<ProductDocument, '_id' | 'createdAt' | 'reviews' | 'rating' | 'numReviews'>): Promise<ProductDocument> {
    const productId = 'prod_bgy_' + generateId();
    await pool.execute(
      `INSERT INTO products (product_id, name, tagline, description, price, delivery_price, other_province_delivery_price, discount_price, images, category, gender, sizes, colors, stock, rating, num_reviews, reviews, featured, new_arrival, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        productData.name,
        productData.tagline,
        productData.description,
        Number(productData.price),
        productData.deliveryPrice ?? 3000,
        productData.otherProvinceDeliveryPrice ?? 5000,
        productData.discountPrice ?? null,
        jsonValue(productData.images),
        productData.category,
        productData.gender,
        jsonValue(productData.sizes),
        jsonValue(productData.colors),
        productData.stock,
        5.0,
        0,
        JSON.stringify([]),
        productData.featured ? 1 : 0,
        productData.newArrival ? 1 : 0,
        jsonValue(productData.specs)
      ]
    );
    return { ...productData, _id: productId, reviews: [], rating: 5, numReviews: 0, createdAt: new Date().toISOString() };
  }

  async updateProduct(id: string, updates: Partial<ProductDocument>): Promise<ProductDocument | null> {
    const existing = await this.findProductById(id);
    if (!existing) return null;
    const next = { ...existing, ...updates };
    await pool.execute(
      `UPDATE products SET name = ?, tagline = ?, description = ?, price = ?, delivery_price = ?, other_province_delivery_price = ?, discount_price = ?, images = ?, category = ?, gender = ?, sizes = ?, colors = ?, stock = ?, rating = ?, num_reviews = ?, reviews = ?, featured = ?, new_arrival = ?, specs = ? WHERE product_id = ?`,
      [
        next.name,
        next.tagline,
        next.description,
        Number(next.price),
        next.deliveryPrice ?? 3000,
        next.otherProvinceDeliveryPrice ?? 5000,
        next.discountPrice ?? null,
        jsonValue(next.images),
        next.category,
        next.gender,
        jsonValue(next.sizes),
        jsonValue(next.colors),
        next.stock,
        next.rating,
        next.numReviews,
        jsonValue(next.reviews),
        next.featured ? 1 : 0,
        next.newArrival ? 1 : 0,
        jsonValue(next.specs),
        id,
      ]
    );
    return next;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const [result]: any[] = await pool.execute(`DELETE FROM products WHERE product_id = ?`, [id]);
    return Number((result as any).affectedRows) > 0;
  }

  async addReview(productId: string, review: { userId: string; userName: string; rating: number; title: string; comment: string }): Promise<ProductDocument | null> {
    const product = await this.findProductById(productId);
    if (!product) return null;
    const newReview: ReviewDocument = {
      _id: 'rev_' + generateId(),
      ...review,
      createdAt: new Date().toISOString(),
    };
    const reviews = [newReview, ...product.reviews];
    const nextRating = Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1));
    await pool.execute(
      `UPDATE products SET reviews = ?, num_reviews = ?, rating = ? WHERE product_id = ?`,
      [jsonValue(reviews), reviews.length, nextRating, productId]
    );
    return { ...product, reviews, numReviews: reviews.length, rating: nextRating };
  }

  async getOrders(): Promise<OrderDocument[]> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM orders ORDER BY created_at DESC`);
    return rows.map(mapOrderRow);
  }

  async getUserOrders(userId: string): Promise<OrderDocument[]> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    return rows.map(mapOrderRow);
  }

  async findOrderById(id: string): Promise<OrderDocument | undefined> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM orders WHERE order_id = ? OR order_number = ? LIMIT 1`, [id, id]);
    return rows[0] ? mapOrderRow(rows[0]) : undefined;
  }

  async createOrder(orderData: Omit<OrderDocument, '_id' | 'orderNumber' | 'createdAt' | 'paymentStatus'>): Promise<OrderDocument> {
    const orderId = 'ord_' + generateId();
    const orderNumber = generateOrderNumber();
    const createdAt = new Date().toISOString();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO orders (order_id, order_number, user_id, user_email, user_name, products, shipping_address, shipping_method, payment_method, subtotal, shipping_cost, discount, total, status, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          orderNumber,
          orderData.userId,
          orderData.userEmail,
          orderData.userName,
          jsonValue(orderData.products),
          jsonValue(orderData.shippingAddress),
          orderData.shippingMethod,
          orderData.paymentMethod,
          Number(orderData.subtotal),
          Number(orderData.shippingCost),
          Number(orderData.discount),
          Number(orderData.total),
          orderData.status,
          'Unpaid',
        ]
      );

      for (const item of orderData.products) {
        const [result]: any[] = await connection.execute(
          `UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?`,
          [item.quantity, item.productId, item.quantity]
        );
        if (Number(result.affectedRows) !== 1) {
          throw new Error(`Insufficient stock for product ${item.productId}.`);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { ...orderData, paymentStatus: 'Unpaid', _id: orderId, orderNumber, createdAt };
  }

  async updateOrderStatus(orderId: string, status: OrderDocument['status']): Promise<OrderDocument | null> {
    const existing = await this.findOrderById(orderId);
    if (!existing) return null;
    await pool.execute(`UPDATE orders SET status = ? WHERE order_id = ?`, [status, orderId]);
    return { ...existing, status };
  }

  async toggleWishlist(userId: string, productId: string): Promise<string[]> {
    const user = await this.findUserById(userId);
    if (!user) return [];
    const current = user.wishlist || [];
    const next = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    await pool.execute(`UPDATE users SET wishlist = ? WHERE user_id = ?`, [jsonValue(next), userId]);
    return next;
  }

  async createContactMessage(msg: Omit<ContactMessage, '_id' | 'createdAt'>): Promise<ContactMessage> {
    const messageId = 'msg_' + generateId();
    await pool.execute(
      `INSERT INTO contact_messages (message_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)`,
      [messageId, msg.name, msg.email, msg.phone || null, msg.message]
    );
    return { ...msg, _id: messageId, createdAt: new Date().toISOString() };
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const [rows]: any[] = await pool.execute(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
    return rows.map(mapContactRow);
  }

  async getSiteContent(): Promise<SiteContent> {
    const [rows]: any[] = await pool.execute(`SELECT content FROM site_content WHERE singleton_id = 1 LIMIT 1`);
    return rows[0] ? { ...DEFAULT_SITE_CONTENT, ...parseJson<SiteContent>(rows[0].content, {}) } : { ...DEFAULT_SITE_CONTENT };
  }

  async saveSiteContent(content: SiteContent, adminUserId: string): Promise<SiteContent> {
    await pool.execute(
      `INSERT INTO site_content (singleton_id, content, updated_by) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content), updated_by = VALUES(updated_by)`,
      [jsonValue(content), adminUserId]
    );
    await this.addAuditEntry(adminUserId, 'update', 'site_content', { changedFields: Object.keys(content) });
    return content;
  }

  async addAuditEntry(adminUserId: string, action: string, entity: string, details: unknown): Promise<void> {
    await pool.execute(
      `INSERT INTO admin_audit_log (admin_user_id, action, entity, details) VALUES (?, ?, ?, ?)`,
      [adminUserId, action, entity, jsonValue(details)]
    );
  }

  async getAuditEntries(): Promise<Array<{ id: number; adminUserId: string; adminName: string; action: string; entity: string; details: unknown; createdAt: string }>> {
    const [rows]: any[] = await pool.execute(
      `SELECT a.id, a.admin_user_id, u.name AS admin_name, a.action, a.entity, a.details, a.created_at FROM admin_audit_log a LEFT JOIN users u ON u.user_id = a.admin_user_id ORDER BY a.created_at DESC LIMIT 100`
    );
    return rows.map((row: any) => ({
      id: Number(row.id),
      adminUserId: row.admin_user_id,
      adminName: row.admin_name || 'Former administrator',
      action: row.action,
      entity: row.entity,
      details: parseJson(row.details, null),
      createdAt: row.created_at,
    }));
  }
}

export const db = new DatabaseService();
