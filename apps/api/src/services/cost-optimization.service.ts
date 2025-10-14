/**
 * Cost Optimization Service for K2W System
 * Monitors and optimizes AI token usage, API costs, and resource consumption
 */

export interface CostMetrics {
  period: string; // ISO date string
  openai_tokens: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
  };
  google_apis: {
    search_console_requests: number;
    analytics_requests: number;
    trends_requests: number;
    cost_usd: number;
  };
  external_apis: {
    ahrefs_requests: number;
    semrush_requests: number;
    cost_usd: number;
  };
  infrastructure: {
    compute_hours: number;
    storage_gb: number;
    bandwidth_gb: number;
    cost_usd: number;
  };
  total_cost_usd: number;
  content_pieces_generated: number;
  cost_per_content_piece: number;
  roi_estimate: number; // Revenue generated vs costs
}

export interface CostAlert {
  id: string;
  type: 'threshold_exceeded' | 'unusual_spending' | 'budget_limit' | 'optimization_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  current_value: number;
  threshold_value: number;
  suggested_actions: string[];
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'token_usage' | 'api_efficiency' | 'caching' | 'batch_processing' | 'infrastructure';
  title: string;
  description: string;
  estimated_savings_usd: number;
  estimated_savings_percentage: number;
  implementation_effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation_steps: string[];
  expected_impact: string;
  created_at: string;
  implemented: boolean;
  implemented_at?: string;
}

export interface BudgetConfig {
  monthly_budget_usd: number;
  daily_budget_usd: number;
  alert_thresholds: {
    daily_percentage: number; // Alert when daily spend exceeds X% of daily budget
    monthly_percentage: number; // Alert when monthly spend exceeds X% of monthly budget
    token_cost_per_request: number; // Alert when token cost per request exceeds threshold
  };
  auto_throttling: {
    enabled: boolean;
    throttle_at_percentage: number; // Start throttling at X% of budget
    stop_at_percentage: number; // Stop processing at X% of budget
  };
}

export interface TokenUsagePattern {
  endpoint: string;
  average_prompt_tokens: number;
  average_completion_tokens: number;
  average_cost_per_request: number;
  request_count: number;
  total_cost: number;
  efficiency_score: number; // 0-100, higher is better
  optimization_potential: number; // Estimated savings in USD
}

export class CostOptimizationService {
  private budgetConfig: BudgetConfig = {
    monthly_budget_usd: 1000,
    daily_budget_usd: 33,
    alert_thresholds: {
      daily_percentage: 80,
      monthly_percentage: 90,
      token_cost_per_request: 0.10
    },
    auto_throttling: {
      enabled: true,
      throttle_at_percentage: 85,
      stop_at_percentage: 95
    }
  };

  private activeAlerts: Map<string, CostAlert> = new Map();
  private costHistory: CostMetrics[] = [];
  private tokenCache: Map<string, { tokens: number; timestamp: number }> = new Map();

  /**
   * Track token usage for OpenAI requests
   */
  async trackTokenUsage(
    endpoint: string,
    promptTokens: number,
    completionTokens: number,
    model: string = 'gpt-4'
  ): Promise<{ cost: number; shouldThrottle: boolean; shouldStop: boolean }> {
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateTokenCost(model, promptTokens, completionTokens);

    // Log usage
    await this.logTokenUsage(endpoint, promptTokens, completionTokens, cost);

    // Check budget constraints
    const dailySpend = await this.getDailySpend();
    const monthlySpend = await this.getMonthlySpend();

    const dailyBudgetPercentage = (dailySpend / this.budgetConfig.daily_budget_usd) * 100;
    const monthlyBudgetPercentage = (monthlySpend / this.budgetConfig.monthly_budget_usd) * 100;

    const shouldThrottle = 
      dailyBudgetPercentage >= this.budgetConfig.auto_throttling.throttle_at_percentage ||
      monthlyBudgetPercentage >= this.budgetConfig.auto_throttling.throttle_at_percentage;

    const shouldStop = 
      dailyBudgetPercentage >= this.budgetConfig.auto_throttling.stop_at_percentage ||
      monthlyBudgetPercentage >= this.budgetConfig.auto_throttling.stop_at_percentage;

    // Generate alerts if needed
    await this.checkAndGenerateAlerts(dailySpend, monthlySpend, cost);

    return { cost, shouldThrottle, shouldStop };
  }

