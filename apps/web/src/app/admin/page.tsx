'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'costs' | 'apis' | 'monitoring'>('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          K2W Admin Panel
        </h1>
        <p className="text-gray-600">
          System monitoring, user management, and configuration
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'System Overview' },
          { id: 'users', label: 'User Management' },
          { id: 'costs', label: 'Cost Tracking' },
          { id: 'apis', label: 'API Configuration' },
          { id: 'monitoring', label: 'Monitoring' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'costs' | 'apis' | 'monitoring')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Active Jobs</h3>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Monthly Cost</h3>
                <p className="text-2xl font-bold text-gray-900">$2,456</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">Manage user accounts and quotas.</p>
          </div>
        )}

        {activeTab === 'costs' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Cost Tracking</h2>
            <p className="text-gray-600">Monitor API costs and usage.</p>
          </div>
        )}

        {activeTab === 'apis' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-gray-600">Configure API keys and settings.</p>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">System Monitoring</h2>
            <p className="text-gray-600">View system health and performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}