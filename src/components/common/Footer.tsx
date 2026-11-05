import React, { useState } from 'react';
import { Instagram, Mail, Phone } from 'lucide-react';
import { BgyLogo } from './BgyLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteContent } from '../../context/SiteContentContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const [showPhone, setShowPhone] = useState(false);
  return (
    <footer className="border-t border-neutral-800 bg-[#050505] text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 border-b border-neutral-800 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <BgyLogo size="md" showTagline />
          <p className="max-w-md text-sm leading-6 text-neutral-400">{content.footerDescription || t('footer.brandDesc')}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <nav aria-label="Shop links">
          <h2 className="mb-4 text-sm font-semibold text-white">Shop</h2>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => onNavigate('shop')} className="min-h-11 hover:text-white">All footwear</button></li>
            <li><button onClick={() => onNavigate('new-in')} className="min-h-11 hover:text-white">New in</button></li>
            <li><button onClick={() => onNavigate('account')} className="min-h-11 hover:text-white">Wishlist</button></li>
          </ul>
        </nav>

        <nav aria-label="Help links">
          <h2 className="mb-4 text-sm font-semibold text-white">Help</h2>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => onNavigate('contact')} className="min-h-11 hover:text-white">Contact us</button></li>
            <li><button onClick={() => onNavigate('account')} className="min-h-11 hover:text-white">My account</button></li>
            <li><button onClick={() => onNavigate('about')} className="min-h-11 hover:text-white">About BGY</button></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Contact</h2>
          <div className="flex items-center gap-3">
            <a href={`mailto:${content.contactEmail}`} aria-label="Email BGY" className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 hover:border-white hover:text-white">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
            <button onClick={() => setShowPhone(value => !value)} aria-label="Show BGY phone number" className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 hover:border-white hover:text-white">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </button>
            <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="BGY on Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 hover:border-white hover:text-white">
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          {showPhone && <p className="mt-3 text-sm text-neutral-400">{content.contactPhone}</p>}
          <form onSubmit={event => { event.preventDefault(); alert('Thanks for subscribing.'); }} className="mt-6">
            <label htmlFor="footer-email" className="mb-2 block text-sm text-neutral-300">{t('footer.releasesTitle')}</label>
            <div className="flex gap-2">
              <input id="footer-email" type="email" required placeholder={t('footer.emailPlaceholder')} className="min-w-0 w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-white placeholder-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E50914]" />
              <button type="submit" className="min-h-11 bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-200">{t('footer.joinBtn')}</button>
            </div>
          </form>
        </div>
      </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-neutral-800 px-4 py-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
        <div className="flex gap-5"><button onClick={() => onNavigate('contact')} className="hover:text-white">{t('footer.privacy')}</button><button onClick={() => onNavigate('contact')} className="hover:text-white">{t('footer.terms')}</button></div>
      </div>
    </footer>
  );
};
