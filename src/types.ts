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
  active?: boolean;
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
  paymentStatus: 'Unpaid' | 'Pending' | 'Paid' | 'Refunded';
  createdAt: string;
}

export interface SiteContent {
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  menEyebrow: string;
  menTitle: string;
  menDescription: string;
  menButtonText: string;
  womenEyebrow: string;
  womenTitle: string;
  womenDescription: string;
  womenButtonText: string;
  closingEyebrow: string;
  closingQuote: string;
  closingDescription: string;
  closingButtonText: string;
  showMenSection: boolean;
  showWomenSection: boolean;
  showBenefits: boolean;
  showClosing: boolean;
  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  navShop: string;
  navNewIn: string;
  navAbout: string;
  navContact: string;
  promotionTitle: string;
  promotionMessage: string;
  promotionDiscountPercent: number;
  promotionStartsAt: string;
  promotionEndsAt: string;
  promotionActive: boolean;
  aboutBadge: string;
  aboutHeroTitle: string;
  aboutHeroHighlight: string;
  aboutHeroText: string;
  aboutSelectionBadge: string;
  aboutSelectionTitle: string;
  aboutSelectionText: string;
  aboutComfortTitle: string;
  aboutComfortText: string;
  aboutDesignTitle: string;
  aboutDesignText: string;
  aboutValueTitle: string;
  aboutValueText: string;
  aboutApproachBadge: string;
  aboutApproachTitle: string;
  aboutApproachText1: string;
  aboutApproachText2: string;
  aboutCuratedQuality: string;
  aboutRetailExcellence: string;
  aboutCtaTitle: string;
  aboutCtaButton: string;
  aboutImage: string;
  aboutImageAlt: string;
  contactBadge: string;
  contactHeading: string;
  contactResponseTime: string;
  contactResponseTimeValue: string;
  contactResponseTimeSuffix: string;
  contactStoreHours: string;
  contactStoreHoursValue: string;
  contactDeliveryLabel: string;
  contactDeliveryValue: string;
  contactConciergeLabel: string;
  contactConciergeValue: string;
  contactInquiryTitle: string;
  contactInquirySubtitle: string;
  contactSuccessMsg: string;
  contactFullNameLabel: string;
  contactFullNamePlaceholder: string;
  contactEmailLabel: string;
  contactEmailPlaceholder: string;
  contactSubjectLabel: string;
  contactSubjectPlaceholder: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactSubmitButton: string;
  contactSendingLabel: string;
  contactChannelsTitle: string;
  contactStorePointsTitle: string;
  contactStoreName: string;
  contactLocation: string;
  contactFaqBadge: string;
  contactFaqTitle: string;
  contactFaq1Question: string;
  contactFaq1Answer: string;
  contactFaq2Question: string;
  contactFaq2Answer: string;
  contactFaq3Question: string;
  contactFaq3Answer: string;
  contactFaq4Question: string;
  contactFaq4Answer: string;
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
