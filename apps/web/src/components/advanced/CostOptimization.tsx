'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Button } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { Input } from '@k2w/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui';
import { Progress } from '@k2w/ui';
import { Alert, AlertDescription } from '@k2w/ui';
import { 
  RefreshCw, 
  Settings, 
  Zap, 
  PiggyBank, 
  AlertTriangle, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Clock
} from 'lucide-react';
import {
  useBudgetStatus,
  useConfigureBudget,
  useCostAnalytics,
  useOptimizePrompt,
  useCostRecommendations
} from '../../hooks/use-api';

function BudgetOverview() {
  const { data: budgetData, isLoading } = useBudgetStatus();
  const { mutate: configureBudget, isPending: configuring } = useConfigureBudget();
  
  const [budgetConfig, setBudgetConfig] = useState({
    monthly_limit: 1000,
    daily_limit: 50,
    alert_thresholds: [75, 90, 95],
    auto_stop_at_limit: false
  });

  const handleConfigureBudget = () => {
    configureBudget(budgetConfig);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!budgetData?.data) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Budget data not available
        </CardContent>
      </Card>
    );
  }

  const budget = budgetData.data as any;
  
  // Safe layout-adaptive properties (supports old & new backend shapes)
  const currentSpend = budget.current_spend ?? (budget.monthly?.spent ?? 0);
  const monthlyBudget = budget.monthly_budget ?? (budget.monthly?.budget ?? 1);
  const dailyAverage = budget.daily_average ?? (budget.daily?.spent ?? 0);
  const projectedMonthly = budget.projected_monthly ?? (budget.monthly?.spent ?? 0);
  const alerts = budget.alerts ?? [];

  const spendPercentage = (currentSpend / (monthlyBudget || 1)) * 100;
  const projectionPercentage = (projectedMonthly / (monthlyBudget || 1)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5" />
          Budget Management
        </CardTitle>
        <CardDescription>
          Monitor and control your monthly spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Budget Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Current Spend</div>
              <div className="text-2xl font-bold">${currentSpend.toFixed(2)}</div>
              <Progress value={spendPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {spendPercentage.toFixed(1)}% of ${monthlyBudget.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Daily Average</div>
              <div className="text-2xl font-bold">${dailyAverage.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Per day this month
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Projected Monthly</div>
              <div className={`text-2xl font-bold ${projectionPercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                ${projectedMonthly.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {projectionPercentage > 100 ? 'Over budget' : 'On track'}
              </div>
            </div>
          </div>

          {/* Budget Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Budget Alerts</h3>
              {alerts.map((alert: any, index: number) => (
                <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>

        {/* Budget Configuration */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Budget Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Limit ($)</label>
              <Input
                type="number"
                value={budgetConfig.monthly_limit}
                onChange={(e) => setBudgetConfig({ ...budgetConfig, monthly_limit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Limit ($)</label>
              <Input
                type="number"
                value={budgetConfig.daily_limit}
                onChange={(e) => setBudgetConfig({ ...budgetConfig, daily_limit: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Alert Thresholds (%)</label>
            <div className="flex gap-2">
              {budgetConfig.alert_thresholds.map((threshold, index) => (
                <Input
                  key={index}
                  type="number"
                  value={threshold}
                  onChange={(e) => {
                    const newThresholds = [...budgetConfig.alert_thresholds];
                    newThresholds[index] = parseFloat(e.target.value) || 0;
                    setBudgetConfig({ ...budgetConfig, alert_thresholds: newThresholds });
                  }}
                  className="w-20"
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={budgetConfig.auto_stop_at_limit}
                onChange={(e) => setBudgetConfig({ ...budgetConfig, auto_stop_at_limit: e.target.checked })}
              />
              Auto-stop at limit
            </label>
          </div>

          <Button 
            onClick={handleConfigureBudget} 
            disabled={configuring}
            className="mt-4"
          >
            {configuring ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
            Update Budget Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CostAnalytics() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data: analyticsData, isLoading } = useCostAnalytics({
    period,
    start_date: undefined,
    end_date: undefined
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData?.data) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Analytics data not available
        </CardContent>
      </Card>
    );
  }

  const analytics = analyticsData.data as any;

  // Safe fallback properties (supports old & new backend shapes)
  const totalCost = analytics.total_cost ?? (analytics.current_period?.total_cost_usd ?? 0);
  
  const costBreakdown: Record<string, number> = typeof analytics.cost_breakdown === 'object' && !Array.isArray(analytics.cost_breakdown)
    ? analytics.cost_breakdown
    : Array.isArray(analytics.cost_breakdown)
      ? (analytics.cost_breakdown as any[]).reduce((acc, curr) => ({ ...acc, [curr.category || '']: curr.cost || 0 }), {})
      : {};

  const optimizationOpportunities = analytics.optimization_opportunities ?? (analytics.recommendations?.map((r: any) => ({
    area: r.title,
    potential_savings: r.estimated_savings_usd || 0,
    effort_required: r.implementation_effort || 'low'
  })) ?? []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Cost Analytics
        </CardTitle>
        <CardDescription>
          Analyze your spending patterns and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Period:</label>
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Services Used</div>
              <div className="text-2xl font-bold">{Object.keys(costBreakdown).length}</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Optimization Opportunities</div>
              <div className="text-2xl font-bold">{optimizationOpportunities.length}</div>
            </div>
          </Card>
        </div>

        {/* Cost Breakdown */}
        <div>
          <h3 className="font-medium mb-3">Cost Breakdown by Service</h3>
          <div className="space-y-2">
            {Object.entries(costBreakdown).map(([service, cost]) => {
              const percentage = ((cost as number) / (totalCost || 1)) * 100;
              return (
                <div key={service} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{service}</span>
                    <span>${(cost as number).toFixed(2)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Opportunities */}
        {optimizationOpportunities.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Optimization Opportunities</h3>
            <div className="space-y-3">
              {optimizationOpportunities.map((opportunity: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{opportunity.area}</h4>
                      <p className="text-sm text-muted-foreground">
                        Potential savings: ${opportunity.potential_savings.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={opportunity.effort_required === 'low' ? 'default' : 'secondary'}>
                      {opportunity.effort_required} effort
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PromptOptimizer() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [targetReduction, setTargetReduction] = useState(20);
  const [preserveQuality, setPreserveQuality] = useState(true);
  
  const { mutate: optimizePrompt, data: optimizedData, isPending } = useOptimizePrompt();

  const handleOptimize = () => {
    if (!originalPrompt.trim()) return;
    
    optimizePrompt({
      original_prompt: originalPrompt,
      target_reduction: targetReduction,
      preserve_quality: preserveQuality
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Prompt Optimizer
        </CardTitle>
        <CardDescription>
          Reduce token usage while maintaining quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Prompt</label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              placeholder="Enter your prompt to optimize..."
              className="w-full h-32 p-3 border rounded-md resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Estimated tokens: ~{Math.ceil(originalPrompt.length / 4)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Reduction (%)</label>
              <Input
                type="number"
                min="5"
                max="80"
                value={targetReduction}
                onChange={(e) => setTargetReduction(parseInt(e.target.value) || 20)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Settings</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preserveQuality}
                  onChange={(e) => setPreserveQuality(e.target.checked)}
                />
                Preserve quality
              </label>
            </div>
          </div>

          <Button 
            onClick={handleOptimize}
            disabled={isPending || !originalPrompt.trim()}
            className="w-full"
          >
            {isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Optimize Prompt
          </Button>
        </div>

        {/* Results */}
        {optimizedData?.data && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">Optimization Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Token Reduction</div>
                  <div className="text-2xl font-bold text-green-600">
                    {optimizedData.data.token_reduction}%
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Estimated Savings</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${optimizedData.data.estimated_savings.toFixed(4)}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                  <div className={`text-2xl font-bold ${
                    optimizedData.data.quality_score >= 8 ? 'text-green-600' : 
                    optimizedData.data.quality_score >= 6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {optimizedData.data.quality_score}/10
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Optimized Prompt</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {optimizedData.data.optimized_prompt}
                </pre>
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated tokens: ~{Math.ceil(optimizedData.data.optimized_prompt.length / 4)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CostRecommendations() {
  const { data: recommendations, isLoading } = useCostRecommendations();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Safe schema-resilient array mapper
  const recList: any[] = Array.isArray(recommendations?.data)
    ? recommendations.data
    : (recommendations?.data as any)?.recommendations ?? [];

  if (recList.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          No recommendations available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Cost Optimization Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered suggestions to reduce costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recList.map((rec, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(rec.priority)}
                    <h3 className="font-medium">{rec.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="outline">{rec.type}</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Estimated Impact:</span> {rec.estimated_impact}
                  </div>
                  <div>
                    <span className="font-medium">Implementation Effort:</span> {rec.implementation_effort}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CostOptimization() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cost Optimization</h1>
        <p className="text-muted-foreground">
          Monitor spending, optimize costs, and maximize ROI
        </p>
      </div>

      {/* Budget Overview */}
      <BudgetOverview />

      {/* Cost Analytics */}
      <CostAnalytics />

      {/* Optimization Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromptOptimizer />
        <CostRecommendations />
      </div>
    </div>
  );
}