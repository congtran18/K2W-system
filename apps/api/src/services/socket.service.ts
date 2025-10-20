/**
 * Socket Service for K2W System
 * Provides real-time workflow progress updates
 */

import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';

export interface SocketUser {
  userId: string;
  socketId: string;
  connectedAt: number;
  lastActivity: number;
}

export interface WorkflowNotification {
  type: 'workflow:started' | 'workflow:progress' | 'workflow:stage-updated' | 'workflow:completed' | 'workflow:failed';
  workflowId: string;
  userId: string;
  data: any;
  timestamp: number;
}

export class SocketService extends EventEmitter {
  private connectedUsers = new Map<string, SocketUser>();
  private userSockets = new Map<string, Set<string>>();
  
  constructor(server?: HTTPServer) {
    super();
    console.log('🔌 Socket service initialized (mock mode)');
  }

  /**
   * Send workflow update to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    console.log(`📡 [SOCKET] Sending ${event} to user ${userId}:`, {
      ...data,
      timestamp: Date.now()
    });
    
    // Emit for listeners
    this.emit('user-message', { userId, event, data });
  }

  /**
   * Send workflow progress update
   */
  sendWorkflowProgress(userId: string, workflowId: string, progress: {
    stage: string;
    status: string;
    progress: number;
    message?: string;
    totalProgress: number;
  }): void {
    console.log(`📈 [SOCKET] Workflow Progress - User: ${userId}, Workflow: ${workflowId}`, progress);
    this.sendToUser(userId, 'workflow:progress', { workflowId, ...progress });
  }

  /**
   * Send workflow stage update
   */
  sendWorkflowStageUpdate(userId: string, workflowId: string, stage: {
    name: string;
    status: string;
    progress: number;
    duration?: number;
    error?: string;
  }): void {
    console.log(`🔄 [SOCKET] Stage Update - ${stage.name}: ${stage.status} (${stage.progress}%)`);
    this.sendToUser(userId, 'workflow:stage-update', { workflowId, stage });
  }

  /**
   * Send workflow completion
   */
  sendWorkflowCompleted(userId: string, workflowId: string, result: {
    totalDuration: number;
    generatedContent: number;
    publishedUrls: string[];
    analytics?: any;
  }): void {
    console.log(`✅ [SOCKET] Workflow Completed - ${workflowId}:`, {
      duration: `${Math.round(result.totalDuration / 1000)}s`,
      content: result.generatedContent,
      urls: result.publishedUrls.length
    });
    this.sendToUser(userId, 'workflow:completed', { workflowId, result });
  }

  /**
   * Send workflow failure
   */
  sendWorkflowFailed(userId: string, workflowId: string, error: {
    stage: string;
    message: string;
    canRetry: boolean;
  }): void {
    console.log(`❌ [SOCKET] Workflow Failed - ${workflowId}: ${error.stage} - ${error.message}`);
    this.sendToUser(userId, 'workflow:failed', { workflowId, error });
  }

  /**
   * Send system notification
   */
  sendNotification(userId: string, notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    duration?: number;
    actions?: Array<{ text: string; action: string; data?: any }>;
  }): void {
    console.log(`🔔 [SOCKET] Notification for ${userId}: ${notification.title} - ${notification.message}`);
    this.sendToUser(userId, 'notification', notification);
  }

  /**
   * Broadcast to all users
   */
  broadcast(event: string, data: any): void {
    console.log(`📢 [SOCKET] Broadcasting ${event}:`, data);
    this.emit('broadcast', { event, data });
  }

  /**
   * Send queue statistics update
   */
  sendQueueStats(stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    activeWorkers: number;
  }): void {
    console.log(`📊 [SOCKET] Queue Stats:`, stats);
    this.broadcast('queue:stats', stats);
  }

  /**
   * Simulate user joining
   */
  simulateUserJoin(userId: string): void {
    const socketId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: SocketUser = {
      userId,
      socketId,
      connectedAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.connectedUsers.set(socketId, user);
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    
    console.log(`🔌 [SOCKET] User ${userId} connected (${socketId})`);
    this.emit('user-connected', { userId, socketId });
  }

  /**
   * Simulate user leaving
   */
  simulateUserLeave(userId: string): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      for (const socketId of userSocketIds) {
        this.connectedUsers.delete(socketId);
      }
      this.userSockets.delete(userId);
    }
    
    console.log(`🔌 [SOCKET] User ${userId} disconnected`);
    this.emit('user-disconnected', { userId });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get user's active connections
   */
  getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Disconnect user from all sockets
   */
  disconnectUser(userId: string): void {
    this.simulateUserLeave(userId);
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    this.connectedUsers.clear();
    this.userSockets.clear();
    this.removeAllListeners();
    console.log('✅ Socket service shutdown complete');
  }
}

export default SocketService;