'use client';

import { useState } from 'react';

// Import components
import { 
  PageHeader,
  DomainOverview,
  DeploymentsList,
  PerformanceAnalytics 
} from '../../../components';

export default function MultiSitePage() {
  const [activeTab, setActiveTab] = useState('domains');

  const tabs = ['domains', 'deployments', 'analytics'];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Multi-Site Management"
        description="Manage your domain portfolio and site deployments"
      />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-border/80">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-semibold text-sm capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'domains' && <DomainOverview />}
        {activeTab === 'deployments' && <DeploymentsList />}
        {activeTab === 'analytics' && <PerformanceAnalytics />}
      </div>
    </div>
  );
}
