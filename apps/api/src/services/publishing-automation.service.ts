/**
 * Publishing Automation Service
 * Implements multi-platform publishing according to K2W specs Section 7
 */

import axios from 'axios';
import { K2WContentRecord, K2WPublishLogRecord, PUBLISH_STATUS } from '@k2w/database';
import { generateAestheticTailwindLandingPage } from './cda-landing-template';

export interface PublishingTarget {
  id: string;
  name: string;
  platform: 'wordpress' | 'firebase' | 'replit' | 'static' | 'webflow';
  config: WordPressConfig | FirebaseConfig | ReplitConfig | StaticConfig | WebflowConfig;
  is_active: boolean;
}

export interface WebflowConfig {
  api_token: string;
  site_id: string;
  collection_id: string;
  field_mappings?: {
    title: string;
    slug: string;
    body: string;
    featured_image?: string;
    meta_description?: string;
  };
}

export interface WordPressConfig {
  site_url: string;
  username: string;
  password: string; // App password for WordPress
  category_id?: number;
  author_id?: number;
  tags?: string[];
  featured_image_enabled: boolean;
}

export interface FirebaseConfig {
  project_id: string;
  service_account_key: any;
  collection_name: string;
  custom_domain?: string;
  cors_origins: string[];
}

export interface ReplitConfig {
  repl_url: string;
  api_token: string;
  deployment_branch: string;
  build_command: string;
  start_command: string;
}

export interface StaticConfig {
  deployment_url: string;
  api_key: string;
  build_directory: string;
  custom_domain?: string;
  cdn_enabled: boolean;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  published_url?: string;
  cms_post_id?: string;
  deployment_id?: string;
  error_message?: string;
  metadata: {
    publish_time: string;
    content_id: string;
    target_config: string;
    retry_count: number;
  };
}

export interface PublishOptions {
  schedule_time?: string;
  auto_social_share: boolean;
  generate_sitemap: boolean;
  notify_search_engines: boolean;
  backup_content: boolean;
  quality_check: boolean;
}

export class PublishingAutomationService {
  private defaultOptions: PublishOptions = {
    auto_social_share: false,
    generate_sitemap: true,
    notify_search_engines: true,
    backup_content: true,
    quality_check: true
  };

  /**
   * Publish content to multiple platforms
   */
  async publishContent(
    content: K2WContentRecord,
    targets: PublishingTarget[],
    options: Partial<PublishOptions> = {}
  ): Promise<Record<string, PublishResult>> {
    const publishOptions = { ...this.defaultOptions, ...options };
    const results: Record<string, PublishResult> = {};

    // Pre-publish quality check
    if (publishOptions.quality_check) {
      const qualityScore = await this.performQualityCheck(content);
      if (qualityScore < 0.8) {
        throw new Error(`Content quality score (${qualityScore}) below threshold (0.8)`);
      }
    }

    // Backup content before publishing
    if (publishOptions.backup_content) {
      await this.backupContent(content);
    }

    // Publish to each target platform
    for (const target of targets.filter(t => t.is_active)) {
      try {
        const result = await this.publishToTarget(content, target, publishOptions);
        results[target.id] = result;

        // Log successful publish
        await this.logPublish(content.id, target, result, 'published');

      } catch (error: any) {
        const errorResult: PublishResult = {
          success: false,
          platform: target.platform,
          error_message: error.message,
          metadata: {
            publish_time: new Date().toISOString(),
            content_id: content.id,
            target_config: target.id,
            retry_count: 0
          }
        };
        
        results[target.id] = errorResult;
        await this.logPublish(content.id, target, errorResult, 'failed');
      }
    }

    // Post-publish actions
    if (Object.values(results).some(r => r.success)) {
      await this.performPostPublishActions(content, results, publishOptions);
    }

    return results;
  }

  /**
   * Publish to specific target platform
   */
  private async publishToTarget(
    content: K2WContentRecord,
    target: PublishingTarget,
    options: PublishOptions
  ): Promise<PublishResult> {
    switch (target.platform) {
      case 'wordpress':
        return this.publishToWordPress(content, target.config as WordPressConfig, options);
      case 'firebase':
        return this.publishToFirebase(content, target.config as FirebaseConfig, options);
      case 'replit':
        return this.publishToReplit(content, target.config as ReplitConfig, options);
      case 'static':
        return this.publishToStatic(content, target.config as StaticConfig, options);
      case 'webflow':
        return this.publishToWebflow(content, target.config as WebflowConfig, options);
      default:
        throw new Error(`Unsupported platform: ${target.platform}`);
    }
  }

