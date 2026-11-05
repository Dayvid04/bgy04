import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SiteContent } from '../types';
import { api } from '../services/api';

export const defaultSiteContent: SiteContent = {
  announcement: '',
  heroEyebrow: 'RWANDA FOOTWEAR COLLECTION',
  heroTitle: 'STEP INTO BGY',
  heroDescription: 'Premium footwear for men and women — modern movement, daily wear, and confident style.',
  heroImage: '/nike.jpeg',
  heroImageAlt: 'Nike sneaker product image',
  primaryButtonText: 'Shop Now',
  secondaryButtonText: 'Explore Collection',
  menEyebrow: "Men's Collection",
  menTitle: 'All Sneakers',
  menDescription: "Explore every men’s sneaker selected by BGY for everyday confidence.",
  menButtonText: "Shop Men's",
  womenEyebrow: "Women's Collection",
  womenTitle: 'All Collection',
  womenDescription: "Explore every women’s sneaker selected for comfort, style, and daily movement.",
  womenButtonText: "Shop Women's",
  closingEyebrow: 'Movement. Identity. Modern Footwear.',
  closingQuote: 'The best footwear balances performance, comfort, and style.',
  closingDescription: 'BGY curates premium footwear for men and women that feels right, looks polished, and serves real life in Rwanda and beyond.',
  closingButtonText: 'Learn About BGY',
  showMenSection: true,
  showWomenSection: true,
  showBenefits: true,
  showClosing: true,
  footerDescription: 'Premium footwear for men and women, selected for everyday movement.',
  contactEmail: 'hello@bgy.rw',
  contactPhone: '+250 795 139 456',
  instagramUrl: 'https://www.instagram.com/bgy_kicks/',
  navShop: 'Sneakers',
  navNewIn: 'New In',
  navAbout: 'About',
  navContact: 'Contact',
  promotionTitle: '',
  promotionMessage: '',
  promotionDiscountPercent: 0,
  promotionStartsAt: '',
  promotionEndsAt: '',
  promotionActive: false,
  aboutBadge: 'ABOUT BGY',
  aboutHeroTitle: 'A trusted footwear retailer for',
  aboutHeroHighlight: 'modern Rwanda',
  aboutHeroText: 'BGY is a Rwanda-based retail business focused on premium footwear for everyday movement, work, travel, and city life.',
  aboutSelectionBadge: 'HOW WE SELECT',
  aboutSelectionTitle: 'Curated for comfort, style, and performance',
  aboutSelectionText: 'We look beyond trends to offer footwear that balances quality, versatility, and value for customers in Rwanda and beyond.',
  aboutComfortTitle: 'Everyday Comfort',
  aboutComfortText: 'We prioritize pairs that feel good from the first wear, with supportive fit, durable materials, and practical design.',
  aboutDesignTitle: 'Smart Design',
  aboutDesignText: 'Our collections are selected for clean silhouettes, dependable construction, and strong visual appeal.',
  aboutValueTitle: 'Trusted Value',
  aboutValueText: 'We focus on accessible premium footwear that delivers quality, confidence, and long-term wear.',
  aboutApproachBadge: 'OUR APPROACH',
  aboutApproachTitle: 'Why customers choose BGY',
  aboutApproachText1: 'BGY is built as a professional retail business focused on premium, contemporary footwear.',
  aboutApproachText2: 'That means thoughtful selection, clear product information, responsive service, and a dependable shopping experience in Rwanda.',
  aboutCuratedQuality: 'Curated Quality',
  aboutRetailExcellence: 'Retail Excellence',
  aboutCtaTitle: 'Discover the BGY collection',
  aboutCtaButton: 'Shop Footwear',
  aboutImage: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop',
  aboutImageAlt: 'BGY footwear retail showroom',
  contactBadge: 'CLIENT SERVICES & SUPPORT',
  contactHeading: 'Connect with BGY',
  contactResponseTime: 'Average concierge response time:',
  contactResponseTimeValue: 'Under 2 hours',
  contactResponseTimeSuffix: 'during store support hours.',
  contactStoreHours: 'Store Hours',
  contactStoreHoursValue: 'Mon - Sat: 08:00 - 19:00 CAT',
  contactDeliveryLabel: 'Rwanda Delivery',
  contactDeliveryValue: 'Rubavu & Kigali: Wed & Sat',
  contactConciergeLabel: 'Direct Concierge',
  contactConciergeValue: '24/7 client specialist support',
  contactInquiryTitle: 'Send a Customer Inquiry',
  contactInquirySubtitle: 'For order support, sizing questions, or general retail inquiries.',
  contactSuccessMsg: 'Message transmitted to the BGY Client Concierge. We will reply shortly.',
  contactFullNameLabel: 'Full Name',
  contactFullNamePlaceholder: 'Enter your names..',
  contactEmailLabel: 'Email Address',
  contactEmailPlaceholder: 'bgy@gmail.com',
  contactSubjectLabel: 'Subject',
  contactSubjectPlaceholder: 'Inquiry on...',
  contactMessageLabel: 'Message',
  contactMessagePlaceholder: 'Details on your enquiry...',
  contactSubmitButton: 'Dispatch Message',
  contactSendingLabel: 'Sending...',
  contactChannelsTitle: 'Direct Channels',
  contactStorePointsTitle: 'Store & Service Points',
  contactStoreName: 'BGY Gisenyi Store',
  contactLocation: 'Rubavu, Rwanda',
  contactFaqBadge: 'Frequently Clarified',
  contactFaqTitle: 'Client Questions & Answers',
  contactFaq1Question: 'How does BGY footwear sizing compare to other brands?',
  contactFaq1Answer: 'BGY silhouettes use standard European sizing. Choose your usual Eur size from 35 to 45.',
  contactFaq2Question: 'When are deliveries made?',
  contactFaq2Answer: 'Rubavu and Kigali deliveries are made every Wednesday and Saturday for a small transport fee.',
  contactFaq3Question: 'What is the BGY 30-day trial return policy?',
  contactFaq3Answer: 'You have 30 days from receipt to try your BGY footwear indoors on clean surfaces.',
  contactFaq4Question: 'Are BGY shoes produced in limited batches?',
  contactFaq4Answer: 'Yes. Each silhouette is released in limited runs. Members receive priority access to the next allocation.',
};

interface SiteContentContextValue {
  content: SiteContent;
  loading: boolean;
  saveContent: (nextContent: SiteContent) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState(defaultSiteContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getSiteContent()
      .then(value => { if (mounted) setContent({ ...defaultSiteContent, ...value }); })
      .catch(() => undefined)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const saveContent = async (nextContent: SiteContent) => {
    const saved = await api.updateSiteContent(nextContent);
    setContent({ ...defaultSiteContent, ...saved });
  };

  return (
    <SiteContentContext.Provider value={{ content, loading, saveContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error('useSiteContent must be used within a SiteContentProvider');
  return context;
};
