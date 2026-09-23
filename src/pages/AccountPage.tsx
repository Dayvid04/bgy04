import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Heart,
  User as UserIcon,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  LogOut,
  ArrowRight,
  Shield,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Order, Product } from '../types';
import { RWANDA_DISTRICTS } from '../data/rwandaDistricts';

interface AccountPageProps {
  onNavigate: (route: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth();
  const { wishlistProducts, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, formatCurrency, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Form state - Rwandan Address ONLY: Full Name, Phone Number, District, Delivery Location
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.address?.district || user?.address?.city || '');
  const [deliveryLocation, setDeliveryLocation] = useState(user?.address?.deliveryLocation || user?.address?.street || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setDistrict(user.address?.district || user.address?.city || '');
      setDeliveryLocation(user.address?.deliveryLocation || user.address?.street || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setLoadingOrders(true);
      try {
        const res = await api.getMyOrders();
        setOrders(res || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-36 pb-20 flex flex-col items-center justify-center px-4 select-none">
        <UserIcon className="w-16 h-16 text-neutral-600 mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">Member Authentication Required</h2>
        <p className="text-xs font-mono text-neutral-400 mb-6 text-center max-w-sm">
          Please sign in or create your BGY membership to view your orders, wishlist, and shipping preferences.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-colors"
        >
          Sign In to BGY
        </button>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        address: {
          fullName: name,
          phone,
          district,
          deliveryLocation,
          street: deliveryLocation,
          city: district,
          state: 'Rwanda',
          zip: '0000',
          country: 'Rwanda',
        },
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-6 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-1">
              Member Console
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-xs font-mono text-neutral-400 mt-1">{user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-xs font-mono text-[#E50914] flex items-center gap-2 hover:bg-[#E50914]/25 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Console
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-900 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'wishlist'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" /> Wishlist ({wishlistProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Shipping & Profile
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="py-20 text-center font-mono text-xs text-neutral-500">
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0a0a0a] border border-dashed border-neutral-800 text-center">
                <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg text-white mb-1">No Orders Logged Yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
                  You have not placed any footwear orders with BGY yet.
                </p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest font-bold"
                >
                  Explore Footwear
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(ord => (
                  <div
                    key={ord._id}
                    className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold font-mono text-white">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Placed on{' '}
                        {new Date(ord.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {ord.products?.length || 0} item(s)
                      </p>

                      <div className="flex gap-2 mt-3">
                        {ord.products?.map((it, idx) => (
                          <img
                            key={idx}
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-10 object-cover rounded-lg bg-black border border-neutral-800"
                            title={`${it.name} (Eur ${it.size})`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center">
                      <span className="text-base font-bold font-mono text-white">
                        {formatCurrency(ord.total)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xs font-mono uppercase text-neutral-300 hover:text-white transition-colors"
                      >
                        {language === 'fr' ? 'Détails de la commande' : 'Order Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0a0a0a] border border-dashed border-neutral-800 text-center">
                <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg text-white mb-1">Your Wishlist is Empty</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
                  Save silhouettes you're considering to compare specs and availability.
                </p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest font-bold"
                >
                  Browse Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((prod: Product) => (
                  <div
                    key={prod._id}
                    className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 flex flex-col justify-between"
                  >
                    <div
                      onClick={() => onSelectProduct(prod._id)}
                      className="cursor-pointer"
                    >
                      <div className="aspect-square bg-black rounded-xl overflow-hidden p-4 mb-4 flex items-center justify-center">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">{prod.name}</h4>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">
                        {formatCurrency(prod.discountPrice || prod.price)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-900 flex gap-2">
                      <button
                        onClick={() => {
                          addToCart({
                            productId: prod._id,
                            name: prod.name,
                            image: prod.images[0],
                            price: prod.discountPrice || prod.price,
                            size: prod.sizes[0] || 9,
                            color: prod.colors[0]?.name || 'Standard',
                            maxStock: prod.stock,
                          }, 1);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                      </button>
                      <button
                        onClick={() => removeFromWishlist(prod._id)}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xs font-mono text-neutral-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile & Address */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Member Profile & Shipping Preferences
            </h3>
            <p className="text-xs text-neutral-400 mb-6 font-sans">
              Keep your address updated for one-click checkout and private drop deliveries.
            </p>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
                Your profile details and shipping preferences have been updated!
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  {t('checkout.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  {t('checkout.phone')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    {t('checkout.district')}
                  </label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                  >
                    <option value="">{t('checkout.selectDistrict')}</option>
                    {RWANDA_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    {t('checkout.deliveryLocation')}
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    placeholder={language === 'fr' ? 'ex. Kimihurura, près de la Mairie' : 'e.g. Kimihurura, near City Hall'}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="mt-4 px-8 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase tracking-widest font-bold transition-colors"
              >
                {profileSaving
                  ? (language === 'fr' ? 'Enregistrement...' : 'Saving Changes...')
                  : (language === 'fr' ? 'Enregistrer le profil' : 'Save Profile')}
              </button>
            </form>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-white z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4 border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="font-display font-bold text-lg">Order {selectedOrder.orderNumber}</h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Status: <span className="text-[#E50914]">{selectedOrder.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block uppercase tracking-wider text-[10px] mb-2">
                    {language === 'fr' ? 'Articles commandés' : 'Purchased Silhouettes'}
                  </span>
                  <div className="space-y-2">
                    {selectedOrder.products?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-2 bg-neutral-900/50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded bg-black"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-neutral-400">Eur {item.size} • {item.color} • Qty {item.quantity}</p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-3">
                  <span className="text-neutral-500 block uppercase tracking-wider text-[10px] mb-1">
                    {language === 'fr' ? 'Destination de livraison (Rwanda)' : 'Delivery Destination (Rwanda)'}
                  </span>
                  <p className="text-white leading-relaxed">
                    <strong>{selectedOrder.shippingAddress.fullName}</strong>
                    {selectedOrder.shippingAddress.phone && ` • ${selectedOrder.shippingAddress.phone}`}<br />
                    {selectedOrder.shippingAddress.deliveryLocation || selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.district || selectedOrder.shippingAddress.city}, Rwanda
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-3 flex justify-between font-bold text-sm">
                  <span>{t('cart.total')}</span>
                  <span className="text-[#E50914]">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
