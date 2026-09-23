import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Lock,
  Package,
  Smartphone,
  MapPin,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { RWANDA_DISTRICTS } from '../data/rwandaDistricts';
import { Order } from '../types';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    cart,
    subtotal,
    shipping,
    discount,
    total,
    clearCart,
    itemCount,
  } = useCart();
  const { user } = useAuth();
  const { language, t, formatCurrency } = useLanguage();

  // 1: Delivery Address, 2: Payment, 3: Completed
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Simplified Rwandan Delivery Form Fields ONLY:
  // - Full Name
  // - Phone Number
  // - District
  // - Delivery Location
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.address?.district || '');
  const [deliveryLocation, setDeliveryLocation] = useState(user?.address?.deliveryLocation || '');

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    district?: string;
    deliveryLocation?: string;
  }>({});

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'airtel' | 'cod' | 'card'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('992');
  const [cardHolder, setCardHolder] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Pre-fill user information if authenticated
  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!district && user.address?.district) setDistrict(user.address.district);
      if (!deliveryLocation && user.address?.deliveryLocation) {
        setDeliveryLocation(user.address.deliveryLocation);
      }
    }
  }, [user]);

  // Sync phone to momo number initially
  useEffect(() => {
    if (phone && !momoNumber) {
      setMomoNumber(phone);
    }
  }, [phone]);

  // Helper to format Rwandan phone numbers cleanly
  const handlePhoneChange = (val: string) => {
    // Keep numbers and plus
    let cleaned = val.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('07') && cleaned.length >= 2) {
      cleaned = '+250 ' + cleaned.substring(1);
    } else if (cleaned.startsWith('2507')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length <= 9) {
      cleaned = '+250 ' + cleaned;
    }
    setPhone(cleaned);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  // Validate the 4 Rwandan delivery fields
  const validateDeliveryForm = (): boolean => {
    const newErrors: {
      fullName?: string;
      phone?: string;
      district?: string;
      deliveryLocation?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('checkout.valFullName');
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Rwanda phone pattern: +250 7XX XXX XXX or 07XX XXX XXX
    const rwandaPhoneRegex = /^(\+?2507[2389]\d{7}|07[2389]\d{7}|\+?2507\d{8})$/;
    if (!cleanPhone || cleanPhone.length < 9) {
      newErrors.phone = t('checkout.valPhone');
    } else if (!rwandaPhoneRegex.test(cleanPhone) && cleanPhone.length < 10) {
      newErrors.phone = t('checkout.valPhone');
    }

    if (!district.trim()) {
      newErrors.district = t('checkout.valDistrict');
    }

    if (!deliveryLocation.trim()) {
      newErrors.deliveryLocation = t('checkout.valDeliveryLocation');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Continue to Payment Step
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDeliveryForm()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Order to backend
  const handlePlaceOrder = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Normalize Rwandan phone number
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('07')) {
        formattedPhone = '+250 ' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+250') && formattedPhone.startsWith('7')) {
        formattedPhone = '+250 ' + formattedPhone;
      }

      const paymentMethodName =
        paymentMethod === 'momo'
          ? 'MTN Mobile Money'
          : paymentMethod === 'airtel'
          ? 'Airtel Money'
          : paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : 'Credit/Debit Card';

      const isRubavuOrKigali = ['Rubavu', 'Gasabo', 'Kicukiro', 'Nyarugenge'].includes(district.trim());
      const orderPayload = {
        products: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: formattedPhone,
          district: district.trim(),
          deliveryLocation: deliveryLocation.trim(),
          // Default internally to Rwanda
          country: 'Rwanda',
          city: district.trim(),
          street: deliveryLocation.trim(),
          state: 'Rwanda',
          zip: '0000',
        },
        shippingMethod: isRubavuOrKigali
          ? 'Rubavu/Kigali Wednesday and Saturday delivery'
          : 'Public transport courier (buyer risk)',
        paymentMethod: paymentMethodName,
        subtotal,
        shippingCost: shipping,
        discount,
        total,
      };

      const result = await api.createOrder(orderPayload);
      setPlacedOrder(result);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart view
  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-neutral-600 mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">{t('cart.emptyTitle')}</h2>
        <p className="text-xs font-mono text-neutral-400 mb-6 max-w-sm text-center">
          {t('cart.emptySubtitle')}
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors"
        >
          {t('cart.returnToShop')}
        </button>
      </div>
    );
  }

  // Order Confirmed Screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-2 font-bold">
            Rwanda Delivery • BGY Kigali Store
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-2">
            {t('checkout.orderSuccessTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-8 font-sans">
            {t('checkout.orderSuccessSubtitle')}
          </p>

          {/* Receipt Box */}
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-left space-y-4 font-mono text-xs mb-8">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-neutral-500 uppercase tracking-wider">{t('checkout.orderRef')}</span>
              <span className="text-white font-bold text-sm text-[#E50914]">{placedOrder.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-neutral-500 uppercase tracking-wider">{t('checkout.orderStatus')}</span>
              <span className="text-emerald-400 font-bold uppercase">{placedOrder.status}</span>
            </div>

            <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
              <span className="text-neutral-500 uppercase tracking-wider">{t('checkout.fullName')}</span>
              <span className="text-white font-medium text-right">{placedOrder.shippingAddress.fullName}</span>
            </div>

            <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
              <span className="text-neutral-500 uppercase tracking-wider">{t('checkout.phone')}</span>
              <span className="text-white font-medium text-right">{placedOrder.shippingAddress.phone || phone}</span>
            </div>

            <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
              <span className="text-neutral-500 uppercase tracking-wider">{t('checkout.orderDestination')}</span>
              <div className="text-right text-white font-medium">
                <div>{placedOrder.shippingAddress.deliveryLocation}</div>
                <div className="text-neutral-400 text-[11px]">{placedOrder.shippingAddress.district}, Rwanda</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-base font-bold">
              <span className="text-white font-display">{t('checkout.totalPaid')}</span>
              <span className="text-[#E50914] font-mono">{formatCurrency(placedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('account')}
              className="px-6 py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" /> {t('checkout.viewMyOrders')}
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 font-mono text-xs uppercase tracking-widest text-white transition-colors"
            >
              {t('checkout.continueShopping')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-900 pb-4">
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('checkout.back')}
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-[#E50914]" />
            <span>256-Bit SSL Encrypted Checkout • Rwanda</span>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-xl mx-auto text-center">
          <div
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              currentStep === 1
                ? 'border-[#E50914] bg-[#E50914]/10 text-white font-bold'
                : 'border-neutral-800 bg-neutral-900/40 text-neutral-400'
            }`}
          >
            <span className="text-[10px] font-mono block uppercase">01</span>
            <span className="text-xs font-display">{t('checkout.stepDelivery')}</span>
          </div>

          <div
            onClick={() => {
              if (validateDeliveryForm()) setCurrentStep(2);
            }}
            className={`p-3 rounded-xl border transition-all ${
              currentStep === 2
                ? 'border-[#E50914] bg-[#E50914]/10 text-white font-bold'
                : 'border-neutral-900 bg-neutral-950 text-neutral-600'
            }`}
          >
            <span className="text-[10px] font-mono block uppercase">02</span>
            <span className="text-xs font-display">{t('checkout.stepPayment')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Checkout Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-neutral-800/90 shadow-xl">
              {/* STEP 1: SIMPLIFIED RWANDA DELIVERY ADDRESS */}
              {currentStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleContinueToPayment}
                  className="space-y-5"
                >
                  <div className="border-b border-neutral-800/80 pb-4">
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      {t('checkout.stepDelivery')}
                    </h2>
                    <p className="text-xs text-neutral-400 font-sans mt-1">
                      {language === 'fr'
                        ? 'Veuillez renseigner votre adresse de livraison au Rwanda pour l’expédition de vos paires.'
                        : 'Please provide your Rwandan delivery details for prompt store dispatch.'}
                    </p>
                  </div>

                  {/* 1. Full Name / Nom complet */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
                      {t('checkout.fullName')} <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                      }}
                      placeholder={t('checkout.fullNamePlaceholder')}
                      className={`w-full bg-neutral-900 border ${
                        errors.fullName ? 'border-[#E50914]' : 'border-neutral-800'
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-[#E50914] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* 2. Phone Number / Numéro de téléphone */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
                      {t('checkout.phone')} <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder={t('checkout.phonePlaceholder')}
                        className={`w-full bg-neutral-900 border ${
                          errors.phone ? 'border-[#E50914]' : 'border-neutral-800'
                        } rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white transition-colors`}
                      />
                    </div>
                    {errors.phone ? (
                      <p className="mt-1 text-xs text-[#E50914] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-neutral-500 font-mono">
                        {t('checkout.phoneHelp')}
                      </p>
                    )}
                  </div>

                  {/* 3. District / District */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
                      {t('checkout.district')} <span className="text-[#E50914]">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={e => {
                        setDistrict(e.target.value);
                        if (errors.district) setErrors(prev => ({ ...prev, district: undefined }));
                      }}
                      className={`w-full bg-neutral-900 border ${
                        errors.district ? 'border-[#E50914]' : 'border-neutral-800'
                      } rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors cursor-pointer`}
                    >
                      <option value="" disabled className="text-neutral-500">
                        {t('checkout.districtPlaceholder')}
                      </option>
                      {RWANDA_DISTRICTS.map(dist => (
                        <option key={dist} value={dist} className="bg-neutral-900 text-white">
                          {dist}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="mt-1 text-xs text-[#E50914] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.district}
                      </p>
                    )}
                  </div>

                  {/* 4. Delivery Location / Lieu de livraison */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
                      {t('checkout.deliveryLocation')} <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={e => {
                        setDeliveryLocation(e.target.value);
                        if (errors.deliveryLocation) {
                          setErrors(prev => ({ ...prev, deliveryLocation: undefined }));
                        }
                      }}
                      placeholder={t('checkout.deliveryLocationPlaceholder')}
                      className={`w-full bg-neutral-900 border ${
                        errors.deliveryLocation ? 'border-[#E50914]' : 'border-neutral-800'
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors`}
                    />
                    {errors.deliveryLocation ? (
                      <p className="mt-1 text-xs text-[#E50914] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.deliveryLocation}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-neutral-500 font-mono">
                        {t('checkout.deliveryLocationHelp')}
                      </p>
                    )}
                  </div>

                  {/* Rwanda delivery policy */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
                    <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
                    <span>
                      {language === 'fr'
                        ? 'Rubavu et Kigali : livraison mercredi et samedi avec de petits frais. Autres provinces : coursier en transport public aux risques de l’acheteur.'
                        : 'Rubavu and Kigali: Wednesday and Saturday delivery for a small transport fee. Other provinces: public-transport courier delivery at the buyer’s risk.'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-white/10"
                    >
                      {t('checkout.continuePayment')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: PAYMENT METHOD */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-neutral-800/80 pb-4">
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      {t('checkout.stepPayment')}
                    </h2>
                    <p className="text-xs text-neutral-400 font-sans mt-1">
                      {t('checkout.paymentOptions')}
                    </p>
                  </div>

                  {/* Selected Delivery Summary */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 uppercase tracking-wider">{t('checkout.stepDelivery')}</span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-[#E50914] hover:underline uppercase text-[11px]"
                      >
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </button>
                    </div>
                    <p className="text-white font-bold">{fullName} • {phone}</p>
                    <p className="text-neutral-400">{deliveryLocation}, {district}, Rwanda</p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* MTN Mobile Money */}
                    <div
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-[#E50914] bg-[#E50914]/10 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {t('checkout.momoPayment')}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {t('checkout.momoSubtitle')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Airtel Money */}
                    <div
                      onClick={() => setPaymentMethod('airtel')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'airtel'
                          ? 'border-[#E50914] bg-[#E50914]/10 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {t('checkout.airtelPayment')}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {t('checkout.airtelSubtitle')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#E50914] bg-[#E50914]/10 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {t('checkout.codPayment')}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {t('checkout.codSubtitle')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Credit / Debit Card */}
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#E50914] bg-[#E50914]/10 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {t('checkout.cardPayment')}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {t('checkout.cardSubtitle')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MoMo Prompt Detail */}
                  {(paymentMethod === 'momo' || paymentMethod === 'airtel') && (
                    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono text-neutral-300 space-y-3">
                      <p>
                        {t('checkout.momoPrompt', { phone: phone || '+250 7XX XXX XXX' })}
                      </p>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                          {language === 'fr' ? 'Numéro de paiement mobile' : 'Mobile Payment Phone Number'}
                        </label>
                        <input
                          type="text"
                          value={momoNumber || phone}
                          onChange={e => setMomoNumber(e.target.value)}
                          placeholder="+250 7XX XXX XXX"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Card Fields */}
                  {paymentMethod === 'card' && (
                    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          {t('checkout.cardHolder')}
                        </label>
                        <input
                          type="text"
                          value={cardHolder || fullName}
                          onChange={e => setCardHolder(e.target.value)}
                          placeholder={fullName || 'Cardholder Name'}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          {t('checkout.cardNumber')}
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                            {t('checkout.cardExpiry')}
                          </label>
                          <input
                            type="text"
                            value={cardExp}
                            onChange={e => setCardExp(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                            {t('checkout.cardCvc')}
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs font-mono text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Buttons: Back / Place Order */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-mono uppercase text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('checkout.back')}
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl bg-[#E50914] text-white hover:bg-red-700 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#E50914]/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{t('common.loading')}</span>
                      ) : (
                        <>
                          {t('checkout.placeOrder')} ({formatCurrency(total)})
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 sticky top-28 shadow-xl">
              <h3 className="font-display font-bold text-base text-white border-b border-neutral-800 pb-3 flex items-center justify-between">
                <span>{t('checkout.orderSummary')}</span>
                <span className="text-xs font-mono text-neutral-500 font-normal">
                  {itemCount} {itemCount === 1 ? 'pair' : 'pairs'}
                </span>
              </h3>

              {/* Items preview */}
              <div className="divide-y divide-neutral-900 max-h-[300px] overflow-y-auto my-4 pr-1">
                {cart.map(item => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="py-3 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-neutral-950 border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      <p className="text-[11px] font-mono text-neutral-400">
                        Pointure {item.size} • {item.color}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {t('product.quantity')}: {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-neutral-800 pt-4 space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#E50914]">
                    <span>{t('cart.discount')}</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-white">
                    {shipping === 0 ? t('cart.free') : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                  <span className="font-display">{t('cart.total')}</span>
                  <span className="font-mono text-[#E50914]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>{t('cart.guarantee')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
