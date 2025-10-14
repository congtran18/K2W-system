/**
 * K2W Repository Layer
 * Data access layer using existing K2WDatabaseService
 */

import { 
  k2wDb,
  K2WKeywordRecord,
  K2WClusterRecord,
  K2WContentRecord,
  K2WProjectRecord,
  CreateK2WKeyword,
  CreateK2WCluster,
  CreateK2WContent,
  UpdateK2WKeyword,
  UpdateK2WCluster,
  UpdateK2WContent
} from '@k2w/database';

/**
 * Project Repository
 */
export class ProjectRepository {
  async findById(id: string): Promise<K2WProjectRecord | null> {
    return await k2wDb.getProjectById(id);
  }

  async findByUserId(userId: string): Promise<K2WProjectRecord[]> {
    return await k2wDb.getProjectsByUserId(userId);
  }

  async create(data: any): Promise<K2WProjectRecord> {
    return await k2wDb.createProject(data);
  }

  async update(id: string, data: any): Promise<K2WProjectRecord> {
    return await k2wDb.updateProject(id, data);
  }

  async count(userId: string): Promise<number> {
    const projects = await k2wDb.getProjectsByUserId(userId);
    return projects.length;
  }
}

/**
 * Keyword Repository
 */
export class KeywordRepository {
  async findById(id: string): Promise<K2WKeywordRecord | null> {
    return await k2wDb.getKeywordById(id);
  }

  async findByProjectId(projectId: string, status?: string): Promise<K2WKeywordRecord[]> {
    return await k2wDb.getKeywordsByProjectId(projectId, status);
  }

  async create(data: CreateK2WKeyword): Promise<K2WKeywordRecord> {
    return await k2wDb.createKeyword(data);
  }

  async update(id: string, data: UpdateK2WKeyword): Promise<K2WKeywordRecord> {
    return await k2wDb.updateKeyword(id, data);
  }

  async count(projectId: string): Promise<number> {
    const keywords = await k2wDb.getKeywordsByProjectId(projectId);
    return keywords.length;
  }

  async bulkCreate(data: CreateK2WKeyword[]): Promise<K2WKeywordRecord[]> {
    const results: K2WKeywordRecord[] = [];
    for (const item of data) {
      results.push(await this.create(item));
    }
    return results;
  }

  async updateStatus(id: string, status: string): Promise<K2WKeywordRecord> {
    return await k2wDb.updateKeywordStatus(id, status);
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<boolean> {
    await k2wDb.bulkUpdateKeywordStatus(ids, status);
    return true;
  }

  async findByStatus(status: string, projectId: string): Promise<K2WKeywordRecord[]> {
    return await k2wDb.getKeywordsByProjectId(projectId, status);
  }
}

/**
 * Cluster Repository
 */
export class ClusterRepository {
  async findById(id: string): Promise<K2WClusterRecord | null> {
    return await k2wDb.getClusterById(id);
  }

  async findByProjectId(projectId: string): Promise<K2WClusterRecord[]> {
    return await k2wDb.getClustersByProjectId(projectId);
  }

  async create(data: CreateK2WCluster): Promise<K2WClusterRecord> {
    return await k2wDb.createCluster(data);
  }

  async update(id: string, data: UpdateK2WCluster): Promise<K2WClusterRecord> {
    return await k2wDb.updateCluster(id, data);
  }

  async count(projectId: string): Promise<number> {
    const clusters = await k2wDb.getClustersByProjectId(projectId);
    return clusters.length;
  }

  async findByTopic(topic: string, projectId: string): Promise<K2WClusterRecord[]> {
    const clusters = await k2wDb.getClustersByProjectId(projectId);
    return clusters.filter((c: K2WClusterRecord) => 
      c.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }
}

/**
 * Content Repository
 */
export class ContentRepository {
  async findById(id: string): Promise<K2WContentRecord | null> {
    return await k2wDb.getContentById(id);
  }

  async findByProjectId(projectId: string, status?: string): Promise<K2WContentRecord[]> {
    return await k2wDb.getContentsByProjectId(projectId, status);
  }

  async create(data: CreateK2WContent): Promise<K2WContentRecord> {
    return await k2wDb.createContent(data);
  }

  async update(id: string, data: UpdateK2WContent): Promise<K2WContentRecord> {
    return await k2wDb.updateContent(id, data);
  }

  async count(projectId: string): Promise<number> {
    const content = await k2wDb.getContentsByProjectId(projectId);
    return content.length;
  }

  async findByKeywordId(keywordId: string): Promise<K2WContentRecord | null> {
    return await k2wDb.getContentByKeywordId(keywordId);
  }

  async findByStatus(status: string, projectId: string): Promise<K2WContentRecord[]> {
    return await k2wDb.getContentsByProjectId(projectId, status);
  }

  async updateStatus(id: string, status: string): Promise<K2WContentRecord> {
    return await k2wDb.updateContentStatus(id, status);
  }

  async getReadyToPublish(projectId: string): Promise<K2WContentRecord[]> {
    return await k2wDb.getReadyToPublishContent(projectId);
  }

  async getForSEOReview(projectId: string): Promise<K2WContentRecord[]> {
    return await k2wDb.getContentForSEOReview(projectId);
  }

  async getMetrics(projectId: string): Promise<{
    total: number;
    published: number;
    draft: number;
    reviewing: number;
  }> {
    return await k2wDb.getContentMetrics(projectId);
  }
}

// Export repository instances
export const projectRepository = new ProjectRepository();
export const keywordRepository = new KeywordRepository();
export const clusterRepository = new ClusterRepository();
export const contentRepository = new ContentRepository();