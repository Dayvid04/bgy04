import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BgyLogo } from '../common/BgyLogo';

export const AuthModal: React.FC = () => {
  const { t } = useLanguage();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    register,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setError(null);
    setFieldErrors({});
  };

  // Sync mode if changed from context
  React.useEffect(() => {
    setMode(authModalMode);
    clearForm();
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextFieldErrors: Record<string, string> = {};

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) nextFieldErrors.email = 'Email is required.';
    else if (normalizedEmail !== 'admin' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextFieldErrors.email = 'Enter a valid email address.';
    if (!password) nextFieldErrors.password = 'Password is required.';

    if (mode === 'register') {
      if (!name.trim()) nextFieldErrors.name = 'Full name is required.';
      else if (name.trim().length < 2 || name.trim().length > 80) nextFieldErrors.name = 'Name must be between 2 and 80 characters.';
      if (normalizedEmail === 'admin') nextFieldErrors.email = 'This email is reserved for the static admin account.';
      if (password.length < 12) nextFieldErrors.password = 'Use at least 12 characters.';
      if (password.length > 128) nextFieldErrors.password = 'Password must be 128 characters or fewer.';
      if (password !== confirmPassword) nextFieldErrors.confirmPassword = 'Passwords do not match.';

      const normalizedPhone = phone.trim();
      if (normalizedPhone && (!/^\d+$/.test(normalizedPhone) || normalizedPhone.length > 10)) {
        nextFieldErrors.phone = 'Phone number must contain only digits and cannot exceed 10 numbers.';
      }
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      clearForm();
    } catch (err: any) {
      if (mode === 'login') {
        setFieldErrors({ password: 'Invalid email or password. Please try again.' });
      } else if (err.status === 409) {
        setFieldErrors({ email: 'An account with this email already exists.' });
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
        />

        {/* Modal Card */}
        <motion.div
          className="relative w-full max-w-md bg-[#0D0D0D] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white z-10 overflow-y-auto"
          style={{ maxHeight: 'min(90dvh, 700px)' }}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <BgyLogo size="md" />
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              {mode === 'login' ? 'Access BGY Account' : 'Join BGY Members'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access your orders, wishlist, and exclusive releases'
                : 'Create your account for bespoke footwear drops and expedited checkout'}
            </p>
          </div>

          {/* Quick 1-Click Demo Buttons for Instant Testing */}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('auth.namePlaceholder')}
                      className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2.5 text-base text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 ${fieldErrors.name ? 'border-red-500' : 'border-neutral-800'}`}
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="0788000000"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-base text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.phone}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={e => setEmail(e.target.value)}
                  placeholder="bgy@gmail.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2.5 text-base text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 ${fieldErrors.email ? 'border-red-500' : 'border-neutral-800'}`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  maxLength={mode === 'register' ? 128 : undefined}
                  value={password}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 12 characters' : 'Password'}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2.5 text-base text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 ${fieldErrors.password ? 'border-red-500' : 'border-neutral-800'}`}
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.password}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    maxLength={128}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2.5 text-base text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-neutral-800'}`}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-display font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  Sign In to BGY
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              ) : (
                <>
                  Create BGY Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-6 text-center text-xs text-neutral-400 border-t border-neutral-800/80 pt-4">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => { clearForm(); setMode('register'); }}
                  className="text-white hover:text-[#E50914] font-semibold underline underline-offset-4 transition-colors ml-1"
                >
                  Join BGY
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { clearForm(); setMode('login'); }}
                  className="text-white hover:text-[#E50914] font-semibold underline underline-offset-4 transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
