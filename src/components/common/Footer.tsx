import React, { useState } from 'react';
import { Shield, Truck, Phone, Instagram, Mail, Clock } from 'lucide-react';
import { BgyLogo } from './BgyLogo';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [showPhone, setShowPhone] = useState(false);
  return (
    <footer className="bg-[#050505] text-neutral-400 border-t border-neutral-900 select-none">
      {/* Brand Values Highlights */}
      <div className="border-b border-neutral-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Store Hours
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Mon – Sat: 08:00 – 19:00 CAT</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  {t('footer.rwandaDelivery')}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('footer.rwandaDeliveryValue')}</p>
              </div>
            </div>


            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#E50914] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  {t('footer.directConcierge')}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('footer.directConciergeValue')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <BgyLogo size="md" showTagline={true} />
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-sans mt-3">
              {t('footer.brandDesc')}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#E50914]"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                {t('footer.brandTagline')}
              </span>
            </div>
          </div>

          {/* Brand & Company */}
          <div>
            <h5 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold mb-4">
              {t('footer.companyTitle')}
            </h5>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  {t("footer.aboutBgy")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  {t("footer.bgyPhilosophy")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  {t("footer.contactSupport")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  {t("footer.memberPortal")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  {t("footer.trackOrders")}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Drops */}
          <div>
            <h5 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold mb-4">
              {t('footer.releasesTitle')}
            </h5>
            <p className="text-xs text-neutral-400 mb-3">
              {t('footer.releasesText')}
            </p>
            <form onSubmit={e => { e.preventDefault(); alert('Subscribed to BGY private releases.'); }} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 font-sans"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-white text-black hover:bg-neutral-200 rounded-md text-xs font-mono font-bold transition-colors"
                >
                  {t('footer.joinBtn')}
                </button>
              </div>
            </form>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="mailto:hello@bgy.rw"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#E50914] flex items-center justify-center text-neutral-400 hover:text-[#E50914] transition-colors"
                aria-label="Email BGY"
              >
                <Mail className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPhone(v => !v)}
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
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-14 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">{t('footer.privacy')}</span>
            <span className="hover:text-neutral-400 cursor-pointer">{t('footer.terms')}</span>
            <span className="hover:text-neutral-400 cursor-pointer">{t('footer.legal')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
