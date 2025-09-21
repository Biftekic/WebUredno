'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import WhatsAppButton from '../ui/WhatsAppButton';

interface MobileLayoutProps {
  children: ReactNode;
  transparentHeader?: boolean;
  showMobileNav?: boolean;
  showWhatsAppFloat?: boolean;
}

export default function MobileLayout({
  children,
  transparentHeader = false,
  showMobileNav = true,
  showWhatsAppFloat = true,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={transparentHeader} />
      
      {/* Main Content with proper padding for fixed elements */}
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      
      <Footer />
      
      {/* Mobile Bottom Navigation */}
      {showMobileNav && <MobileNav />}
      
      {/* Floating WhatsApp Button */}
      {showWhatsAppFloat && (
        <WhatsAppButton variant="floating" />
      )}
    </div>
  );
}