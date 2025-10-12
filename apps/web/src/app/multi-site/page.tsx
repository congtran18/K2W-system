'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Button } from '@k2w/ui/button';
import { Badge } from '@k2w/ui/badge';

export default function MultiSitePage() {
  const [activeTab, setActiveTab] = useState('domains');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Multi-Site Management</h1>
        <p className="text-gray-600 mt-2">Manage your domains and deployments</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['domains', 'deployments', 'analytics'].map((tab) => (
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

      {/* Domains Tab */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Overview</CardTitle>
              <CardDescription>Manage your domain portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-blue-600">12</h3>
                  <p className="text-sm text-gray-600">Active Domains</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-green-600">8</h3>
                  <p className="text-sm text-gray-600">Live Sites</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-orange-600">4</h3>
                  <p className="text-sm text-gray-600">In Development</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Sample domain entries */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">example1.com</h4>
                    <p className="text-sm text-gray-600">Container Office Rental - Melbourne</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">example2.com</h4>
                    <p className="text-sm text-gray-600">Modular Homes - Sydney</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Development</Badge>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === 'deployments' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>Track your site deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">example1.com</h4>
                    <p className="text-sm text-gray-600">Deployed 2 hours ago</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">example2.com</h4>
                    <p className="text-sm text-gray-600">Deploying now...</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Monitor your site performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-3xl font-bold text-blue-600">24,567</h3>
                  <p className="text-sm text-gray-600">Total Visitors</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-3xl font-bold text-green-600">67%</h3>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}