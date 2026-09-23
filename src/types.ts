export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductSpecs {
  upperMaterial: string;
  midsole: string;
  outsole: string;
  weight: string;
  drop: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface Product {
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
  colors: ColorOption[];
  stock: number;
  rating: number;
  numReviews: number;
  reviews: Review[];
  featured: boolean;
  newArrival: boolean;
  specs: ProductSpecs;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: number;
  color: string;
  quantity: number;
  maxStock: number;
}

export interface ShippingAddress {
  fullName: string;
  phone?: string;
  district: string;
  deliveryLocation: string;
  country?: string;
  // Backward compatibility fields
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: ShippingAddress;
  wishlist: string[];
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

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  categoryCounts: Record<string, number>;
}
