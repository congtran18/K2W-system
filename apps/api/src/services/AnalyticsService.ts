/**
 * K2W Analytics Service
 * Business logic layer for analytics and reporting
 */

import { 
  K2WProjectRecord,
  K2WKeywordRecord,
  K2WContentRecord,
  K2WClusterRecord
} from '@k2w/database';
import { 
  projectRepository,
  keywordRepository, 
  contentRepository,
  clusterRepository 
} from '../repositories/K2WRepositoryOptimized';
import { PaginationOptions, FilterOptions } from '../types/common';export interface ProjectDashboard {
  project: K2WProjectRecord;
  workflowStatus: {
    totalKeywords: number;
    pendingKeywords: number;
    clusteredKeywords: number;
    contentDraft: number;
    contentPublished: number;
  };
  clusters: {
    total: number;
    items: K2WClusterRecord[];
  };
  recentContent: K2WContentRecord[];
  performanceMetrics: {
    avgContentGenerationTime: string;
    avgSeoScore: number;
    avgReadabilityScore: number;
    contentSuccessRate: number;
  };
}

export interface KeywordAnalytics {
  totalKeywords: number;
  statusBreakdown: Record<string, number>;
  searchIntentBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
  regionBreakdown: Record<string, number>;
  topClusters: Array<{
    clusterId: string;
    clusterName: string;
    keywordCount: number;
    contentCount: number;
  }>;
}

export interface ContentAnalytics {
  totalContent: number;
  statusBreakdown: Record<string, number>;
  contentTypeBreakdown: Record<string, number>;
  averageWordCount: number;
  averageSeoScore: number;
  averageReadabilityScore: number;
  publishingTrends: Array<{
    date: string;
    published: number;
    drafted: number;
  }>;
}

export interface PerformanceMetrics {
  contentGenerationStats: {
    totalGenerated: number;
    successRate: number;
    averageTimeToGenerate: number;
    failureReasons: Record<string, number>;
  };
  seoPerformance: {
    averageSeoScore: number;
    scoreDistribution: Record<string, number>;
    topPerformingContent: Array<{
      contentId: string;
    title: string;
      seoScore: number;
    }>;
  };
  workflowEfficiency: {
    keywordsToContentRatio: number;
    clusteringEfficiency: number;
    automationRate: number;
  };
}

export class AnalyticsService {

  /**
   * Get comprehensive project dashboard
   */
  async getProjectDashboard(projectId: string): Promise<ProjectDashboard> {
    // Get project details
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get workflow status
    const workflowStatus = await this.getWorkflowStatus(projectId);

    // Get clusters
    const clusters = await clusterRepository.findByProjectId(projectId);

    // Get recent content
    const allContent = await contentRepository.findByProjectId(projectId);
    const recentContent = allContent
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);

    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(projectId);