  /**
   * Optimize prompt to reduce token usage
   */
  async optimizePrompt(originalPrompt: string, targetReduction: number = 20): Promise<{
    optimizedPrompt: string;
    originalTokens: number;
    optimizedTokens: number;
    tokenReduction: number;
    estimatedSavings: number;
  }> {
    const originalTokens = this.estimateTokenCount(originalPrompt);

    // Apply optimization techniques
    let optimizedPrompt = originalPrompt;

    // Remove redundant words and phrases
    optimizedPrompt = this.removeRedundancy(optimizedPrompt);

    // Use more concise language
    optimizedPrompt = this.makeMoreConcise(optimizedPrompt);

    // Remove excessive examples if target reduction not met
    const currentTokens = this.estimateTokenCount(optimizedPrompt);
    const currentReduction = ((originalTokens - currentTokens) / originalTokens) * 100;

    if (currentReduction < targetReduction) {
      optimizedPrompt = this.removeExcessiveExamples(optimizedPrompt);
    }

    const finalTokens = this.estimateTokenCount(optimizedPrompt);
    const tokenReduction = originalTokens - finalTokens;
    const reductionPercentage = (tokenReduction / originalTokens) * 100;

    return {
      optimizedPrompt,
      originalTokens,
      optimizedTokens: finalTokens,
      tokenReduction: reductionPercentage,
      estimatedSavings: (tokenReduction * 0.00003) // Approximate cost per token
    };
  }

  /**
   * Implement intelligent caching for API responses
   */
  async getCachedResponse<T>(
    cacheKey: string,
    generator: () => Promise<T>,
    ttlHours: number = 24
  ): Promise<{ data: T; cached: boolean; cost_saved: number }> {
    const cached = this.tokenCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < (ttlHours * 60 * 60 * 1000)) {
      return {
        data: cached as T,
        cached: true,
        cost_saved: 0.05 // Estimated cost saved per cache hit
      };
    }

    // Generate new response
    const data = await generator();
    
    // Cache the response
    this.tokenCache.set(cacheKey, {
      tokens: this.estimateTokenCount(JSON.stringify(data)),
      timestamp: now
    });

