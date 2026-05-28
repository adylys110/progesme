'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Activity, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dasbor' },
    { href: '/projects', icon: FolderKanban, label: 'Proyek' },
    { href: '/activities', icon: Activity, label: 'Aktivitas' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-around p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-12">
              <div className={`relative z-10 flex flex-col items-center transition-colors duration-300 ${isActive ? 'text-accent' : 'text-text3'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-accent/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