  /**
   * Publish to WordPress via REST API
   */
  private async publishToWordPress(
    content: K2WContentRecord,
    config: WordPressConfig,
    options: PublishOptions
  ): Promise<PublishResult> {
    const apiUrl = `${config.site_url}/wp-json/wp/v2/posts`;
    
    const postData = {
      title: content.title,
      content: content.body_html,
      status: options.schedule_time ? 'future' : 'publish',
      date: options.schedule_time || new Date().toISOString(),
      excerpt: content.meta_description || '',
      categories: config.category_id ? [config.category_id] : [],
      author: config.author_id || 1,
      meta: {
        _yoast_wpseo_title: content.meta_title || content.title,
        _yoast_wpseo_metadesc: content.meta_description || '',
        _yoast_wpseo_focuskw: this.extractPrimaryKeyword(content)
      }
    };

    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    try {
      const response = await axios.post(apiUrl, postData, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      // Upload featured image if enabled
      let featuredImageId;
      if (config.featured_image_enabled && content.images.length > 0) {
        featuredImageId = await this.uploadWordPressFeaturedImage(
          content.images[0], 
          config, 
          response.data.id
        );
        
        if (featuredImageId) {
          await this.updateWordPressPost(config, response.data.id, {
            featured_media: featuredImageId
          });
        }
      }

      return {
        success: true,
        platform: 'wordpress',
        published_url: response.data.link,
        cms_post_id: response.data.id.toString(),
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'wordpress',
          retry_count: 0
        }
      };

    } catch (error: any) {
      throw new Error(`WordPress publish failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Publish to Firebase Firestore
   */
  private async publishToFirebase(
    content: K2WContentRecord,
    config: FirebaseConfig,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      // Note: This is a placeholder implementation
      // In production, you would install firebase-admin and use proper Firebase SDK
      
      // Simulate Firebase publish
      const documentData = {
        title: content.title,
        body: content.body,
        body_html: content.body_html,
        meta_description: content.meta_description,
        url: content.url,
        language: content.language,
        region: content.region,
        published_at: new Date().toISOString(),
        seo_score: content.seo_score,
        readability_score: content.readability_score,
        headings: content.headings,
        faqs: content.faqs,
        images: content.images,
        schema_markup: content.schema_markup,
        status: 'published'
      };

      // In production, replace this with actual Firebase API call
      const mockDocId = `doc_${Date.now()}`;
      console.log('Publishing to Firebase:', documentData);

      const publishedUrl = config.custom_domain 
        ? `https://${config.custom_domain}/${mockDocId}`
        : `https://${config.project_id}.web.app/${mockDocId}`;

      return {
        success: true,
        platform: 'firebase',
        published_url: publishedUrl,
        cms_post_id: mockDocId,
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'firebase',
          retry_count: 0
        }
      };

    } catch (error: any) {
      throw new Error(`Firebase publish failed: ${error.message}`);
    }
  }

