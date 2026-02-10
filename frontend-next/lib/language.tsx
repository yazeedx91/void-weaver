"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  t: (key: string) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Phoenix Landing
    'hero.tagline': 'From Bipolar to Expanded Bandwidth',
    'hero.subtitle': "Your mind isn't broken. It's expanded.",
    'hero.description': 'FLUX-DNA is a zero-knowledge sanctuary that reframes neurodivergence as cognitive superpower. Built by someone who lived it.',
    'hero.cta': 'Begin Your Ascension',
    'hero.market_label': 'Market Value',
    'hero.your_cost': 'Your Cost',
    'hero.free': 'FREE',
    'hero.ascensions': 'Ascensions',
    'hero.lives_touched': 'Lives Touched',
    'hero.encryption': 'Zero-Knowledge Encryption Active',
    'hero.founder_note': 'Built by Yazeed — for every mind that society called "too much."',
    'hero.sanctuary': 'Enter The Sovereigness Sanctuary',
    
    // Navigation
    'nav.exit': '← Exit',
    'nav.sanctuary_mode': 'Sanctuary Mode',
    'nav.language': 'العربية',
    'nav.quick_exit': 'Quick Exit',
    
    // Assessment
    'assessment.title': "Al-Hakim's Chamber",
    'assessment.subtitle': 'Choose your language to begin',
    'assessment.encryption': 'Zero-Knowledge Encryption Active',
    'assessment.meet_english': 'Meet Al-Hakim',
    'assessment.meet_arabic': 'قابل الحكيم',
    'assessment.share_thoughts': 'Share your thoughts...',
    'assessment.complete': 'Ready to see your results? Click here to complete',
    'assessment.reveal': 'Reveal Your Mind Map',
    
    // Sovereigness
    'sanctuary.title': 'The Sovereigness Sanctuary',
    'sanctuary.title_ar': 'ملاذ السيادة',
    'sanctuary.subtitle': 'A sacred digital space for women. Al-Sheikha walks with you through four pillars of liberation.',
    'sanctuary.choose_path': 'Choose Your Path to Liberation',
    'sanctuary.connecting': 'Connecting to Al-Sheikha...',
    'sanctuary.share': "Share what's on your mind...",
    'sanctuary.document': 'Document Evidence',
    
    // Pillars
    'pillar.legal': 'The Legal Shield',
    'pillar.legal_ar': 'الدرع القانوني',
    'pillar.legal_desc': 'Understand your rights. Document coercive control.',
    'pillar.medical': 'The Medical Sentinel',
    'pillar.medical_ar': 'الحارس الطبي',
    'pillar.medical_desc': 'Document invisible injuries. Forensic guidance.',
    'pillar.psych': 'The Psych-Repair Crew',
    'pillar.psych_ar': 'فريق الإصلاح النفسي',
    'pillar.psych_desc': 'Understand trauma bonding. EMDR techniques.',
    'pillar.economic': 'The Economic Liberator',
    'pillar.economic_ar': 'المحرر الاقتصادي',
    'pillar.economic_desc': 'Build financial independence. Escape Fund strategies.',
    
    // Results
    'results.time_gate': 'Time-Gate Active',
    'results.remaining': 'Remaining',
    'results.clicks': 'clicks',
    'results.closed': 'Time-Gate Closed',
    'results.expired': 'This link has expired or reached its maximum access limit.',
    'results.self_destruct': 'Results links self-destruct after 24 hours or 3 accesses for your privacy and security.',
    'results.return': 'Return to FLUX-DNA',
    'results.recognized': 'By the fire of the Phoenix, you are recognized',
    'results.stability': 'Stability Classification',
    'results.superpower': 'Your Sovereign Superpower',
    'results.value': 'Total Assessment Value',
    'results.your_cost': 'Your Cost',
    'results.gift': 'A gift to the Saudi people from Yazeed Shaheen',
    'results.download': 'Download Sovereign Certificate',
    
    // Common
    'common.loading': 'Loading...',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.send': 'Send',
    'common.validating': 'Validating...',
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
    'hero.sanctuary': 'ادخلي ملاذ السيادة',
    
    // Navigation
    'nav.exit': 'خروج →',
    'nav.sanctuary_mode': 'وضع الملاذ',
    'nav.language': 'English',
    'nav.quick_exit': 'خروج سريع',
    
    // Assessment
    'assessment.title': 'غرفة الحكيم',
    'assessment.subtitle': 'اختر لغتك للبدء',
    'assessment.encryption': 'تشفير صفري المعرفة نشط',
    'assessment.meet_english': 'Meet Al-Hakim',
    'assessment.meet_arabic': 'قابل الحكيم',
    'assessment.share_thoughts': 'شارك أفكارك...',
    'assessment.complete': 'مستعد لرؤية نتائجك؟ انقر هنا للإكمال',
    'assessment.reveal': 'اكشف خريطة عقلك',
    
    // Sovereigness
    'sanctuary.title': 'ملاذ السيادة',
    'sanctuary.title_ar': 'ملاذ السيادة',
    'sanctuary.subtitle': 'مساحة رقمية مقدسة للنساء. الشيخة تمشي معك عبر أربعة أركان التحرر.',
    'sanctuary.choose_path': 'اختاري طريقك نحو التحرر',
    'sanctuary.connecting': 'جاري الاتصال بالشيخة...',
    'sanctuary.share': 'شاركي ما يدور في ذهنك...',
    'sanctuary.document': 'توثيق الأدلة',
    
    // Pillars
    'pillar.legal': 'الدرع القانوني',
    'pillar.legal_ar': 'الدرع القانوني',
    'pillar.legal_desc': 'افهمي حقوقك. وثّقي السيطرة القسرية.',
    'pillar.medical': 'الحارس الطبي',
    'pillar.medical_ar': 'الحارس الطبي',
    'pillar.medical_desc': 'وثّقي الإصابات غير المرئية. إرشادات الطب الشرعي.',
    'pillar.psych': 'فريق الإصلاح النفسي',
    'pillar.psych_ar': 'فريق الإصلاح النفسي',
    'pillar.psych_desc': 'افهمي رابطة الصدمة. تقنيات EMDR.',
    'pillar.economic': 'المحرر الاقتصادي',
    'pillar.economic_ar': 'المحرر الاقتصادي',
    'pillar.economic_desc': 'ابني الاستقلال المالي. استراتيجيات صندوق الهروب.',
    
    // Results
    'results.time_gate': 'بوابة الوقت نشطة',
    'results.remaining': 'المتبقي',
    'results.clicks': 'نقرات',
    'results.closed': 'بوابة الوقت مغلقة',
    'results.expired': 'انتهت صلاحية هذا الرابط أو وصل إلى الحد الأقصى للوصول.',
    'results.self_destruct': 'روابط النتائج تدمر ذاتياً بعد 24 ساعة أو 3 وصولات لخصوصيتك وأمانك.',
    'results.return': 'العودة إلى فلكس-دي إن إيه',
    'results.recognized': 'بنار العنقاء، أنت معترف بك',
    'results.stability': 'تصنيف الاستقرار',
    'results.superpower': 'قوتك الخارقة السيادية',
    'results.value': 'إجمالي قيمة التقييم',
    'results.your_cost': 'تكلفتك',
    'results.gift': 'هدية للشعب السعودي من يزيد شاهين',
    'results.download': 'تحميل شهادة السيادة',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.continue': 'متابعة',
    'common.back': 'رجوع',
    'common.send': 'إرسال',
    'common.validating': 'جاري التحقق...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [lang, dir]);

  const t = useCallback((key: string): string => {
    return translations[lang][key] || key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLangState(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values if used outside provider
    return {
      lang: 'en' as Language,
      dir: 'ltr' as Direction,
      t: (key: string) => key,
      toggleLanguage: () => {},
      setLanguage: () => {},
    };
  }
  return context;
}