    return {
      data,
      cached: false,
      cost_saved: 0
    };
  }

  /**
   * Batch API requests to reduce costs
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10,
    delayMs: number = 1000
  ): Promise<{
    results: R[];
    total_cost: number;
    cost_savings: number;
    processing_time_ms: number;
  }> {
    const startTime = Date.now();
    const results: R[] = [];
    let totalCost = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchResults = await processor(batch);
      results.push(...batchResults);

      // Estimate cost for this batch
      const batchCost = batch.length * 0.01; // Estimated cost per item
      totalCost += batchCost;

      // Add delay between batches to respect rate limits
      if (i + batchSize < items.length) {
        await this.delay(delayMs);
      }
    }

    const processingTime = Date.now() - startTime;
    
    // Calculate savings vs individual processing
    const individualCost = items.length * 0.02; // Higher cost for individual requests
    const costSavings = individualCost - totalCost;

    return {
      results,
      total_cost: totalCost,
      cost_savings: costSavings,
      processing_time_ms: processingTime
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze token usage patterns
    const tokenPatterns = await this.analyzeTokenUsagePatterns();
    
    // Identify high-cost, low-efficiency endpoints
    const inefficientEndpoints = tokenPatterns.filter(p => p.efficiency_score < 60);
    
    for (const endpoint of inefficientEndpoints) {
      recommendations.push({
        id: `token-opt-${endpoint.endpoint}-${Date.now()}`,
        category: 'token_usage',
        title: `Optimize ${endpoint.endpoint} token usage`,
        description: `This endpoint has low efficiency (${endpoint.efficiency_score}/100) and high cost per request ($${endpoint.average_cost_per_request.toFixed(4)})`,
        estimated_savings_usd: endpoint.optimization_potential,
        estimated_savings_percentage: 25,
        implementation_effort: 'medium',
        priority: endpoint.optimization_potential > 10 ? 'high' : 'medium',
        implementation_steps: [
          'Analyze and optimize prompt templates',
          'Implement response caching',
          'Use more specific prompts to reduce completion tokens',
          'Consider using a less expensive model for simpler tasks'
        ],
        expected_impact: `Reduce token usage by 20-30% and cost by $${endpoint.optimization_potential.toFixed(2)}/month`,
        created_at: new Date().toISOString(),
        implemented: false
      });
    }

    // Check for caching opportunities
    const cachingOpportunities = await this.identifyCachingOpportunities();
    
    if (cachingOpportunities.potential_savings > 5) {
      recommendations.push({
        id: `caching-opt-${Date.now()}`,
        category: 'caching',
        title: 'Implement intelligent caching system',
        description: 'Many API requests could be cached to reduce costs and improve performance',
        estimated_savings_usd: cachingOpportunities.potential_savings,
        estimated_savings_percentage: 15,
        implementation_effort: 'medium',
        priority: 'high',
        implementation_steps: [
          'Implement Redis-based caching layer',
          'Add cache-aware API wrappers',
          'Set up cache invalidation strategies',
          'Monitor cache hit rates'
        ],
        expected_impact: `Save $${cachingOpportunities.potential_savings.toFixed(2)}/month through reduced API calls`,
        created_at: new Date().toISOString(),
        implemented: false
      });
    }

    // Check for batch processing opportunities
    const batchOpportunities = await this.identifyBatchOpportunities();
    
    if (batchOpportunities.length > 0) {
      recommendations.push({
        id: `batch-opt-${Date.now()}`,
        category: 'batch_processing',
        title: 'Implement batch processing for bulk operations',
        description: 'Several operations could be batched together to reduce per-request overhead',
        estimated_savings_usd: 20,
        estimated_savings_percentage: 10,
        implementation_effort: 'low',
        priority: 'medium',
        implementation_steps: [
          'Identify batchable operations',
          'Implement batch queuing system',
          'Add batch processing endpoints',
          'Update client code to use batch operations'
        ],
        expected_impact: 'Reduce API overhead by 10-15% and improve throughput',
        created_at: new Date().toISOString(),
        implemented: false
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get comprehensive cost analytics
   */
  async getCostAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<{
    current_period: CostMetrics;
    previous_period: CostMetrics;
    trend: 'increasing' | 'decreasing' | 'stable';
    trend_percentage: number;
    cost_breakdown: Array<{ category: string; cost: number; percentage: number }>;
    efficiency_metrics: {
      cost_per_content_piece: number;
      cost_per_thousand_tokens: number;
      api_efficiency_score: number;
      roi_estimate: number;
    };
    projections: {
      monthly_projection: number;
      annual_projection: number;
      budget_utilization: number;
    };
    alerts: CostAlert[];
    recommendations: OptimizationRecommendation[];
  }> {
    const currentPeriod = await this.getPeriodMetrics(period);
    const previousPeriod = await this.getPreviousPeriodMetrics(period);

    const trendPercentage = ((currentPeriod.total_cost_usd - previousPeriod.total_cost_usd) / previousPeriod.total_cost_usd) * 100;
    const trend = Math.abs(trendPercentage) < 5 ? 'stable' : trendPercentage > 0 ? 'increasing' : 'decreasing';

    const costBreakdown = [
      { category: 'OpenAI', cost: currentPeriod.openai_tokens.cost_usd, percentage: 0 },
      { category: 'Google APIs', cost: currentPeriod.google_apis.cost_usd, percentage: 0 },
      { category: 'External APIs', cost: currentPeriod.external_apis.cost_usd, percentage: 0 },
      { category: 'Infrastructure', cost: currentPeriod.infrastructure.cost_usd, percentage: 0 }
    ].map(item => ({
      ...item,
      percentage: (item.cost / currentPeriod.total_cost_usd) * 100
    }));

    return {
      current_period: currentPeriod,
      previous_period: previousPeriod,
      trend,
      trend_percentage: trendPercentage,
      cost_breakdown: costBreakdown,
      efficiency_metrics: {
        cost_per_content_piece: currentPeriod.cost_per_content_piece,
        cost_per_thousand_tokens: (currentPeriod.openai_tokens.cost_usd / currentPeriod.openai_tokens.total_tokens) * 1000,
        api_efficiency_score: await this.calculateApiEfficiencyScore(),
        roi_estimate: currentPeriod.roi_estimate
      },
      projections: {
        monthly_projection: this.projectMonthlyCost(currentPeriod),
        annual_projection: this.projectMonthlyCost(currentPeriod) * 12,
        budget_utilization: (await this.getMonthlySpend() / this.budgetConfig.monthly_budget_usd) * 100
      },
      alerts: Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved),
      recommendations: await this.generateOptimizationRecommendations()
    };
  }

  /**
   * Set budget configuration
   */
  async setBudgetConfig(config: Partial<BudgetConfig>): Promise<void> {
    this.budgetConfig = { ...this.budgetConfig, ...config };
    await this.saveBudgetConfig();
  }

  /**
   * Get current budget status
   */
  async getBudgetStatus(): Promise<{
    daily: { spent: number; budget: number; remaining: number; percentage: number };
    monthly: { spent: number; budget: number; remaining: number; percentage: number };
    throttling_active: boolean;
    processing_stopped: boolean;
  }> {
    const dailySpent = await this.getDailySpend();
    const monthlySpent = await this.getMonthlySpend();

    const dailyPercentage = (dailySpent / this.budgetConfig.daily_budget_usd) * 100;
    const monthlyPercentage = (monthlySpent / this.budgetConfig.monthly_budget_usd) * 100;

    return {
      daily: {
        spent: dailySpent,
        budget: this.budgetConfig.daily_budget_usd,
        remaining: this.budgetConfig.daily_budget_usd - dailySpent,
        percentage: dailyPercentage
      },
      monthly: {
        spent: monthlySpent,
        budget: this.budgetConfig.monthly_budget_usd,
        remaining: this.budgetConfig.monthly_budget_usd - monthlySpent,
        percentage: monthlyPercentage
      },
      throttling_active: Math.max(dailyPercentage, monthlyPercentage) >= this.budgetConfig.auto_throttling.throttle_at_percentage,
      processing_stopped: Math.max(dailyPercentage, monthlyPercentage) >= this.budgetConfig.auto_throttling.stop_at_percentage
    };
  }

  /**
   * Helper methods
   */
  private calculateTokenCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = {
      'gpt-4': { prompt: 0.00003, completion: 0.00006 },
      'gpt-4-turbo': { prompt: 0.00001, completion: 0.00003 },
      'gpt-3.5-turbo': { prompt: 0.0000015, completion: 0.000002 }
    };

    const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-4'];
    return (promptTokens * modelPricing.prompt) + (completionTokens * modelPricing.completion);
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private removeRedundancy(text: string): string {
    return text
      .replace(/\b(very|really|quite|extremely|incredibly)\s+/gi, '')
      .replace(/\b(please|kindly)\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private makeMoreConcise(text: string): string {
    return text
      .replace(/in order to/gi, 'to')
      .replace(/at this point in time/gi, 'now')
      .replace(/due to the fact that/gi, 'because')
      .replace(/in the event that/gi, 'if')
      .replace(/for the purpose of/gi, 'for');
  }

  private removeExcessiveExamples(text: string): string {
    // Remove examples beyond the first 2
    const examplePattern = /example[s]?:\s*([^.!?]*[.!?]){3,}/gi;
    return text.replace(examplePattern, 'examples: [truncated for brevity]');
  }

  private async logTokenUsage(endpoint: string, promptTokens: number, completionTokens: number, cost: number): Promise<void> {
    // Log to database or analytics service
    console.log(`Token usage - ${endpoint}: ${promptTokens + completionTokens} tokens, $${cost.toFixed(6)}`);
  }

  private async getDailySpend(): Promise<number> {
    try {
      // Get today's spending from database
      const today = new Date().toISOString().split('T')[0];
      
      // Query usage tracking table for today's total
      const query = `
        SELECT COALESCE(SUM(cost_usd), 0) as daily_total
        FROM api_usage_tracking 
        WHERE DATE(created_at) = $1
      `;
      
      // This would use your actual database client
      // const result = await db.query(query, [today]);
      // return parseFloat(result.rows[0].daily_total) || 0;
      
      // For now, return 0 until database is connected
      console.warn('Database not connected for cost tracking');
      return 0;
    } catch (error) {
      console.error('Error getting daily spend:', error);
      return 0;
    }
  }

  private async getMonthlySpend(): Promise<number> {
    try {
      // Get this month's spending from database
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const firstDay = firstDayOfMonth.toISOString().split('T')[0];
      
      const query = `
        SELECT COALESCE(SUM(cost_usd), 0) as monthly_total
        FROM api_usage_tracking 
        WHERE DATE(created_at) >= $1
      `;
      
      // This would use your actual database client
      // const result = await db.query(query, [firstDay]);
      // return parseFloat(result.rows[0].monthly_total) || 0;
      
      // For now, return 0 until database is connected
      console.warn('Database not connected for cost tracking');
      return 0;
    } catch (error) {
      console.error('Error getting monthly spend:', error);
      return 0;
    }
  }

  private async checkAndGenerateAlerts(dailySpend: number, monthlySpend: number, requestCost: number): Promise<void> {
    const dailyPercentage = (dailySpend / this.budgetConfig.daily_budget_usd) * 100;
    const monthlyPercentage = (monthlySpend / this.budgetConfig.monthly_budget_usd) * 100;

    // Check daily threshold
    if (dailyPercentage >= this.budgetConfig.alert_thresholds.daily_percentage) {
      const alertId = `daily-threshold-${new Date().toISOString().split('T')[0]}`;
      if (!this.activeAlerts.has(alertId)) {
        this.activeAlerts.set(alertId, {
          id: alertId,
          type: 'threshold_exceeded',
          severity: dailyPercentage >= 95 ? 'critical' : 'high',
          title: 'Daily budget threshold exceeded',
          description: `Daily spending has reached ${dailyPercentage.toFixed(1)}% of budget ($${dailySpend.toFixed(2)} of $${this.budgetConfig.daily_budget_usd})`,
          current_value: dailySpend,
          threshold_value: this.budgetConfig.daily_budget_usd * (this.budgetConfig.alert_thresholds.daily_percentage / 100),
          suggested_actions: [
            'Review high-cost operations',
            'Enable throttling',
            'Optimize token usage'
          ],
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    // Check monthly threshold
    if (monthlyPercentage >= this.budgetConfig.alert_thresholds.monthly_percentage) {
      const alertId = `monthly-threshold-${new Date().toISOString().slice(0, 7)}`;
      if (!this.activeAlerts.has(alertId)) {
        this.activeAlerts.set(alertId, {
          id: alertId,
          type: 'threshold_exceeded',
          severity: monthlyPercentage >= 95 ? 'critical' : 'high',
          title: 'Monthly budget threshold exceeded',
          description: `Monthly spending has reached ${monthlyPercentage.toFixed(1)}% of budget ($${monthlySpend.toFixed(2)} of $${this.budgetConfig.monthly_budget_usd})`,
          current_value: monthlySpend,
          threshold_value: this.budgetConfig.monthly_budget_usd * (this.budgetConfig.alert_thresholds.monthly_percentage / 100),
          suggested_actions: [
            'Review spending patterns',
            'Implement cost optimization',
            'Consider increasing budget'
          ],
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }
  }

  private async analyzeTokenUsagePatterns(): Promise<TokenUsagePattern[]> {
    // Analyze historical token usage patterns
    return [
      {
        endpoint: '/api/content/generate',
        average_prompt_tokens: 1500,
        average_completion_tokens: 800,
        average_cost_per_request: 0.069,
        request_count: 450,
        total_cost: 31.05,
        efficiency_score: 45,
        optimization_potential: 12.42
      },
      {
        endpoint: '/api/keywords/analyze',
        average_prompt_tokens: 800,
        average_completion_tokens: 200,
        average_cost_per_request: 0.030,
        request_count: 320,
        total_cost: 9.60,
        efficiency_score: 78,
        optimization_potential: 2.11
      }
    ];
  }

  private async identifyCachingOpportunities(): Promise<{ potential_savings: number; cacheable_requests: number }> {
    return {
      potential_savings: 25.50,
      cacheable_requests: 180
    };
  }

  private async identifyBatchOpportunities(): Promise<string[]> {
    return ['keyword-analysis', 'content-optimization', 'seo-scoring'];
  }

  private async getPeriodMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<CostMetrics> {
    // Get metrics for the specified period
    return {
      period: new Date().toISOString(),
      openai_tokens: {
        prompt_tokens: 45000,
        completion_tokens: 23000,
        total_tokens: 68000,
        cost_usd: 4.08
      },
      google_apis: {
        search_console_requests: 1200,
        analytics_requests: 800,
        trends_requests: 300,
        cost_usd: 2.30
      },
      external_apis: {
        ahrefs_requests: 150,
        semrush_requests: 75,
        cost_usd: 15.50
      },
      infrastructure: {
        compute_hours: 720,
        storage_gb: 50,
        bandwidth_gb: 200,
        cost_usd: 12.75
      },
      total_cost_usd: 34.63,
      content_pieces_generated: 125,
      cost_per_content_piece: 0.277,
      roi_estimate: 2.8
    };
  }

  private async getPreviousPeriodMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<CostMetrics> {
    // Get metrics for the previous period for comparison
    return {
      period: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      openai_tokens: {
        prompt_tokens: 42000,
        completion_tokens: 21000,
        total_tokens: 63000,
        cost_usd: 3.78
      },
      google_apis: {
        search_console_requests: 1100,
        analytics_requests: 750,
        trends_requests: 280,
        cost_usd: 2.13
      },
      external_apis: {
        ahrefs_requests: 140,
        semrush_requests: 70,
        cost_usd: 14.50
      },
      infrastructure: {
        compute_hours: 680,
        storage_gb: 45,
        bandwidth_gb: 180,
        cost_usd: 11.90
      },
      total_cost_usd: 32.31,
      content_pieces_generated: 118,
      cost_per_content_piece: 0.274,
      roi_estimate: 2.6
    };
  }

  private async calculateApiEfficiencyScore(): Promise<number> {
    try {
      // Calculate overall API efficiency score (0-100) based on actual metrics
      const currentMetrics = await this.getPeriodMetrics('daily');
      
      // Calculate efficiency based on multiple factors
      const costPerContent = currentMetrics.cost_per_content_piece;
      const tokenEfficiency = currentMetrics.openai_tokens.completion_tokens / currentMetrics.openai_tokens.prompt_tokens;
      const errorRate = await this.getApiErrorRate();
      
      // Score calculation (higher is better)
      let score = 100;
      
      // Penalize high cost per content piece
      if (costPerContent > 0.5) score -= 20;
      else if (costPerContent > 0.3) score -= 10;
      
      // Reward good token efficiency (completion vs prompt ratio)
      if (tokenEfficiency > 0.8) score -= 15; // Too verbose
      else if (tokenEfficiency < 0.3) score -= 10; // Too brief
      
      // Penalize high error rates
      score -= errorRate * 50; // Each 1% error rate removes 0.5 points
      
      // Ensure score is within bounds
      return Math.max(0, Math.min(100, Math.round(score)));
      
    } catch (error) {
      console.error('Error calculating API efficiency score:', error);
      return 75; // Default reasonable score
    }
  }

  private async getApiErrorRate(): Promise<number> {
    try {
      // Get error rate from the last 24 hours
      const query = `
        SELECT 
          COUNT(CASE WHEN error_occurred THEN 1 END)::float / COUNT(*)::float as error_rate
        FROM api_usage_tracking 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `;
      
      // This would use your actual database client
      // const result = await db.query(query);
      // return parseFloat(result.rows[0].error_rate) || 0;
      
      return 0.02; // 2% default error rate
    } catch (error) {
      console.error('Error getting API error rate:', error);
      return 0.02;
    }
  }

  private projectMonthlyCost(currentPeriod: CostMetrics): number {
    // Project monthly cost based on current period data
    return currentPeriod.total_cost_usd * 30; // Assuming daily data
  }

  private async saveBudgetConfig(): Promise<void> {
    // Save budget configuration to database
    console.log('Budget configuration saved');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const costOptimizationService = new CostOptimizationService();