  /**
   * Publish to Replit
   */
  private async publishToReplit(
    content: K2WContentRecord,
    config: ReplitConfig,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      // Create content file in Replit
      const fileName = `${this.generateSlug(content.title)}.html`;
      const htmlContent = this.generateHTMLContent(content);

      // Upload file to Replit via API
      const uploadResponse = await axios.post(
        `${config.repl_url}/api/files`,
        {
          path: `content/${fileName}`,
          content: htmlContent
        },
        {
          headers: {
            'Authorization': `Bearer ${config.api_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Trigger deployment
      const deployResponse = await axios.post(
        `${config.repl_url}/api/deploy`,
        {
          branch: config.deployment_branch,
          build_command: config.build_command,
          start_command: config.start_command
        },
        {
          headers: {
            'Authorization': `Bearer ${config.api_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishedUrl = `${config.repl_url}/${fileName}`;

      return {
        success: true,
        platform: 'replit',
        published_url: publishedUrl,
        deployment_id: deployResponse.data.deployment_id,
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'replit',
          retry_count: 0
        }
      };

    } catch (error: any) {
      throw new Error(`Replit publish failed: ${error.message}`);
    }
  }

  /**
   * Publish to static hosting (GitHub Pages / HTTP Endpoint)
   */
  private async publishToStatic(
    content: K2WContentRecord,
    config: StaticConfig,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      const fileName = `${this.generateSlug(content.title)}.html`;
      const htmlContent = this.generateHTMLContent(content);

      // Check if it is a GitHub repo configuration
      const isGitHub = config.deployment_url && (
        config.deployment_url.includes('github.com') ||
        (config.api_key && config.api_key.startsWith('ghp_'))
      );

      if (isGitHub) {
        console.log(`[PublishingService] Publishing to GitHub Pages repository: ${config.deployment_url}`);
        
        // Clean URL to get owner and repo
        let owner = '';
        let repo = '';
        const cleanUrl = config.deployment_url
          .replace('https://github.com/', '')
          .replace('http://github.com/', '')
          .replace('git@github.com:', '');
        const parts = cleanUrl.split('/');
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1].replace('.git', '');
        } else {
          throw new Error(`Invalid GitHub Repository URL: ${config.deployment_url}. Use "owner/repo" or "https://github.com/owner/repo"`);
        }

        const branch = config.build_directory || 'main';
        const token = config.api_key;
        const path = fileName; // Upload to root

        const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const headers = {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'K2W-Automation-System'
        };

        // 1. Check if file exists to get SHA (for updates)
        let sha: string | undefined;
        try {
          const checkRes = await axios.get(githubApiUrl, { headers });
          if (checkRes.data && checkRes.data.sha) {
            sha = checkRes.data.sha;
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error('[GitHub API] Check existing file error:', err.message);
          }
        }

        // 2. Base64 encode the HTML content
        const base64Content = Buffer.from(htmlContent).toString('base64');

        // 3. Upload/Update file on GitHub
        const uploadResponse = await axios.put(
          githubApiUrl,
          {
            message: `Publish content: ${content.title} via K2W System`,
            content: base64Content,
            branch,
            ...(sha && { sha })
          },
          { headers }
        );

        // 4. Form public published URL
        let publishedUrl = '';
        if (config.custom_domain) {
          publishedUrl = config.custom_domain.startsWith('http') 
            ? `${config.custom_domain}/${fileName}`
            : `https://${config.custom_domain}/${fileName}`;
        } else {
          // Default GitHub Pages naming structure: https://owner.github.io/repo/filename.html
          publishedUrl = `https://${owner}.github.io/${repo}/${fileName}`;
        }

        return {
          success: true,
          platform: 'static',
          published_url: publishedUrl,
          cms_post_id: uploadResponse.data.content.sha,
          metadata: {
            publish_time: new Date().toISOString(),
            content_id: content.id,
            target_config: 'github_pages',
            retry_count: 0
          }
        };
      }

      // Default HTTP Endpoint deployment
      const deployResponse = await axios.post(
        `${config.deployment_url}/api/deploy`,
        {
          files: [
            {
              path: fileName,
              content: htmlContent,
              encoding: 'utf8'
            }
          ],
          build_directory: config.build_directory,
          cdn_enabled: config.cdn_enabled
        },
        {
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishedUrl = config.custom_domain 
        ? `https://${config.custom_domain}/${fileName}`
        : `${deployResponse.data.deployment_url}/${fileName}`;

      return {
        success: true,
        platform: 'static',
        published_url: publishedUrl,
        deployment_id: deployResponse.data.deployment_id,
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'static',
          retry_count: 0
        }
      };

    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      throw new Error(`Static hosting/GitHub Pages publish failed: ${errMsg}`);
    }
  }

  /**
   * Perform quality check before publishing
   */
  private async performQualityCheck(content: K2WContentRecord): Promise<number> {
    let score = 0;
    let checks = 0;

    // Title check
    if (content.title && content.title.length >= 30 && content.title.length <= 60) {
      score += 0.2;
    }
    checks++;

    // Meta description check
    if (content.meta_description && content.meta_description.length >= 120 && content.meta_description.length <= 160) {
      score += 0.2;
    }
    checks++;

    // Content length check
    if (content.body && content.body.length >= 300) {
      score += 0.2;
    }
    checks++;

    // Headings structure check
    if (content.headings && content.headings.length >= 2) {
      score += 0.2;
    }
    checks++;

    // Images check
    if (content.images && content.images.length >= 1) {
      score += 0.2;
    }
    checks++;

    return score;
  }

