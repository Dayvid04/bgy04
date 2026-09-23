import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  HelpCircle, ChevronDown, Sparkles, Instagram,
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendContact({ name, email, message: `[Subject: ${subject}] ${message}` });
      setSuccess(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to transmit message');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: t('contact.faq1q'), a: t('contact.faq1a') },
    { q: t('contact.faq2q'), a: t('contact.faq2a') },
    { q: t('contact.faq3q'), a: t('contact.faq3a') },
    { q: t('contact.faq4q'), a: t('contact.faq4a') },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-28 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-14 border-b border-neutral-900 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-xs font-mono uppercase tracking-widest text-[#E50914] mb-3">
            <Sparkles className="w-3 h-3" />
            <span>{t('contact.badge')}</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white">
            {t('contact.heading')}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-2">
            {t('contact.responseTime')} <span className="text-[#E50914] font-bold">{t('contact.responseTimeValue')}</span> {t('contact.responseTimeSuffix')}
          </p>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowEmail(v => !v); setShowPhone(false); }}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </button>
              {showEmail && (
                <span className="text-xs font-mono text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  niyigenadavid0@gmail.com
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowPhone(v => !v); setShowEmail(false); }}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>
              {showPhone && (
                <span className="text-xs font-mono text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  +250 795 139 456
                </span>
              )}
            </div>
            <a
              href="https://www.instagram.com/bgy_kicks/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white font-bold">{t('contact.storeHours')}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('contact.storeHoursValue')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white font-bold">{t('contact.rwandaDelivery')}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('contact.rwandaDeliveryValue')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white font-bold">{t('contact.directConcierge')}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('contact.directConciergeValue')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form & Store Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
              <h3 className="font-display font-extrabold text-2xl text-white mb-2">
                {t('contact.inquiryTitle')}
              </h3>
              <p className="text-xs text-neutral-400 mb-6 font-sans">
                {t('contact.inquirySubtitle')}
              </p>

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('contact.successMsg')}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      {t('contact.fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('contact.fullNamePlaceholder')}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      {t('contact.emailAddress')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('contact.emailPlaceholder')}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    {t('contact.subjectLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder={t('contact.subjectPlaceholder')}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    {t('contact.messageLabel')}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? t('contact.sendingBtn') : t('contact.dispatchBtn')}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Direct Channels & Showrooms */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
              <h4 className="font-display font-bold text-base text-white">{t('contact.directChannels')}</h4>
              <div className="flex items-center gap-3">
                <a
                  href="tel:+250795139456"
                  className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/bgy_kicks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
              <h4 className="font-display font-bold text-base text-white">{t('contact.storePoints')}</h4>
              <div className="space-y-4 text-xs font-sans">
                <div className="border-l-2 border-[#E50914] pl-3">
                  <h5 className="font-display font-bold text-white">{t('contact.bgyStore')}</h5>
                  <p className="text-neutral-400 text-[11px] font-mono mt-0.5">{t('contact.storeLocation')}</p>
                  <p className="text-neutral-500 text-[11px] font-mono mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E50914]" /> {t('contact.storeHoursValue')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="border-t border-neutral-900 pt-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-1">
                {t('contact.faqBadge')}
              </span>
              <h3 className="font-display font-extrabold text-3xl text-white">
                {t('contact.faqTitle')}
              </h3>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl bg-[#0a0a0a] border border-neutral-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-display font-bold text-white hover:text-neutral-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#E50914]' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-neutral-400 font-sans leading-relaxed border-t border-neutral-900 mt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
