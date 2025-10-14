'use client';

import { useState } from 'react';

// Import components
import { 
  PageHeader,
  DomainOverview,
  DeploymentsList,
  PerformanceAnalytics 
} from '../../components';

export default function MultiSitePage() {
  const [activeTab, setActiveTab] = useState('domains');

  const tabs = ['domains', 'deployments', 'analytics'];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Multi-Site Management"
        description="Manage your domains and deployments"
      />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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