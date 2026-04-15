'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Eye, 
  Search, 
  TestTube, 
  DollarSign, 
  Image, 
  Globe,
  ArrowLeft 
} from 'lucide-react';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: 'Advanced Dashboard',
    href: '/dashboard/advanced',
    icon: Eye
  },
  {
    name: 'SEO Tools',
    href: '/dashboard/seo-tools',
    icon: Search
  },
  {
    name: 'A/B Testing',
    href: '/dashboard/ab-testing',
    icon: TestTube
  },
  {
    name: 'Cost Optimization',
    href: '/dashboard/cost-optimization',
    icon: DollarSign
  },
  {
    name: 'Content Tools',
    href: '/dashboard/content-tools',
    icon: Image
  },
  {
    name: 'Multi-Site',
    href: '/multi-site',
    icon: Globe
  }
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const showSidebar = pathname !== '/dashboard';

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Decorative radial ambient orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-[140px] pointer-events-none" />
      
      {showSidebar && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card/90 backdrop-blur-md border-r border-border/80">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/80">
              <h2 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
                K2W Dashboard
              </h2>
              <Link
                href="/dashboard"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
 
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200',
                      active
                        ? 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5'
                        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/40'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
 
      {/* Main Content */}
      <div className={cn(
        'transition-all duration-200 relative z-10',
        showSidebar ? 'ml-64' : ''
      )}>
        {children}
      </div>
    </div>
  );
}