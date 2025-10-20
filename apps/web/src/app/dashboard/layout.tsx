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
    <div className="min-h-screen bg-gray-50">
      {showSidebar && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">K2W Dashboard</h2>
              <Link
                href="/dashboard"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
        'transition-all duration-200',
        showSidebar ? 'ml-64' : ''
      )}>
        {children}
      </div>
    </div>
  );
}