  /**
   * Backup content before publishing
   */
  private async backupContent(content: K2WContentRecord): Promise<void> {
    // Implementation would depend on your backup strategy
    // This could save to cloud storage, database, etc.
    console.log(`Backing up content: ${content.id}`);
  }

  /**
   * Log publishing attempt
   */
  private async logPublish(
    contentId: string,
    target: PublishingTarget,
    result: PublishResult,
    status: string
  ): Promise<void> {
    const logEntry: Omit<K2WPublishLogRecord, 'id'> = {
      content_id: contentId,
      target_url: result.published_url || target.name,
      platform: target.platform,
      status: status as any,
      response_data: result,
      error_message: result.error_message,
      published_at: result.success ? new Date().toISOString() : undefined,
      retry_count: result.metadata.retry_count,
      metadata: {
        deployment_id: result.deployment_id,
        cms_post_id: result.cms_post_id,
        domain: target.name
      }
    };

    // Save to database (implementation depends on your database service)
    console.log('Publish log entry:', logEntry);
  }

  /**
   * Perform post-publish actions
   */
  private async performPostPublishActions(
    content: K2WContentRecord,
    results: Record<string, PublishResult>,
    options: PublishOptions
  ): Promise<void> {
    const successfulPublishes = Object.values(results).filter(r => r.success);

    if (options.generate_sitemap) {
      await this.updateSitemap(successfulPublishes);
    }

    if (options.notify_search_engines) {
      await this.notifySearchEngines(successfulPublishes);
    }

    if (options.auto_social_share) {
      await this.shareOnSocialMedia(content, successfulPublishes);
    }
  }

  /**
   * Update sitemap with new content
   */
  private async updateSitemap(publishes: PublishResult[]): Promise<void> {
    // Implementation would generate/update XML sitemap
    console.log('Updating sitemap for:', publishes.map(p => p.published_url));
  }

