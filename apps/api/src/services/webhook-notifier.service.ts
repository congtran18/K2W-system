import axios from 'axios';
import { K2WContentRecord } from '@k2w/database';

export class WebhookNotifierService {
  private defaultWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';

  /**
   * Send notification to Slack channel
   */
  async notifySlack(
    event: 'review_requested' | 'approved' | 'rejected' | 'published',
    content: K2WContentRecord,
    details?: { feedback?: string; url?: string; platform?: string }
  ): Promise<boolean> {
    const webhookUrl = this.defaultWebhookUrl;
    
    if (!webhookUrl || webhookUrl.includes('mock_webhook') || webhookUrl === '') {
      console.log(`[MOCK WEBHOOK] Triggered event: ${event} for content: "${content.title}"`);
      return true;
    }

    let title = '';
    let color = '#36a64f';
    let fields: Array<{ title: string; value: string; short: boolean }> = [];

    switch (event) {
      case 'review_requested':
        title = `📝 *Yêu cầu duyệt bài viết mới*`;
        color = '#e2a100'; // Yellow/Orange
        fields = [
          { title: 'Tiêu đề', value: content.title, short: false },
          { title: 'Từ khóa', value: content.keyword_id, short: true },
          { title: 'Số từ', value: `${content.word_count || 0} từ`, short: true },
          { title: 'Trạng thái', value: 'Chờ kiểm duyệt (REVIEWING)', short: true }
        ];
        break;
      case 'approved':
        title = `✅ *Bài viết đã được phê duyệt*`;
        color = '#2eb886'; // Green
        fields = [
          { title: 'Tiêu đề', value: content.title, short: false },
          { title: 'Người duyệt', value: 'Biên tập viên Agency', short: true },
          { title: 'SEO Score', value: `${content.seo_score || 0}/100`, short: true }
        ];
        break;
      case 'rejected':
        title = `❌ *Yêu cầu sửa đổi bài viết*`;
        color = '#a30200'; // Red
        fields = [
          { title: 'Tiêu đề', value: content.title, short: false },
          { title: 'Lý do từ chối', value: details?.feedback || 'Nội dung cần tối ưu thêm.', short: false }
        ];
        break;
      case 'published':
        title = `🚀 *Bài viết đã được xuất bản trực tuyến!*`;
        color = '#1d9bf0'; // Blue
        fields = [
          { title: 'Tiêu đề', value: content.title, short: false },
          { title: 'Nền tảng', value: details?.platform?.toUpperCase() || 'Webflow', short: true },
          { title: 'Đường dẫn', value: details?.url || 'N/A', short: false }
        ];
        break;
    }

    const payload = {
      text: title,
      attachments: [
        {
          color,
          fields,
          footer: 'CDA × K2W Workflow Automation Engine',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return true;
    } catch (error: any) {
      console.error('Failed to send Slack notification:', error.message);
      return false;
    }
  }
}

export const webhookNotifierService = new WebhookNotifierService();
