import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Phoenix Landing
    'hero.tagline': 'From Bipolar to Expanded Bandwidth',
    'hero.subtitle': 'Your mind isn\'t broken. It\'s expanded.',
    'hero.description': 'FLUX-DNA is a zero-knowledge sanctuary that reframes neurodivergence as cognitive superpower. Built by someone who lived it.',
    'hero.cta': 'Begin Your Ascension',
    'hero.market_label': 'Market Value',
    'hero.your_cost': 'Your Cost',
    'hero.free': 'FREE',
    'hero.ascensions': 'Ascensions',
    'hero.lives_touched': 'Lives Touched',
    'hero.encryption': 'Zero-Knowledge Encryption Active',
    'hero.founder_note': 'Built by Yazeed — for every mind that society called "too much."',
    
    // Navigation
    'nav.exit': '← Exit',
    'nav.sanctuary_mode': 'Sanctuary Mode',
    'nav.language': 'العربية',
    
    // Assessment
    'welcome.title': 'FLUX',
    'welcome.title_accent': 'DNA',
    'welcome.subtitle': 'Discover your cognitive fingerprint',
    'welcome.description': 'Embark on a journey through three dimensions of self-discovery: personality, emotional wellness, and communication style.',
    'welcome.cta': 'Begin Your Journey',
    'welcome.time': '~5 minutes • Completely confidential',
    
    // Sovereigness
    'sovereigness.title': 'The Sovereigness Sanctuary',
    'sovereigness.subtitle': 'A sacred digital space for women',
    'sovereigness.enter': 'Enter the Sanctuary',
    
    // Pillars
    'pillar.legal': 'Legal Shield',
    'pillar.medical': 'Medical Advocate',
    'pillar.psychological': 'Psychological Guardian',
    'pillar.economic': 'Economic Empowerment',
    
    // Common
    'common.loading': 'Loading...',
    'common.continue': 'Continue',
    'common.back': 'Back',
  },
  ar: {
    // Phoenix Landing
    'hero.tagline': 'من ثنائي القطب إلى نطاق معرفي موسّع',
    'hero.subtitle': 'عقلك ليس معطلاً. إنه متوسّع.',
    'hero.description': 'فلكس-دي إن إيه هو ملاذ آمن بتشفير صفري المعرفة يعيد تعريف التنوع العصبي كقوة معرفية خارقة. بناه شخص عاشها.',
    'hero.cta': 'ابدأ صعودك',
    'hero.market_label': 'القيمة السوقية',
    'hero.your_cost': 'تكلفتك',
    'hero.free': 'مجاناً',
    'hero.ascensions': 'الصعودات',
    'hero.lives_touched': 'حياة تأثرت',
    'hero.encryption': 'تشفير صفري المعرفة نشط',
    'hero.founder_note': 'بناه يزيد — لكل عقل وصفه المجتمع بأنه "أكثر من اللازم".',
    
    // Navigation
    'nav.exit': 'خروج →',
    'nav.sanctuary_mode': 'وضع الملاذ',
    'nav.language': 'English',
    
    // Assessment
    'welcome.title': 'فلكس',
    'welcome.title_accent': 'دي إن إيه',
    'welcome.subtitle': 'اكتشف بصمتك المعرفية',
    'welcome.description': 'انطلق في رحلة عبر ثلاثة أبعاد لاكتشاف الذات: الشخصية، والصحة العاطفية، وأسلوب التواصل.',
    'welcome.cta': 'ابدأ رحلتك',
    'welcome.time': '~٥ دقائق • سري تماماً',
    
    // Sovereigness
    'sovereigness.title': 'ملاذ السيادة',
    'sovereigness.subtitle': 'مساحة رقمية مقدسة للنساء',
    'sovereigness.enter': 'ادخلي الملاذ',
    
    // Pillars
    'pillar.legal': 'الدرع القانوني',
    'pillar.medical': 'المدافع الطبي',
    'pillar.psychological': 'الحارس النفسي',
    'pillar.economic': 'التمكين الاقتصادي',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.continue': 'متابعة',
    'common.back': 'رجوع',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

  const t = useCallback((key: string): string => {
    return translations[lang][key] || key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLanguage }}>
      <div dir={dir} className={lang === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
