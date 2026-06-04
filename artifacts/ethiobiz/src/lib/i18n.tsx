import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'AM' | 'ORM';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['EN']) => string;
}

const translations = {
  EN: {
    home: 'Home',
    businesses: 'Businesses',
    categories: 'Categories',
    search: 'Search',
    login: 'Login',
    admin: 'Admin',
    searchPlaceholder: 'Search for anything...',
    featuredCategories: 'Featured Categories',
    featuredBusinesses: 'Featured Businesses',
    recentBusinesses: 'Recently Added',
    verified: 'Verified Business',
    claimBusiness: 'Claim this Business',
    contact: 'Contact Info',
    services: 'Services',
    products: 'Products',
    gallery: 'Gallery',
    about: 'About',
    allCategories: 'All Categories',
    allCities: 'All Cities',
    viewAll: 'View All',
    noResults: 'No results found',
  },
  AM: {
    home: 'ዋና ገጽ',
    businesses: 'ድርጅቶች',
    categories: 'ምድቦች',
    search: 'ፈልግ',
    login: 'ግባ',
    admin: 'አስተዳዳሪ',
    searchPlaceholder: 'ማንኛውንም ነገር ይፈልጉ...',
    featuredCategories: 'ተለይተው የቀረቡ ምድቦች',
    featuredBusinesses: 'ተለይተው የቀረቡ ድርጅቶች',
    recentBusinesses: 'በቅርብ የተጨመሩ',
    verified: 'የተረጋገጠ ድርጅት',
    claimBusiness: 'ይህንን ድርጅት የእኔ ነው ይበሉ',
    contact: 'አድራሻ',
    services: 'አገልግሎቶች',
    products: 'ምርቶች',
    gallery: 'ፎቶዎች',
    about: 'ስለ',
    allCategories: 'ሁሉም ምድቦች',
    allCities: 'ሁሉም ከተሞች',
    viewAll: 'ሁሉንም እይ',
    noResults: 'ምንም ውጤት አልተገኘም',
  },
  ORM: {
    home: 'Fuula Duraa',
    businesses: 'Dhaabbilee',
    categories: 'Ramaddiiwwan',
    search: 'Barbaadi',
    login: 'Seeni',
    admin: 'Bulchaa',
    searchPlaceholder: 'Waan kamiyyuu barbaadi...',
    featuredCategories: 'Ramaddiiwwan Filataman',
    featuredBusinesses: 'Dhaabbilee Filataman',
    recentBusinesses: 'Dhiyeenya Kan Dabalame',
    verified: 'Dhaabbata Mirkanaa\'e',
    claimBusiness: 'Dhaabbata kana kiyya jedhi',
    contact: 'Odeeffannoo Quunnamtii',
    services: 'Tajaajilawwan',
    products: 'Oomishaalee',
    gallery: 'Suuraawwan',
    about: 'Waa\'ee',
    allCategories: 'Ramaddiiwwan Hunda',
    allCities: 'Magaalota Hunda',
    viewAll: 'Hunda Ilaali',
    noResults: 'Bu\'aan hin argamne',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: keyof typeof translations['EN']) => {
    return translations[language][key] || translations['EN'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function getLocalizedField<T extends Record<string, any>>(
  obj: T | undefined | null,
  field: string,
  language: Language
): string {
  if (!obj) return '';
  const langSuffix = language === 'EN' ? 'En' : language === 'AM' ? 'Am' : 'Orm';
  const val = obj[`${field}${langSuffix}`];
  if (val) return val;
  return obj[`${field}En`] || ''; // fallback to English
}
