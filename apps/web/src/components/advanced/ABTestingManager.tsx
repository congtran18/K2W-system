'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Button } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { Input } from '@k2w/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui';
import { Progress } from '@k2w/ui';
import { 
  TestTube, 
  Play, 
  Pause, 
  BarChart3, 
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  RefreshCw,
  Plus,
  Settings,
  Check,
  X,
  Clock,
  Zap
} from 'lucide-react';
import {
  useCreateABTest,
  useStartABTest,
  useStopABTest,
  useABTestStatus,
  useABTestResults,
  useGenerateVariants
} from '../../hooks/use-api';
import type {
  ABTestData,
  ABTestFormData,
  ABTestResults,
  GeneratedVariant
} from '@/types/ab-testing';

function CreateTestPanel() {
  const [formData, setFormData] = useState<ABTestFormData>({
    name: '',
    content_ids: [],
    test_type: 'content',
    traffic_split: [50, 50],
    duration_days: 14,
    success_metrics: ['conversions']
  });
  const [contentIds, setContentIds] = useState('');

  const { mutate: createTest, isPending: creating } = useCreateABTest();
  const { mutate: generateVariants, data: variantsData, isPending: generating } = useGenerateVariants();

  const handleCreateTest = () => {
    const content_id_list = contentIds.split(',').map(id => id.trim()).filter(id => id);
    if (content_id_list.length === 0) return;

    createTest({
      ...formData,
      content_ids: content_id_list
    });
  };

  const handleGenerateVariants = () => {
    const baseContentId = contentIds.split(',')[0]?.trim();
    if (!baseContentId) return;

    generateVariants({
      base_content_id: baseContentId,
      variant_count: 3,
      variation_type: 'all',
      creativity_level: 'moderate'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create A/B Test
        </CardTitle>
        <CardDescription>
          Set up a new A/B test to optimize your content performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Name</label>
            <Input
              placeholder="Homepage CTA Test"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Type</label>
            <Select value={formData.test_type} onValueChange={(value) => setFormData({ ...formData, test_type: value as typeof formData.test_type })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content Variation</SelectItem>
                <SelectItem value="seo">SEO Elements</SelectItem>
                <SelectItem value="layout">Layout Design</SelectItem>
                <SelectItem value="cta">Call-to-Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content IDs */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content IDs (comma-separated)</label>
          <div className="flex gap-2">
            <Input
              placeholder="content_123, content_456"
              value={contentIds}
              onChange={(e) => setContentIds(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={handleGenerateVariants}
              disabled={generating || !contentIds.trim()}
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Variants
            </Button>
          </div>
        </div>

        {/* Generated Variants */}
        {variantsData?.data && (
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Generated Variants</h4>
            <div className="space-y-2">
              {variantsData.data.variants.map((variant: GeneratedVariant, index: number) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">Variant {index + 1}: {variant.id}</div>
                  <div className="text-muted-foreground">
                    Changes: {Object.keys(variant.changes).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (days)</label>
            <Input
              type="number"
              min="1"
              max="90"
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 14 })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Traffic Split (%)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="10"
                max="90"
                value={formData.traffic_split[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 50;
                  setFormData({ ...formData, traffic_split: [val, 100 - val] });
                }}
              />
              <span className="flex items-center">:</span>
              <Input
                type="number"
                min="10"
                max="90"
                value={formData.traffic_split[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 50;
                  setFormData({ ...formData, traffic_split: [100 - val, val] });
                }}
              />
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Success Metrics</label>
          <div className="flex flex-wrap gap-2">
            {['conversions', 'click_through_rate', 'engagement_rate', 'bounce_rate', 'time_on_page'].map((metric) => (
              <label key={metric} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.success_metrics.includes(metric)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, success_metrics: [...formData.success_metrics, metric] });
                    } else {
                      setFormData({ ...formData, success_metrics: formData.success_metrics.filter(m => m !== metric) });
                    }
                  }}
                />
                {metric.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleCreateTest} 
          disabled={creating || !formData.name || !contentIds.trim()}
          className="w-full"
        >
          {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
          Create A/B Test
        </Button>
      </CardContent>
    </Card>
  );
}

function TestDetails({ testId }: { testId: string }) {
  const { data: testStatus, isLoading: statusLoading } = useABTestStatus(testId);
  const { data: testResults } = useABTestResults(testId);
  const { mutate: startTest, isPending: starting } = useStartABTest();
  const { mutate: stopTest, isPending: stopping } = useStopABTest();

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!testStatus?.data) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Test not found
        </CardContent>
      </Card>
    );
  }

  const test = testStatus.data as ABTestData;
  const results = testResults?.data as ABTestResults | undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'stopped': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'completed': return <Check className="w-4 h-4" />;
      case 'stopped': return <X className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              {test.name}
            </CardTitle>
            <CardDescription>Test ID: {test.id}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(test.status)}>
              {getStatusIcon(test.status)}
              {test.status}
            </Badge>
            {test.status === 'draft' && (
              <Button 
                onClick={() => startTest(testId)} 
                disabled={starting}
                size="sm"
              >
                {starting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Test
              </Button>
            )}
            {test.status === 'running' && (
              <Button 
                variant="destructive"
                onClick={() => stopTest(testId)} 
                disabled={stopping}
                size="sm"
              >
                {stopping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                Stop Test
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        {test.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{test.progress}%</span>
            </div>
            <Progress value={test.progress} className="h-2" />
          </div>
        )}

        {/* Variants Performance */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Variant Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {test.variants.map((variant) => (
              <Card key={variant.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{variant.name}</h4>
                    <Badge variant="outline">{variant.traffic_percentage}%</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Visitors
                      </span>
                      <span className="font-medium">{variant.visitors.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Conversions
                      </span>
                      <span className="font-medium">{variant.conversions.toLocaleString()}</span>
                    </div>
                    
                    {variant.visitors > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Conv. Rate
                        </span>
                        <span className="font-medium">
                          {((variant.conversions / variant.visitors) * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Test Results */}
        {results && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Statistical Results</h3>
            
            {/* Statistical Significance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Statistical Significance</div>
                  <div className="text-2xl font-bold">
                    {(results.statistical_significance * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs">
                    {results.statistical_significance >= 0.95 ? (
                      <Badge className="bg-green-100 text-green-800">Significant</Badge>
                    ) : (
                      <Badge variant="secondary">Not Significant</Badge>
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Winner</div>
                  <div className="text-2xl font-bold">
                    {results.winner ? (
                      <div className="flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-500" />
                        {results.winner}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No clear winner</span>
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Best Improvement</div>
                  <div className="text-2xl font-bold">
                    {Object.values(results.results).reduce((max, result) => 
                      Math.max(max, result.improvement || 0), 0
                    ).toFixed(1)}%
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Variant</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Conversions</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Conversion Rate</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Confidence Interval</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.results).map(([variantId, result]) => (
                    <tr key={variantId} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        {variantId}
                        {results.winner === variantId && (
                          <Award className="w-4 h-4 text-yellow-500 inline ml-2" />
                        )}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {result.conversions}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {(result.conversion_rate * 100).toFixed(2)}%
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        [{(result.confidence_interval[0] * 100).toFixed(1)}%, {(result.confidence_interval[1] * 100).toFixed(1)}%]
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <div className={`flex items-center justify-center gap-1 ${
                          result.improvement > 0 ? 'text-green-600' : 
                          result.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {result.improvement > 0 && <TrendingUp className="w-4 h-4" />}
                          {result.improvement < 0 && <TrendingDown className="w-4 h-4" />}
                          {result.improvement.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ABTestingManager() {
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [mockTestId] = useState('test_123'); // For demo purposes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">A/B Testing Manager</h1>
        <p className="text-muted-foreground">
          Create, manage, and analyze A/B tests to optimize your content performance
        </p>
      </div>

      {/* Create Test */}
      <CreateTestPanel />

      {/* Test Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Active Tests</h2>
          <Input
            placeholder="Enter test ID to view details"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="max-w-md"
          />
          <Button 
            variant="outline"
            onClick={() => setSelectedTestId(mockTestId)}
          >
            Load Demo Test
          </Button>
        </div>

        {selectedTestId && (
          <TestDetails testId={selectedTestId} />
        )}
      </div>
    </div>
  );
}