'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, Settings, DollarSign, FileCheck, Sun, Moon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const isDashboardSubpage = pathname !== '/dashboard' && (pathname?.startsWith('/dashboard') ?? false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard', label: 'Dashboard', icon: Settings },
    { href: '/dashboard/approval', label: 'Approval', icon: FileCheck },
    { href: '/dashboard/cost-optimization', label: 'Cost', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 mb-8 pt-14 md:pt-10">
      {/* Global Navigation Bar - FIXED at top of screen */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/40 py-3.5 px-6 shadow-sm transition-all duration-200 ${
        isDashboardSubpage ? 'lg:left-64' : ''
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2 rounded-xl text-white glow-indigo shadow-md shadow-violet-500/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400">
              K2W COPYWRITER
            </span>
            <span className="text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              AI Active
            </span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Check active state
              const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/25 shadow-sm shadow-violet-500/5'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={toggleTheme}
              className="ml-2.5 p-2 rounded-xl border border-border/60 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-violet-500" />}
            </button>
          </nav>
        </div>
      </div>

      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-indigo-700 to-cyan-700 dark:from-violet-400 dark:via-indigo-400 dark:to-cyan-400 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}