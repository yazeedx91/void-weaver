"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, MessageCircle, ArrowRight, Sparkles, Brain, Waves } from 'lucide-react';
import './LandingPage.css';

export default function LandingClient({ locale }: { locale: string }) {
  const t = useTranslations('landing');
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          {/* Floating Icons */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="floating-icon">
              <Brain className="w-12 h-12 text-purple-400" />
            </div>
            <div className="floating-icon delay-300">
              <Waves className="w-12 h-12 text-blue-400" />
            </div>
            <div className="floating-icon delay-600">
              <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
            {isArabic ? t('hero.arabicHeadline') : t('hero.headline')}
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            {isArabic ? t('hero.arabicSubheadline') : t('hero.subheadline')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              {isArabic ? 'ابدأ رحلتك' : 'Begin Your Journey'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-12 py-6 text-lg font-semibold rounded-full transition-all duration-300"
            >
              {isArabic ? 'استكشف النظام' : 'Explore the System'}
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* The Source Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              {isArabic ? t('source.arabicTitle') : t('source.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {isArabic ? t('source.arabicDescription') : t('source.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-300">
                  {isArabic ? t('source.feature1Arabic') : t('source.feature1')}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {isArabic ? t('source.feature1ArabicDesc') : t('source.feature1Desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-blue-300">
                  {isArabic ? t('source.feature2Arabic') : t('source.feature2')}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {isArabic ? t('source.feature2ArabicDesc') : t('source.feature2Desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 relative bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
            {isArabic ? t('contact.arabicTitle') : t('contact.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {isArabic ? t('contact.arabicDescription') : t('contact.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black px-10 py-5 text-lg font-semibold rounded-full transition-all duration-300"
              asChild
            >
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer noopener">
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </a>
            </Button>

            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-5 text-lg font-semibold rounded-full transition-all duration-300"
              asChild
            >
              <a href="mailto:yazeedx91@gmail.com">
                <MessageCircle className="w-5 h-5 mr-2" />
                {isArabic ? 'تواصل الآن' : 'Contact Now'}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
