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
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        // Extend colour behind the home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around" style={{ height: '64px', maxWidth: '28rem', margin: '0 auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center"
              style={{ width: '72px', height: '52px' }}
            >
              <div
                className={`relative z-10 flex flex-col items-center transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-text3'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] mt-[3px] font-semibold tracking-tight">{item.label}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-accent/10 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