  /**
   * Notify search engines of new content
   */
  private async notifySearchEngines(publishes: PublishResult[]): Promise<void> {
    for (const publish of publishes) {
      if (publish.published_url) {
        try {
          // Google Search Console API
          await axios.post(
            'https://www.googleapis.com/indexing/v3/urlNotifications',
            {
              url: publish.published_url,
              type: 'URL_UPDATED'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                // Add authorization header with service account key
              }
            }
          );

          // Bing Webmaster Tools API
          await axios.post(
            'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl',
            {
              siteUrl: new URL(publish.published_url).origin,
              url: publish.published_url
            }
          );

        } catch (error) {
          console.error('Failed to notify search engines:', error);
        }
      }
    }
  }

  /**
   * Share on social media platforms
   */
  private async shareOnSocialMedia(
    content: K2WContentRecord,
    publishes: PublishResult[]
  ): Promise<void> {
    // Implementation would integrate with social media APIs
    console.log('Sharing on social media:', content.title);
  }

  /**
   * Generate HTML content for static publishing
   */
  private generateHTMLContent(content: K2WContentRecord): string {
    return `
<!DOCTYPE html>
<html lang="${content.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.meta_title || content.title}</title>
    <meta name="description" content="${content.meta_description || ''}">
    ${content.schema_markup ? `<script type="application/ld+json">${content.schema_markup}</script>` : ''}
</head>
<body>
    <main>
        <h1>${content.title}</h1>
        ${content.body_html}
        
        ${content.faqs.length > 0 ? `
        <section class="faqs">
            <h2>Frequently Asked Questions</h2>
            ${content.faqs.map(faq => `
                <div class="faq-item">
                    <h3>${faq.question}</h3>
                    <p>${faq.answer}</p>
                </div>
            `).join('')}
        </section>
        ` : ''}
    </main>
</body>
</html>
    `.trim();
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  }

  /**
   * Extract primary keyword from content
   */
  private extractPrimaryKeyword(content: K2WContentRecord): string {
    // Simple implementation - could be enhanced with NLP
    const words = content.title.toLowerCase().split(' ');
    return words.find(word => word.length > 3) || words[0] || '';
  }

  /**
   * Upload featured image to WordPress
   */
  private async uploadWordPressFeaturedImage(
    imageUrl: string,
    config: WordPressConfig,
    postId: number
  ): Promise<number | null> {
    try {
      const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
      const uploadUrl = `${config.site_url}/wp-json/wp/v2/media`;
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      const uploadResponse = await axios.post(uploadUrl, imageResponse.data, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'image/jpeg',
          'Content-Disposition': 'attachment; filename="featured-image.jpg"'
        }
      });

      return uploadResponse.data.id;

    } catch (error) {
      console.error('Failed to upload featured image:', error);
      return null;
    }
  }

  /**
   * Update WordPress post
   */
  private async updateWordPressPost(
    config: WordPressConfig,
    postId: number,
    updateData: any
  ): Promise<void> {
    const apiUrl = `${config.site_url}/wp-json/wp/v2/posts/${postId}`;
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    await axios.post(apiUrl, updateData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Publish to Webflow CMS via Webflow API v2
   */
  private async publishToWebflow(
    content: K2WContentRecord,
    config: WebflowConfig,
    options: PublishOptions
  ): Promise<PublishResult> {
    const isMock = !config.api_token || config.api_token === 'mock_token' || config.api_token.includes('mock');
    const collectionId = config.collection_id || 'mock_collection';
    const slug = this.generateSlug(content.title);

    if (isMock) {
      // Simulation mode for demo/portfolio purposes
      console.log(`[MOCK WEBFLOW] Publishing to collection ${collectionId}`);
      const mockPostId = `wf_item_${Date.now()}`;
      const publishedUrl = `https://webflow-preview.collectivedesign.agency/${slug}`;
      
      return {
        success: true,
        platform: 'webflow',
        published_url: publishedUrl,
        cms_post_id: mockPostId,
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'webflow_mock',
          retry_count: 0
        }
      };
    }

    // Real API integration
    const apiUrl = `https://api.webflow.com/v2/collections/${collectionId}/items`;
    
    // Map fields dynamically based on configuration or fall back to standard Webflow fields
    const fieldData: Record<string, any> = {};
    const mappings = config.field_mappings || {
      title: 'name',
      slug: 'slug',
      body: 'post-body',
      featured_image: 'main-image',
      meta_description: 'summary'
    };

    fieldData[mappings.title] = content.title;
    fieldData[mappings.slug] = slug;
    fieldData[mappings.body] = this.generateAestheticTailwindLandingPage(content);
    
    if (mappings.meta_description) {
      fieldData[mappings.meta_description] = content.meta_description || '';
    }
    if (mappings.featured_image && content.images && content.images.length > 0) {
      fieldData[mappings.featured_image] = content.images[0];
    }

    try {
      const response = await axios.post(
        apiUrl,
        {
          isArchived: false,
          isDraft: options.schedule_time ? true : false,
          fieldData
        },
        {
          headers: {
            'Authorization': `Bearer ${config.api_token}`,
            'accept-version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      );

      const publishedUrl = `https://webflow.com/item/${response.data.id}`;

      return {
        success: true,
        platform: 'webflow',
        published_url: publishedUrl,
        cms_post_id: response.data.id,
        metadata: {
          publish_time: new Date().toISOString(),
          content_id: content.id,
          target_config: 'webflow_api',
          retry_count: 0
        }
      };
    } catch (error: any) {
      throw new Error(`Webflow publish failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generates a stunning, modern landing page with Outfit font and premium Tailwind styling
   */
  public generateAestheticTailwindLandingPage(content: K2WContentRecord): string {
    return generateAestheticTailwindLandingPage(content);
  }

  /**
   * Retry failed publishing attempts
   */
  async retryFailedPublish(
    contentId: string,
    targetId: string,
    maxRetries: number = 3
  ): Promise<PublishResult> {
    // Implementation would retry publishing with exponential backoff
    throw new Error('Retry functionality not implemented');
  }

  /**
   * Schedule content for future publishing
   */
  async schedulePublish(
    content: K2WContentRecord,
    targets: PublishingTarget[],
    scheduleTime: string,
    options: Partial<PublishOptions> = {}
  ): Promise<string> {
    // Implementation would use a job queue system
    const jobId = `schedule_${content.id}_${Date.now()}`;
    console.log(`Scheduled publishing job: ${jobId} for ${scheduleTime}`);
    return jobId;
  }
}

export const publishingAutomationService = new PublishingAutomationService();