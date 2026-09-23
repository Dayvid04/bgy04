import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'admin';
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
  wishlist: string[]; // product IDs
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
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserDocument[];
  products: ProductDocument[];
  orders: OrderDocument[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bgy_database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function generateOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `BGY-${rand}`;
}

const DEFAULT_PRODUCTS: ProductDocument[] = [
  {
    _id: 'prod_bgy_aero_1',
    name: 'BGY Aero-1 Proto',
    tagline: 'A bold everyday sneaker selected for comfort and confident movement',
    description: 'The Aero-1 Proto brings a clean athletic profile, breathable materials, and responsive cushioning together for everyday movement. Selected by BGY for customers who want dependable comfort and distinctive style.',
    price: 240,
    discountPrice: 210,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Sneakers',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Onyx / Crimson', hex: '#111111' },
      { name: 'Pure White', hex: '#F9FAFB' },
      { name: 'Graphite', hex: '#374151' }
    ],
    stock: 24,
    rating: 4.9,
    numReviews: 38,
    reviews: [
      {
        _id: 'rev_1',
        userId: 'usr_cust_alex',
        userName: 'Alex Mercer',
        rating: 5,
        title: 'Insane comfort and striking aesthetic',
        comment: 'The transition between the B-G-Y design ethos shows in every stitch. The shoe is lighter than expected and turns heads everywhere.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        _id: 'rev_2',
        userId: 'usr_cust_2',
        userName: 'Elena Rostova',
        rating: 5,
        title: 'Flawless minimalism',
        comment: 'High build quality, genuine leather accents, and the crimson detail is just subtle enough. True to size.',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ],
    featured: true,
    newArrival: true,
    specs: {
      upperMaterial: 'Engineered Technical Ripstop & Full-Grain Trim',
      midsole: 'Nitrogen-Infused Hyper-Foam',
      outsole: 'High-Abrasion Carbon Grip Compound',
      weight: '285g (Men 9US)',
      drop: '8mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    _id: 'prod_bgy_phantom_low',
    name: 'BGY Phantom Low',
    tagline: 'Architectural monochrome luxury for everyday motion',
    description: 'Stripped of all noise. The Phantom Low is molded from premium buttery calfskin leather with a concealed lacing tunnel and bespoke BGY sculptured cupsole. A masterclass in modern restraint and tactile luxury.',
    price: 215,
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Sneakers',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Matte Obsidian', hex: '#0B0B0B' },
      { name: 'Chalk White', hex: '#FFFFFF' }
    ],
    stock: 18,
    rating: 4.8,
    numReviews: 24,
    reviews: [
      {
        _id: 'rev_3',
        userId: 'usr_cust_3',
        userName: 'Marcus Vance',
        rating: 5,
        title: 'Best daily sneaker I own',
        comment: 'Clean silhouette. Works seamlessly with tailored trousers or casual denim. Highly recommended.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    featured: true,
    newArrival: false,
    specs: {
      upperMaterial: 'Italian Tanned Calfskin & Supple Lining',
      midsole: 'Ergonomic Memory Foam Core',
      outsole: 'Vulcanized Low-Profile Rubber',
      weight: '340g',
      drop: '6mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    _id: 'prod_bgy_gravity_high',
    name: 'BGY Gravity High',
    tagline: 'Futuristic high-top with ankle lockdown stabilization',
    description: 'Drawing inspiration from aerospace materials and urban brutalism. The Gravity High anchors the ankle with a padded geometric collar, reinforced red stitching accents, and an energy-returning rocker outsole.',
    price: 285,
    discountPrice: 255,
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'High-Tops',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Shadow & Red', hex: '#161616' },
      { name: 'Glacier Grey', hex: '#D1D5DB' }
    ],
    stock: 9,
    rating: 4.9,
    numReviews: 41,
    reviews: [
      {
        _id: 'rev_4',
        userId: 'usr_cust_4',
        userName: 'Julian K.',
        rating: 5,
        title: 'Head turner',
        comment: 'The collar support is unmatched. Materials feel worth $500. Solid BGY statement.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    featured: true,
    newArrival: true,
    specs: {
      upperMaterial: 'Ballistic Cordura & Textured Suede Overlays',
      midsole: 'Dual-Chamber Air Cell Cushion',
      outsole: 'Multi-directional Hex Lug Rubber',
      weight: '410g',
      drop: '10mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    _id: 'prod_bgy_velocity_evo',
    name: 'BGY Velocity Evo',
    tagline: 'Pure performance marathon trainer with explosive rebound',
    description: 'Engineered for relentless road mileage. Powered by an internal full-length carbon fiber propulsion plate sandwiched between two layers of BGY Float-Matrix foam. The featherweight monofilament upper conforms like a second skin.',
    price: 260,
    images: [
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Runners',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Jet Black / BGY Red', hex: '#0D0D0D' },
      { name: 'Optic White', hex: '#F3F4F6' }
    ],
    stock: 32,
    rating: 4.9,
    numReviews: 63,
    reviews: [],
    featured: true,
    newArrival: true,
    specs: {
      upperMaterial: 'Translucent Monofilament Vapor Weave',
      midsole: 'Full-Length BGY Carbon Plate + Float-Matrix',
      outsole: 'Micro-Siped Wet Traction Web',
      weight: '210g',
      drop: '8mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    _id: 'prod_bgy_monolith_x',
    name: 'BGY Monolith-X',
    tagline: 'Sculptural exaggerated sole with architectural balance',
    description: 'Challenging classic footwear proportions. The Monolith-X features a bold faceted geometric midsole that absorbs heavy impact while maintaining surprising lightness. Finished with waterproof bonded technical seams and a laser-etched BGY emblem.',
    price: 230,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Sneakers',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Pitch Black', hex: '#080808' },
      { name: 'Industrial Slate', hex: '#4B5563' }
    ],
    stock: 14,
    rating: 4.7,
    numReviews: 19,
    reviews: [],
    featured: false,
    newArrival: true,
    specs: {
      upperMaterial: 'Bonded Neoprene & Matte TPU Armor',
      midsole: 'Segmented EVA Sculpture',
      outsole: 'High-Density Tooth Tread',
      weight: '380g',
      drop: '7mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString()
  },
  {
    _id: 'prod_bgy_apex_carbon',
    name: 'BGY Apex Carbon',
    tagline: 'Featherweight track-inspired racer with laser precision',
    description: 'Designed for sharp city sprints and clean styling. Incorporates real carbon lateral wings that prevent rollover and provide instantaneous directional feedback.',
    price: 275,
    discountPrice: 245,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Runners',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Carbon Black / Crimson Accent', hex: '#1C1917' },
      { name: 'Silver Storm', hex: '#9CA3AF' }
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 29,
    reviews: [],
    featured: true,
    newArrival: false,
    specs: {
      upperMaterial: 'Kevlar Thread Engineered Knit',
      midsole: 'Carbon Stabilizer Chassis + Pebax Foam',
      outsole: 'Feather Rubber Pods',
      weight: '198g',
      drop: '6mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    _id: 'prod_bgy_strata_mid',
    name: 'BGY Strata Mid',
    tagline: 'Modern mid-cut silhouette tailored with precision panels',
    description: 'An understated mid-profile height that protects the ankle while maintaining effortless agility. Clean tonal panels and minimalist branding.',
    price: 225,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'High-Tops',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Monochrome Black', hex: '#111827' },
      { name: 'Off-White Ivory', hex: '#F3F4F6' }
    ],
    stock: 22,
    rating: 4.8,
    numReviews: 15,
    reviews: [],
    featured: false,
    newArrival: false,
    specs: {
      upperMaterial: 'Full-Grain Nappa Leather',
      midsole: 'Cushioned Bio-PU',
      outsole: 'Non-Marking Solid Rubber',
      weight: '360g',
      drop: '5mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString()
  },
  {
    _id: 'prod_bgy_pulse_hybrid',
    name: 'BGY Pulse Hybrid',
    tagline: 'Seamless 3D circular knit slip-on with dynamic tension bands',
    description: 'No laces required. The Pulse Hybrid wraps the foot in variable compression zones that flex as you sprint or walk. Features an integrated red stabilization bridge on the medial arch.',
    price: 195,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Slip-Ons',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Stealth Black', hex: '#0F172A' },
      { name: 'Smoke Grey', hex: '#64748B' }
    ],
    stock: 28,
    rating: 4.6,
    numReviews: 22,
    reviews: [],
    featured: false,
    newArrival: true,
    specs: {
      upperMaterial: '3D Recycled Seamless Circular Knit',
      midsole: 'Adaptive Energy Return Bead Compound',
      outsole: 'Flexible Hex Grid Sole',
      weight: '235g',
      drop: '4mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    _id: 'prod_bgy_vortex_01',
    name: 'BGY Vortex 01',
    tagline: 'Tactical sneaker featuring Fidlock magnetic fast-lock closure',
    description: 'Designed for rapid transitions and hostile urban environments. Built with weather-sealed zippers, reflective 3M BGY coordinates, and high-traction all-weather lugs.',
    price: 290,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Tech-Wear',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Tactical Shadow', hex: '#0A0A0A' }
    ],
    stock: 11,
    rating: 4.9,
    numReviews: 31,
    reviews: [],
    featured: true,
    newArrival: false,
    specs: {
      upperMaterial: 'Water-Repellent DWR Coated Ripstop & GORE-TEX lining',
      midsole: 'Vibram MegaGrip Compound',
      outsole: 'Multi-terrain 5mm Aggressive Lug',
      weight: '395g',
      drop: '9mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString()
  },
  {
    _id: 'prod_bgy_shadow_runner',
    name: 'BGY Shadow Runner',
    tagline: 'Ultralight nocturnal runner with 360-degree reflectivity',
    description: 'Subtle by day, luminous under city lights. Engineered for dawn and dusk runners who demand uncompromising style and top tier road protection.',
    price: 210,
    discountPrice: 185,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Runners',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Reflective Midnight', hex: '#18181B' },
      { name: 'Pure White', hex: '#FFFFFF' }
    ],
    stock: 19,
    rating: 4.7,
    numReviews: 18,
    reviews: [],
    featured: false,
    newArrival: false,
    specs: {
      upperMaterial: 'Engineered Engineered Air Mesh with 3M Threads',
      midsole: 'High-Resilience EVA Foam',
      outsole: 'Blown Rubber Forefoot',
      weight: '240g',
      drop: '10mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString()
  },
  {
    _id: 'prod_bgy_kinetic_prime',
    name: 'BGY Kinetic Prime',
    tagline: 'Asymmetrical speed trainer with targeted lateral support',
    description: 'The Kinetic Prime rethinks how the foot articulates during explosive training. The asymmetrical lacing relieves instep pressure while the high-rebound forefoot plate stores energy.',
    price: 235,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Tech-Wear',
    gender: 'men',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Onyx Red', hex: '#18181B' },
      { name: 'Chalk White', hex: '#F3F4F6' }
    ],
    stock: 16,
    rating: 4.8,
    numReviews: 27,
    reviews: [],
    featured: false,
    newArrival: true,
    specs: {
      upperMaterial: 'Fused TPU & Micro-Perforated Leather',
      midsole: 'Kinetic Rebound TPU Core',
      outsole: 'Directional Siped Gum Rubber',
      weight: '310g',
      drop: '6mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    _id: 'prod_bgy_zero_grav_slide',
    name: 'BGY Zero-Grav Slide',
    tagline: 'Post-workout recovery slide molded in single-piece bio-foam',
    description: 'Sculpted from a single injection of high-density sugarcane foam. Features an orthotic arch cradle and drainage channels for seamless post-run relaxation and poolside leisure.',
    price: 85,
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'Slip-Ons',
    gender: 'women',
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Matte Obsidian', hex: '#111111' },
      { name: 'Bone', hex: '#E5E7EB' }
    ],
    stock: 45,
    rating: 4.9,
    numReviews: 54,
    reviews: [],
    featured: false,
    newArrival: false,
    specs: {
      upperMaterial: 'Single-Shot Injected Bio-EVA Foam',
      midsole: 'Anatomical Arch Support Bed',
      outsole: 'High-Friction Water Dispersion Sole',
      weight: '160g',
      drop: '0mm'
    },
    createdAt: new Date(Date.now() - 86400000 * 50).toISOString()
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading DB file, re-initializing:', err);
    }

    // Default Seed Data
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const customerPasswordHash = bcrypt.hashSync('password123', salt);

    const initialData: DatabaseSchema = {
      users: [
        {
          _id: 'usr_admin_1',
          name: 'BGY Director',
          email: 'admin@bgy.com',
          passwordHash: adminPasswordHash,
          phone: '+250 788 123 456',
          role: 'admin',
          wishlist: ['prod_bgy_aero_1'],
          createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
        },
        {
          _id: 'usr_cust_alex',
          name: 'Alex Mercer',
          email: 'alex@example.com',
          passwordHash: customerPasswordHash,
          phone: '+250 783 456 789',
          role: 'customer',
          address: {
            street: 'KN 7 Rd, Kicukiro',
            city: 'Kigali',
            state: 'Kigali City',
            zip: '00100',
            country: 'Rwanda'
          },
          wishlist: ['prod_bgy_aero_1', 'prod_bgy_gravity_high'],
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
        }
      ],
      products: DEFAULT_PRODUCTS,
      orders: [
        {
          _id: 'ord_sample_1',
          orderNumber: 'BGY-829104',
          userId: 'usr_cust_alex',
          userEmail: 'alex@example.com',
          userName: 'Alex Mercer',
          products: [
            {
              productId: 'prod_bgy_aero_1',
              name: 'BGY Aero-1 Proto',
              image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop',
              price: 210,
              size: 10,
              color: 'Onyx / Crimson',
              quantity: 1
            }
          ],
          shippingAddress: {
            fullName: 'Alex Mercer',
            street: 'KN 7 Rd, Kicukiro',
            city: 'Kigali',
            state: 'Kigali City',
            zip: '00100',
            country: 'Rwanda'
          },
          shippingMethod: 'Rwanda Express Courier',
          paymentMethod: 'MTN Mobile Money',
          subtotal: 210,
          shippingCost: 15,
          discount: 0,
          total: 225,
          status: 'Delivered',
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
        }
      ],
      contactMessages: [
        {
          _id: 'msg_1',
          name: 'Julian Vance',
          email: 'julian@studio.design',
          phone: '+250 788 201 998',
          message: 'Interested in a footwear retail partnership in Kigali.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ]
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write initial DB file:', e);
    }

    return initialData;
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB file:', e);
    }
  }

  // --- Users ---
  getUsers(): UserDocument[] {
    return this.data.users;
  }

  findUserById(id: string): UserDocument | undefined {
    return this.data.users.find(u => u._id === id);
  }

  findUserByEmail(email: string): UserDocument | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<UserDocument, '_id' | 'createdAt'>): UserDocument {
    const newUser: UserDocument = {
      ...userData,
      _id: 'usr_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserDocument>): UserDocument | null {
    const idx = this.data.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Products ---
  getProducts(): ProductDocument[] {
    return this.data.products;
  }

  findProductById(id: string): ProductDocument | undefined {
    return this.data.products.find(p => p._id === id);
  }

  createProduct(productData: Omit<ProductDocument, '_id' | 'createdAt' | 'reviews' | 'rating' | 'numReviews'>): ProductDocument {
    const newProduct: ProductDocument = {
      ...productData,
      _id: 'prod_bgy_' + generateId(),
      reviews: [],
      rating: 5.0,
      numReviews: 0,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<ProductDocument>): ProductDocument | null {
    const idx = this.data.products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const before = this.data.products.length;
    this.data.products = this.data.products.filter(p => p._id !== id);
    if (this.data.products.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  addReview(productId: string, review: { userId: string; userName: string; rating: number; title: string; comment: string }): ProductDocument | null {
    const prod = this.findProductById(productId);
    if (!prod) return null;

    const newReview: ReviewDocument = {
      _id: 'rev_' + generateId(),
      ...review,
      createdAt: new Date().toISOString()
    };

    prod.reviews.unshift(newReview);
    prod.numReviews = prod.reviews.length;
    const sum = prod.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    prod.rating = Number((sum / prod.numReviews).toFixed(1));

    this.save();
    return prod;
  }

  // --- Orders ---
  getOrders(): OrderDocument[] {
    return this.data.orders;
  }

  getUserOrders(userId: string): OrderDocument[] {
    return this.data.orders.filter(o => o.userId === userId);
  }

  findOrderById(id: string): OrderDocument | undefined {
    return this.data.orders.find(o => o._id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<OrderDocument, '_id' | 'orderNumber' | 'createdAt'>): OrderDocument {
    const newOrder: OrderDocument = {
      ...orderData,
      _id: 'ord_' + generateId(),
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString()
    };

    // Decrement stock for each product
    for (const item of newOrder.products) {
      const prod = this.findProductById(item.productId);
      if (prod && prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
      }
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderDocument['status']): OrderDocument | null {
    const idx = this.data.orders.findIndex(o => o._id === orderId);
    if (idx === -1) return null;
    this.data.orders[idx].status = status;
    this.save();
    return this.data.orders[idx];
  }

  // --- Wishlist ---
  toggleWishlist(userId: string, productId: string): string[] {
    const user = this.findUserById(userId);
    if (!user) return [];

    if (!user.wishlist) user.wishlist = [];

    const exists = user.wishlist.includes(productId);
    if (exists) {
      user.wishlist = user.wishlist.filter(id => id !== productId);
    } else {
      user.wishlist.push(productId);
    }
    this.save();
    return user.wishlist;
  }

  // --- Contact Messages ---
  createContactMessage(msg: Omit<ContactMessage, '_id' | 'createdAt'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      _id: 'msg_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.contactMessages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  getContactMessages(): ContactMessage[] {
    return this.data.contactMessages;
  }
}

export const db = new DatabaseService();
