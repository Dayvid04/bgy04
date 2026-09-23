import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Package,
  DollarSign,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  LogOut,
  Store,
  Download,
  ImagePlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Product, Order, User } from '../types';

interface AdminPageProps {
  onNavigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { formatCurrency, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'customers'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Edit / Add Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 220,
    deliveryPrice: 3000,
    otherProvinceDeliveryPrice: 5000,
    discountPrice: 0,
    description: '',
    stock: 25,
    newArrival: false,
    images: [] as string[],
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    colors: [{ name: 'Monochrome Black', hex: '#111111' }],
    gender: 'men' as 'men' | 'women' | 'unisex',
    category: 'Sneakers',
  });

  const handleImageImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProductForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const handleAvailableSizeToggle = (size: number) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(value => value !== size)
        : [...prev.sizes, size].sort((a, b) => a - b),
    }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes, custRes] = await Promise.all([
        api.getAdminStats(),
        api.getProducts({}),
        api.getAdminOrders(),
        api.getAdminUsers(),
      ]);
      setStats(statsRes);
      setProducts(prodRes.products);
      setOrders(ordRes || []);
      setCustomers(custRes || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-36 pb-20 flex flex-col items-center justify-center px-4 select-none">
        <Shield className="w-16 h-16 text-[#E50914] mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">Admin Clearance Required</h2>
        <p className="text-xs font-mono text-neutral-400 mb-6 text-center max-w-sm">
          You must be authenticated with an administrator account to access the BGY store inventory and order management system.
        </p>
      </div>
    );
  }

  // Handle Order Status Change
  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to retire this footwear silhouette from the database?')) return;
    try {
      await api.deleteAdminProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.images.length === 0) {
      alert('Import at least one shoe picture before saving.');
      return;
    }
    if (productForm.sizes.length === 0) {
      alert('Select at least one available Eur size.');
      return;
    }
    try {
      if (editingProduct) {
        const updated = await api.updateAdminProduct(editingProduct._id, productForm);
        setProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
      } else {
        const created = await api.createAdminProduct(productForm as any);
        setProducts(prev => [created, ...prev]);
      }
      setProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      deliveryPrice: prod.deliveryPrice || 3000,
      otherProvinceDeliveryPrice: prod.otherProvinceDeliveryPrice || 5000,
      discountPrice: prod.discountPrice || 0,
      description: prod.description,
      stock: prod.stock,
      newArrival: prod.newArrival,
      images: prod.images,
      sizes: prod.sizes,
      colors: prod.colors,
      gender: prod.gender,
      category: prod.category,
    });
    setProductModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: 'BGY Carbon Strider',
      price: 240,
      deliveryPrice: 3000,
      otherProvinceDeliveryPrice: 5000,
      discountPrice: 0,
      description: 'Premium materials selected for comfort, durability, and everyday wear.',
      stock: 20,
      newArrival: true,
      images: [],
      sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
      colors: [
        { name: 'Pitch Black', hex: '#111111' },
        { name: 'Crimson Vector', hex: '#E50914' },
      ],
      gender: 'men' as 'men' | 'women' | 'unisex',
      category: 'Sneakers',
    });
    setProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-28 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="relative mt-6 mb-8 overflow-hidden rounded-3xl border border-neutral-800 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_38%),linear-gradient(135deg,#111111,#070707)] p-6 sm:p-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#E50914]/20" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#E50914]" />
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914]">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                Good to see you, {user?.name?.split(' ')[0] || 'Admin'}.
              </h1>
              <p className="mt-2 max-w-xl text-sm text-neutral-400">
                Monitor orders, manage available Eur sizes, and keep the BGY storefront moving from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-neutral-200 transition-colors hover:border-white hover:text-white"
              >
                <Store className="h-3.5 w-3.5" /> View Store
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E50914]/40 bg-[#E50914]/10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#ff6b72] transition-colors hover:bg-[#E50914]/20"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-6 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">Operations overview</span>
            <h2 className="mt-1 font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Store performance</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Shoe
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-neutral-900 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            Dashboard Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'products'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'customers'
                ? 'bg-white text-black font-bold'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest">Total Sales</span>
                  <DollarSign className="w-4 h-4 text-[#E50914]" />
                </div>
                <span className="font-display font-extrabold text-2xl lg:text-3xl text-white">
                  {formatCurrency(stats.totalSales || 0)}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">+18.4% this quarter</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest">Total Orders</span>
                  <Package className="w-4 h-4 text-[#E50914]" />
                </div>
                <span className="font-display font-extrabold text-3xl text-white">
                  {stats.totalOrders || 0}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                  Active fulfillment queue
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest">Silhouettes</span>
                  <Package className="w-4 h-4 text-[#E50914]" />
                </div>
                <span className="font-display font-extrabold text-3xl text-white">
                  {stats.totalProducts || products.length}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                  Across 5 architectural lines
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest">Members</span>
                  <Users className="w-4 h-4 text-[#E50914]" />
                </div>
                <span className="font-display font-extrabold text-3xl text-white">
                  {stats.totalCustomers || customers.length}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                  Verified registered buyers
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
              <h3 className="font-display font-bold text-lg text-white mb-4">
                Recent Store Dispatches
              </h3>
              <div className="divide-y divide-neutral-900 font-mono text-xs">
                {orders.slice(0, 5).map(ord => (
                  <div key={ord._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{ord.orderNumber}</span>
                      <span className="text-neutral-500 text-[11px]">
                        {ord.shippingAddress?.fullName} • {ord.products?.length || 0} items
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold block">{formatCurrency(ord.total)}</span>
                      <span className="text-[#E50914] text-[10px] uppercase">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(prod => (
                <div
                  key={prod._id}
                  className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-black rounded-xl overflow-hidden p-4 mb-3 flex items-center justify-center">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#E50914]">
                          {prod.category}
                        </span>
                        <h4 className="font-display font-bold text-white text-sm">{prod.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{formatCurrency(prod.price)}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{prod.tagline}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-neutral-500">
                      <span>Stock: {prod.stock} pairs</span>
                      <span>•</span>
                      <span>{prod.sizes.length} sizes</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900 flex gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xs font-mono uppercase text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-600 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete silhouette"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(ord => (
              <div
                key={ord._id}
                className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{ord.orderNumber}</span>
                    <span className="text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    Buyer: <strong className="text-white">{ord.shippingAddress?.fullName}</strong> ({ord.userEmail || 'Member'})
                  </p>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Destination: <span className="text-neutral-300">{ord.shippingAddress?.deliveryLocation || ord.shippingAddress?.street}</span>, {ord.shippingAddress?.district || ord.shippingAddress?.city}, Rwanda {ord.shippingAddress?.phone ? `• Tel: ${ord.shippingAddress.phone}` : ''}
                  </p>

                  <div className="flex gap-2 mt-3">
                    {ord.products?.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800 text-neutral-300">
                        {item.name} (Eur {item.size}) x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">{formatCurrency(ord.total)}</span>
                    <span className="text-[10px] text-neutral-500 uppercase">{ord.paymentMethod}</span>
                  </div>

                  {/* Status Change Selector */}
                  <select
                    value={ord.status}
                    onChange={e => handleOrderStatusChange(ord._id, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono uppercase tracking-wider cursor-pointer focus:outline-none ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : ord.status === 'Shipped'
                        ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <option value="Pending" className="bg-neutral-900 text-white">Pending</option>
                    <option value="Processing" className="bg-neutral-900 text-white">Processing</option>
                    <option value="Shipped" className="bg-neutral-900 text-white">Shipped</option>
                    <option value="Delivered" className="bg-neutral-900 text-white">Delivered</option>
                    <option value="Cancelled" className="bg-neutral-900 text-white">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {customers.map(cust => (
                  <tr key={cust._id}>
                    <td className="py-3 font-bold text-white">{cust.name}</td>
                    <td className="py-3 text-neutral-400">{cust.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          cust.role === 'admin'
                            ? 'bg-[#E50914]/20 text-[#E50914]'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {cust.role}
                      </span>
                    </td>
                    <td className="py-3 text-emerald-400">
                      Active Member
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Create / Edit Modal */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setProductModalOpen(false)}
            />
            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8 text-white z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                <h3 className="font-display font-bold text-xl">
                  {editingProduct ? 'Edit Footwear Silhouette' : 'Commission New BGY Silhouette'}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Shoe Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">Gender *</label>
                    <select
                      value={productForm.gender}
                      onChange={e => setProductForm({ ...productForm, gender: e.target.value as any })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white font-mono"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">Category *</label>
                    <input
                      type="text"
                      required
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g. Sneakers, Runners..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Price (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Delivery Fee (RWF)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        value={productForm.deliveryPrice}
                        onChange={e => setProductForm({ ...productForm, deliveryPrice: Number(e.target.value) })}
                        className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="Rubavu/Kigali"
                        aria-label="Rubavu and Kigali delivery fee"
                      />
                      <input
                        type="number"
                        min="0"
                        value={productForm.otherProvinceDeliveryPrice}
                        onChange={e => setProductForm({ ...productForm, otherProvinceDeliveryPrice: Number(e.target.value) })}
                        className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="Other provinces"
                        aria-label="Other provinces delivery fee"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-neutral-500">Rubavu/Kigali · Other provinces</p>
                  </div>
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Available Eur Sizes
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                    {Array.from({ length: 11 }, (_, index) => index + 35).map(size => {
                      const selected = productForm.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleAvailableSizeToggle(size)}
                          className={`rounded-lg border py-2 text-xs font-mono transition-colors ${selected ? 'border-[#E50914] bg-[#E50914]/15 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-600'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-500">Select only the Eur sizes currently available for this shoe.</p>
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Material Description
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 font-mono text-xs text-neutral-200">
                  <input
                    type="checkbox"
                    checked={productForm.newArrival}
                    onChange={e => setProductForm({ ...productForm, newArrival: e.target.checked })}
                    className="h-4 w-4 accent-[#E50914]"
                  />
                  <span>
                    <strong className="block text-white">Release in New In</strong>
                    <span className="text-[10px] text-neutral-500">Show the customer-facing NEW tag and publish this shoe on the New In page.</span>
                  </span>
                </label>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono uppercase tracking-wider text-neutral-400">
                      Shoe Pictures
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-neutral-200 hover:border-white">
                      <ImagePlus className="h-3.5 w-3.5" /> Import Pictures
                      <input type="file" accept="image/*" multiple onChange={handleImageImport} className="sr-only" />
                    </label>
                  </div>
                  {productForm.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productForm.images.map((image, index) => (
                        <div key={`${image.slice(0, 20)}-${index}`} className="relative overflow-hidden rounded-xl border border-neutral-800 bg-black">
                          <img src={image} alt={`Shoe view ${index + 1}`} className="aspect-square w-full object-contain" />
                          <div className="absolute inset-x-1 bottom-1 flex gap-1">
                            <a href={image} download={`bgy-shoe-${index + 1}.png`} className="flex flex-1 items-center justify-center rounded-md bg-white/90 py-1 text-black" title="Export picture">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button type="button" onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((_, imageIndex) => imageIndex !== index) })} className="rounded-md bg-red-600/90 px-2 py-1 text-white" title="Remove picture">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-neutral-800 px-4 py-8 text-center text-xs text-neutral-500">
                      Import at least one picture for customers to see.
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono uppercase tracking-wider text-neutral-400">
                      Available Colors
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, colors: [...productForm.colors, { name: 'New Color', hex: '#ffffff' }] })}
                      className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-neutral-200 hover:border-white"
                    >
                      Add Color
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productForm.colors.map((color, index) => (
                      <div key={`${color.name}-${index}`} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={e => setProductForm({ ...productForm, colors: productForm.colors.map((item, colorIndex) => colorIndex === index ? { ...item, hex: e.target.value } : item) })}
                          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900 p-1"
                          title="Choose color"
                        />
                        <input
                          type="text"
                          value={color.name}
                          onChange={e => setProductForm({ ...productForm, colors: productForm.colors.map((item, colorIndex) => colorIndex === index ? { ...item, name: e.target.value } : item) })}
                          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-white"
                          placeholder="Color name"
                        />
                        {productForm.colors.length > 1 && (
                          <button type="button" onClick={() => setProductForm({ ...productForm, colors: productForm.colors.filter((_, colorIndex) => colorIndex !== index) })} className="rounded-lg border border-neutral-800 p-2 text-neutral-500 hover:border-red-600 hover:text-red-400" title="Remove color">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono uppercase tracking-widest font-bold"
                >
                  {editingProduct ? 'Commit Silhouette Updates' : 'Launch New Silhouette'}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