    return {
      project,
      workflowStatus,
      clusters: {
        total: clusters.length,
        items: clusters.slice(0, 10) // Top 10 clusters
      },
      recentContent,
      performanceMetrics
    };
  }

  /**
   * Get keyword analytics for a project
   */
  async getKeywordAnalytics(projectId: string): Promise<KeywordAnalytics> {
    const keywords = await keywordRepository.findByProjectId(projectId);
    const clusters = await clusterRepository.findByProjectId(projectId);

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    keywords.forEach(keyword => {
      statusBreakdown[keyword.status] = (statusBreakdown[keyword.status] || 0) + 1;
    });

    // Search intent breakdown
    const searchIntentBreakdown: Record<string, number> = {};
    keywords.forEach(keyword => {
      const intent = keyword.search_intent || 'unknown';
      searchIntentBreakdown[intent] = (searchIntentBreakdown[intent] || 0) + 1;
    });

    // Language breakdown
    const languageBreakdown: Record<string, number> = {};
    keywords.forEach(keyword => {
      languageBreakdown[keyword.language] = (languageBreakdown[keyword.language] || 0) + 1;
    });

    // Region breakdown
    const regionBreakdown: Record<string, number> = {};
    keywords.forEach(keyword => {
      regionBreakdown[keyword.region] = (regionBreakdown[keyword.region] || 0) + 1;
    });

    // Top clusters - skip cluster analysis for now due to repository limitations
    const topClusters = clusters.slice(0, 10).map(cluster => ({
      clusterId: cluster.id,
      clusterName: cluster.name,
      keywordCount: 0, // Would need cluster-specific query
      contentCount: 0, // Would need cluster-specific query
      avgContentScore: 0,
      totalViews: 0,
      totalClicks: 0
    }));

    return {
      totalKeywords: keywords.length,
      statusBreakdown,
      searchIntentBreakdown,
      languageBreakdown,
      regionBreakdown,
      topClusters
    };
  }

  /**
   * Get content analytics for a project
   */
  async getContentAnalytics(projectId: string): Promise<ContentAnalytics> {
    const content = await contentRepository.findByProjectId(projectId);

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    content.forEach(item => {
      statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
    });

    // Content type breakdown
    const contentTypeBreakdown: Record<string, number> = {};
    content.forEach(item => {
      contentTypeBreakdown[item.content_type] = (contentTypeBreakdown[item.content_type] || 0) + 1;
    });

    // Calculate averages
    const totalWordCount = content.reduce((sum, item) => sum + (item.word_count || 0), 0);
    const averageWordCount = content.length > 0 ? totalWordCount / content.length : 0;

    // Mock SEO and readability scores (in production, these would be calculated)
    const averageSeoScore = 78;
    const averageReadabilityScore = 82;

    // Publishing trends (last 7 days)
    const publishingTrends = this.calculatePublishingTrends(content);

    return {
      totalContent: content.length,
      statusBreakdown,
      contentTypeBreakdown,
      averageWordCount,
      averageSeoScore,
      averageReadabilityScore,
      publishingTrends
    };
  }

  /**
   * Get performance metrics for a project
   */
  async getPerformanceMetrics(projectId: string): Promise<PerformanceMetrics> {
    const keywords = await keywordRepository.findByProjectId(projectId);
    const content = await contentRepository.findByProjectId(projectId);

    // Content generation stats
    const totalGenerated = content.length;
    const successfulContent = content.filter(c => c.status === 'published' || c.status === 'draft').length;
    const successRate = totalGenerated > 0 ? successfulContent / totalGenerated : 0;

    // SEO performance
    const averageSeoScore = 78; // Mock value
    const scoreDistribution = {
      'excellent (90-100)': 15,
      'good (70-89)': 45,
      'fair (50-69)': 30,
      'poor (0-49)': 10
    };

    const topPerformingContent = content
      .slice(0, 5)
      .map(item => ({
        contentId: item.id,
        title: item.title,
        seoScore: 85 // Mock value
      }));

    // Workflow efficiency
    const keywordsToContentRatio = keywords.length > 0 ? content.length / keywords.length : 0;
    const clusteredKeywords = keywords.filter(k => k.status === 'clustered' || k.status === 'published').length;
    const clusteringEfficiency = keywords.length > 0 ? clusteredKeywords / keywords.length : 0;
    const automationRate = 0.94; // Mock value

    return {
      contentGenerationStats: {
        totalGenerated,
        successRate,
        averageTimeToGenerate: 2.5, // minutes
        failureReasons: {
          'API Error': 2,
          'Validation Failed': 1,
          'Timeout': 1
        }
      },
      seoPerformance: {
        averageSeoScore,
        scoreDistribution,
        topPerformingContent
      },
      workflowEfficiency: {
        keywordsToContentRatio,
        clusteringEfficiency,
        automationRate
      }
    };
  }

  /**
   * Get workflow status summary
   */
  async getWorkflowStatus(projectId: string) {
    const keywords = await keywordRepository.findByProjectId(projectId);
    const content = await contentRepository.findByProjectId(projectId);

    return {
      totalKeywords: keywords.length,
      pendingKeywords: keywords.filter(k => k.status === 'pending').length,
      clusteredKeywords: keywords.filter(k => k.status === 'clustered').length,
      contentDraft: content.filter(c => c.status === 'draft').length,
      contentPublished: content.filter(c => c.status === 'published').length
    };
  }

  /**
   * Get system-wide analytics (across all projects)
   */
  async getSystemAnalytics() {
    // Since we can't get all data without project context, return mock data
    return {
      totalProjects: 0,
      totalKeywords: 0,
      totalContent: 0,
      totalClusters: 0,
      systemHealth: {
        activeProjects: 0,
        contentGenerationRate: 85, // Mock percentage
        systemUptime: '99.9%',
        apiResponseTime: '1.2s'
      }
    };
  }

  // Private helper methods

  private async calculatePerformanceMetrics(projectId: string) {
    // Mock performance metrics calculation
    return {
      avgContentGenerationTime: '2.5 minutes',
      avgSeoScore: 78,
      avgReadabilityScore: 82,
      contentSuccessRate: 0.94
    };
  }

  private calculatePublishingTrends(content: K2WContentRecord[]) {
    // Calculate publishing trends for the last 7 days
    const trends: Array<{ date: string; published: number; drafted: number }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayContent = content.filter(c => {
        const contentDate = new Date(c.created_at || '');
        return contentDate.toISOString().split('T')[0] === dateString;
      });

      trends.push({
        date: dateString,
        published: dayContent.filter(c => c.status === 'published').length,
        drafted: dayContent.filter(c => c.status === 'draft').length
      });
    }

    return trends;
  }
}

export const analyticsService = new AnalyticsService();