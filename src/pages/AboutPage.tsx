import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import { BgyLogo } from '../components/common/BgyLogo';
import { useLanguage } from '../context/LanguageContext';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-28 select-none">
      {/* Editorial Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <div className="border-b border-neutral-900 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-xs font-mono uppercase tracking-widest text-[#E50914] mb-4">
            <Sparkles className="w-3 h-3" />
            <span>{t('about.badge')}</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-white max-w-4xl leading-[0.95]">
            {t('about.heroTitle')} <br />
            <span className="text-[#E50914]">{t('about.heroHighlight')}</span>.
          </h1>

          <p className="mt-8 text-base sm:text-xl text-neutral-300 font-sans max-w-2xl leading-relaxed">
            {t('about.heroText')}
          </p>
        </div>
      </section>

      {/* BGY Selection Principles */}
      <section className="bg-[#080808] border-y border-neutral-900 py-24 px-4 sm:px-6 lg:px-8 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#E50914] block mb-3">
              {t('about.howWeSelectBadge')}
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              {t('about.howWeSelectTitle')}
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-3">
              {t('about.howWeSelectText')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0c0c0c] border border-neutral-800 relative group hover:border-neutral-600 transition-colors">
              <div className="mb-6">
                <span className="font-display font-black text-5xl text-[#E50914]">B</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{t('about.pillarBTitle')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {t('about.pillarBText')}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0c0c0c] border border-neutral-800 relative group hover:border-neutral-600 transition-colors">
              <div className="mb-6">
                <span className="font-display font-black text-5xl text-white">G</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{t('about.pillarGTitle')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {t('about.pillarGText')}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0c0c0c] border border-neutral-800 relative group hover:border-neutral-600 transition-colors">
              <div className="mb-6">
                <span className="font-display font-black text-5xl text-[#E50914]">Y</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{t('about.pillarYTitle')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {t('about.pillarYText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shoes Only */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block">
              {t('about.approachBadge')}
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              {t('about.approachTitle')}
            </h2>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              {t('about.approachText1')}
            </p>
            <p className="text-sm text-neutral-400 font-sans leading-relaxed">
              {t('about.approachText2')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E50914]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white">
                  {t('about.curatedQuality')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#E50914]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white">
                  {t('about.retailExcellence')}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative">
              <img
                src="https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop"
                alt="BGY footwear retail showroom"
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end font-mono text-[11px] text-neutral-400">
                <span>Rwanda Footwear Retail</span>
                <span className="text-[#E50914]">Premium Selection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="text-center px-4 max-w-3xl mx-auto pt-12 border-t border-neutral-900">
        <h3 className="font-display font-bold text-2xl text-white mb-4">
          {t('about.ctaTitle')}
        </h3>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-colors inline-flex items-center gap-2"
        >
          {t('about.ctaBtn')} <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
