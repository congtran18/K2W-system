import { supabase, DatabaseService } from './client';
import {
  TABLE_NAMES,
  KEYWORD_STATUS,
  CONTENT_STATUS,
  JOB_STATUS,
  K2WUserRecord,
  K2WProjectRecord,
  K2WKeywordRecord,
  K2WClusterRecord,
  K2WContentRecord,
  K2WMediaStorageRecord,
  K2WAnalyticsDataRecord,
  K2WSEOAuditLogRecord,
  K2WPublishLogRecord,
  K2WFeedbackRecord,
  K2WSystemLogRecord,
  CreateK2WUser,
  CreateK2WProject,
  CreateK2WKeyword,
  CreateK2WCluster,
  CreateK2WContent,
  CreateK2WMediaStorage,
  CreateK2WAnalyticsData,
  CreateK2WSEOAuditLog,
  CreateK2WPublishLog,
  CreateK2WFeedback,
  CreateK2WSystemLog,
  UpdateK2WUser,
  UpdateK2WProject,
  UpdateK2WKeyword,
  UpdateK2WCluster,
  UpdateK2WContent,
  UpdateK2WAnalyticsData,
  UpdateK2WSEOAuditLog,
  UpdateK2WPublishLog,
  UpdateK2WFeedback
} from './k2w-schemas';

/**
 * K2W Database Service
 * Complete CRUD operations for K2W System
 * Implements Section 5.2 Database Schema from K2W Specifications
 */
export class K2WDatabaseService extends DatabaseService {
  
