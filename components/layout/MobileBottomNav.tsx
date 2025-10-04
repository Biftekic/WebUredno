'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Briefcase,
  Calendar,
  Euro,
  Phone,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  special?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Početna',
    icon: Home
  },
  {
    href: '/services',
    label: 'Usluge',
    icon: Briefcase
  },
  {
    href: '/booking',
    label: 'Rezerviraj',
    icon: Calendar,
    special: true
  },
  {
    href: '/cjenik',
    label: 'Cjenik',
    icon: Euro
  },
  {
    href: '/contact',
    label: 'Kontakt',
    icon: Phone
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg safe-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
                          (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full px-1",
                  "transition-colors duration-200 active:bg-gray-50 rounded-lg",
                  item.special && !isActive && "text-green-600",
                  isActive && !item.special && "text-green-600",
                  isActive && item.special && "text-white",
                  !isActive && !item.special && "text-gray-600"
                )}
              >
                {/* Special background for booking button */}
                {item.special && (
                  <motion.div
                    className={cn(
                      "absolute inset-2 rounded-lg -z-10",
                      isActive ? "bg-green-700" : "bg-green-50"
                    )}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Active indicator */}
                {isActive && !item.special && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-green-600"
                    layoutId="activeIndicator"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}

                <Icon className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}