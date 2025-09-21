'use client';

import { motion } from 'framer-motion';
import { Star, Shield, Clock, Award } from 'lucide-react';
import WhatsAppButton from '../ui/WhatsAppButton';
import Button from '../ui/Button';

interface HeroSectionProps {
  variant?: 'home' | 'service' | 'minimal';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function HeroSection({
  variant = 'home',
  title = 'Profesionalno čišćenje za Vaš dom',
  subtitle = 'Pouzdana usluga čišćenja u Zagrebu s više od 10 godina iskustva',
  backgroundImage = '/images/hero-bg.jpg',
}: HeroSectionProps) {
  const badges = [
    { icon: Star, text: '4.9/5 ocjena', color: 'text-yellow-500' },
    { icon: Shield, text: 'Osigurano', color: 'text-blue-500' },
    { icon: Clock, text: 'Dostupno 7 dana', color: 'text-green-500' },
    { icon: Award, text: '500+ klijenata', color: 'text-purple-500' },
  ];

  if (variant === 'minimal') {
    return (
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          {/* Trust Badges for Mobile */}
          <div className="flex flex-wrap gap-3 mb-6 md:hidden">
            {badges.slice(0, 2).map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5"
                >
                  <Icon className={`w-4 h-4 ${badge.color}`} />
                  <span className="text-sm font-medium text-white">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8">
            {subtitle}
          </p>

          {/* Trust Badges for Desktop */}
          <div className="hidden md:flex flex-wrap gap-4 mb-8">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <Icon className={`w-5 h-5 ${badge.color}`} />
                  <span className="text-sm font-medium text-white">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <WhatsAppButton size="lg" variant="primary" className="shadow-xl" />
            <Button
              href="/rezervacija"
              variant="secondary"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Rezerviraj termin
            </Button>
          </motion.div>

          {/* Quick Info for Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white">10+</div>
              <div className="text-sm md:text-base text-gray-300">Godina iskustva</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-sm md:text-base text-gray-300">Zadovoljnih klijenata</div>
            </div>
            <div className="text-center md:text-left col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-white">24h</div>
              <div className="text-sm md:text-base text-gray-300">Brza rezervacija</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 1.5,
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}