  // User Management
  async createUser(userData: CreateK2WUser): Promise<K2WUserRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WUserRecord;
  }

  async getUserById(id: string): Promise<K2WUserRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as K2WUserRecord;
  }

  async updateUser(id: string, updates: UpdateK2WUser): Promise<K2WUserRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WUserRecord;
  }

  // Project Management
  async createProject(projectData: CreateK2WProject): Promise<K2WProjectRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .insert({
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WProjectRecord;
  }

  async getProjectById(id: string): Promise<K2WProjectRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as K2WProjectRecord;
  }

  async getProjectsByUserId(userId: string): Promise<K2WProjectRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WProjectRecord[];
  }

  async updateProject(id: string, updates: UpdateK2WProject): Promise<K2WProjectRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WProjectRecord;
  }

  // Keyword Management
  async createKeyword(keywordData: CreateK2WKeyword): Promise<K2WKeywordRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.KEYWORDS)
      .insert({
        ...keywordData,
        status: keywordData.status || KEYWORD_STATUS.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WKeywordRecord;
  }

  async getKeywordById(id: string): Promise<K2WKeywordRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.KEYWORDS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as K2WKeywordRecord;
  }

  async getKeywordsByProjectId(projectId: string, status?: string): Promise<K2WKeywordRecord[]> {
    let query = supabase
      .from(TABLE_NAMES.KEYWORDS)
      .select('*')
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WKeywordRecord[];
  }

  async updateKeywordStatus(id: string, status: string): Promise<K2WKeywordRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.KEYWORDS)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WKeywordRecord;
  }

  async updateKeyword(id: string, updates: UpdateK2WKeyword): Promise<K2WKeywordRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.KEYWORDS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WKeywordRecord;
  }

  // Cluster Management
  async createCluster(clusterData: CreateK2WCluster): Promise<K2WClusterRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLUSTERS)
      .insert({
        ...clusterData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WClusterRecord;
  }

  async getClusterById(id: string): Promise<K2WClusterRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLUSTERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as K2WClusterRecord;
  }

  async getClustersByProjectId(projectId: string): Promise<K2WClusterRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLUSTERS)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WClusterRecord[];
  }

  async updateCluster(id: string, updates: UpdateK2WCluster): Promise<K2WClusterRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLUSTERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WClusterRecord;
  }

  // Content Management
  async createContent(contentData: CreateK2WContent): Promise<K2WContentRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .insert({
        ...contentData,
        status: contentData.status || CONTENT_STATUS.DRAFT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WContentRecord;
  }

  async getContentById(id: string): Promise<K2WContentRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as K2WContentRecord;
  }

  async getContentByKeywordId(keywordId: string): Promise<K2WContentRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .select('*')
      .eq('keyword_id', keywordId)
      .single();

    if (error) return null;
    return data as K2WContentRecord;
  }

  async getContentsByProjectId(projectId: string, status?: string): Promise<K2WContentRecord[]> {
    let query = supabase
      .from(TABLE_NAMES.CONTENT)
      .select('*')
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WContentRecord[];
  }

  async updateContent(id: string, updates: UpdateK2WContent): Promise<K2WContentRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WContentRecord;
  }

  async updateContentStatus(id: string, status: string): Promise<K2WContentRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WContentRecord;
  }

  // Media Storage Management
  async createMediaStorage(mediaData: CreateK2WMediaStorage): Promise<K2WMediaStorageRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.MEDIA_STORAGE)
      .insert({
        ...mediaData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WMediaStorageRecord;
  }

  async getMediaByContentId(contentId: string): Promise<K2WMediaStorageRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.MEDIA_STORAGE)
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WMediaStorageRecord[];
  }

  // Analytics Data Management
  async createAnalyticsData(analyticsData: CreateK2WAnalyticsData): Promise<K2WAnalyticsDataRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.ANALYTICS_DATA)
      .insert({
        ...analyticsData,
        collected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WAnalyticsDataRecord;
  }

  async getAnalyticsByContentId(contentId: string, dateFrom?: string, dateTo?: string): Promise<K2WAnalyticsDataRecord[]> {
    let query = supabase
      .from(TABLE_NAMES.ANALYTICS_DATA)
      .select('*')
      .eq('content_id', contentId);

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data as K2WAnalyticsDataRecord[];
  }

  // SEO Audit Log Management
  async createSEOAuditLog(auditData: CreateK2WSEOAuditLog): Promise<K2WSEOAuditLogRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.SEO_AUDIT_LOG)
      .insert({
        ...auditData,
        audited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WSEOAuditLogRecord;
  }

  async getLatestSEOAudit(contentId: string): Promise<K2WSEOAuditLogRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.SEO_AUDIT_LOG)
      .select('*')
      .eq('content_id', contentId)
      .order('audited_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as K2WSEOAuditLogRecord;
  }

  // Publish Log Management
  async createPublishLog(publishData: CreateK2WPublishLog): Promise<K2WPublishLogRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PUBLISH_LOG)
      .insert(publishData)
      .select()
      .single();

    if (error) throw error;
    return data as K2WPublishLogRecord;
  }

  async updatePublishLog(id: string, updates: UpdateK2WPublishLog): Promise<K2WPublishLogRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.PUBLISH_LOG)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as K2WPublishLogRecord;
  }

  // Feedback Management
  async createFeedback(feedbackData: CreateK2WFeedback): Promise<K2WFeedbackRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.FEEDBACK_DB)
      .insert({
        ...feedbackData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WFeedbackRecord;
  }

  async getFeedbackByContentId(contentId: string): Promise<K2WFeedbackRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.FEEDBACK_DB)
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as K2WFeedbackRecord[];
  }

  // System Log Management
  async createSystemLog(logData: CreateK2WSystemLog): Promise<K2WSystemLogRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.SYSTEM_LOG)
      .insert({
        ...logData,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as K2WSystemLogRecord;
  }

  // Utility Methods for K2W Workflow
  async getReadyToPublishContent(projectId: string): Promise<K2WContentRecord[]> {
    return this.getContentsByProjectId(projectId, CONTENT_STATUS.READY_TO_PUBLISH);
  }

  async getPendingKeywords(projectId: string): Promise<K2WKeywordRecord[]> {
    return this.getKeywordsByProjectId(projectId, KEYWORD_STATUS.PENDING);
  }

  async getContentForSEOReview(projectId: string): Promise<K2WContentRecord[]> {
    return this.getContentsByProjectId(projectId, CONTENT_STATUS.REVIEWING);
  }

  async bulkUpdateKeywordStatus(keywordIds: string[], status: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAMES.KEYWORDS)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', keywordIds);

    if (error) throw error;
  }

  async getContentMetrics(projectId: string): Promise<{
    total: number;
    published: number;
    draft: number;
    reviewing: number;
  }> {
    const { data, error } = await supabase
      .from(TABLE_NAMES.CONTENT)
      .select('status')
      .eq('project_id', projectId);

    if (error) throw error;

    const metrics = {
      total: data.length,
      published: data.filter(c => c.status === CONTENT_STATUS.PUBLISHED).length,
      draft: data.filter(c => c.status === CONTENT_STATUS.DRAFT).length,
      reviewing: data.filter(c => c.status === CONTENT_STATUS.REVIEWING).length,
    };

    return metrics;
  }
}

// Export singleton instance
export const k2wDb = new K2WDatabaseService();