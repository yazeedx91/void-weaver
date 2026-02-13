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
    'hero.label': 'PSYCHOMETRIC INTELLIGENCE',
    'hero.tagline': 'DYNAMIC RANGE OVER STATIC STABILITY.',
    'hero.subtitle': '',
    'hero.description': 'Three clinical-grade instruments. One unified analysis. Map your personality, emotional intelligence, and mental health through the lens of dynamic range — not pathological labels.',
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
    
    // Auth
    'auth.login_title': 'Welcome Back',
    'auth.login_subtitle': 'Sign in to continue your journey',
    'auth.signup_title': 'Create Your Sanctuary',
    'auth.signup_subtitle': 'Begin your path to self-discovery',
    'auth.email': 'Email',
    'auth.email_placeholder': 'you@example.com',
    'auth.password': 'Password',
    'auth.display_name': 'Display Name',
    'auth.name_placeholder': 'Your name',
    'auth.login_cta': 'Sign In',
    'auth.signup_cta': 'Create Account',
    'auth.have_account': 'Already have an account?',
    'auth.no_account': 'Don\'t have an account?',
    'auth.signout': 'Sign Out',
    'auth.signout_confirm_title': 'Sign out?',
    'auth.signout_confirm_desc': 'Are you sure you want to sign out?',
    'auth.cancel': 'Cancel',

    // Profile
    'profile.title': 'Your Profile',
    'profile.subtitle': 'Manage your identity',
    'profile.display_name': 'Display Name',
    'profile.avatar_url': 'Avatar URL',
    'profile.save': 'Save Changes',
    'profile.saved': 'Profile updated!',
    'profile.error': 'Error saving profile',

    // Common
    'common.loading': 'Loading...',
    'common.continue': 'Continue',
    'common.back': 'Back',
  },
  ar: {
    // Phoenix Landing
    'hero.label': 'الذكاء السيكومتري',
    'hero.tagline': 'النطاق الديناميكي فوق الاستقرار الساكن.',
    'hero.subtitle': '',
    'hero.description': 'ثلاث أدوات تقييم سريرية. تحليل موحّد. ارسم خريطة شخصيتك وذكائك العاطفي وصحتك النفسية من منظور النطاق الديناميكي — لا التصنيفات المرضية.',
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
    
    // Auth
    'auth.login_title': 'مرحباً بعودتك',
    'auth.login_subtitle': 'سجّل دخولك لمتابعة رحلتك',
    'auth.signup_title': 'أنشئ ملاذك',
    'auth.signup_subtitle': 'ابدأ رحلتك نحو اكتشاف الذات',
    'auth.email': 'البريد الإلكتروني',
    'auth.email_placeholder': 'you@example.com',
    'auth.password': 'كلمة المرور',
    'auth.display_name': 'الاسم',
    'auth.name_placeholder': 'اسمك',
    'auth.login_cta': 'تسجيل الدخول',
    'auth.signup_cta': 'إنشاء حساب',
    'auth.have_account': 'لديك حساب بالفعل؟',
    'auth.no_account': 'ليس لديك حساب؟',
    'auth.signout': 'تسجيل الخروج',
    'auth.signout_confirm_title': 'تسجيل الخروج؟',
    'auth.signout_confirm_desc': 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    'auth.cancel': 'إلغاء',

    // Profile
    'profile.title': 'ملفك الشخصي',
    'profile.subtitle': 'أدر هويتك',
    'profile.display_name': 'الاسم المعروض',
    'profile.avatar_url': 'رابط الصورة',
    'profile.save': 'حفظ التغييرات',
    'profile.saved': 'تم تحديث الملف الشخصي!',
    'profile.error': 'خطأ في حفظ الملف',

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

const defaultLanguageContext: LanguageContextType = {
  lang: 'en',
  dir: 'ltr',
  t: (key: string) => translations.en[key] || key,
  toggleLanguage: () => {},
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context ?? defaultLanguageContext;
}
