/**
 * Socket Client for K2W Frontend
 * Handles real-time workflow progress updates
 */

import { EventEmitter } from 'events';

export interface WorkflowProgress {
  jobId: string;
  stage: string;
  status: string;
  progress: number;
  message?: string;
  totalProgress: number;
}

export interface WorkflowResult {
  websiteUrl: string;
  pages: number;
  seoScore: number;
  publishedAt: string;
}

export interface SocketClient {
  connect(userId: string): void;
  disconnect(): void;
  isConnected(): boolean;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
}

// Mock Socket Client for development
export class MockSocketClient extends EventEmitter implements SocketClient {
  private userId?: string;
  private connected = false;
  private mockTimer?: NodeJS.Timeout;

  connect(userId: string): void {
    this.userId = userId;
    this.connected = true;
    
    console.log(`[SOCKET CLIENT] Connected as user: ${userId}`);
    this.emit('connected', { userId });
    
    // Simulate random workflow updates for demo
    this.startMockUpdates();
  }

  disconnect(): void {
    this.connected = false;
    this.userId = undefined;
    
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = undefined;
    }
    
    console.log('[SOCKET CLIENT] Disconnected');
    this.emit('disconnected');
    this.removeAllListeners();
  }

  isConnected(): boolean {
    return this.connected;
  }

  private startMockUpdates(): void {
    // Simulate receiving workflow updates every 10 seconds for demo
    this.mockTimer = setInterval(() => {
      if (!this.connected) return;

      const mockEvents = [
        'workflow:progress',
        'workflow:stage-update',
        'notification'
      ];

      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      
      switch (randomEvent) {
        case 'workflow:progress':
          this.emit('workflow:progress', {
            jobId: 'demo_workflow_123',
            stage: 'content_generation',
            status: 'active',
            progress: Math.floor(Math.random() * 100),
            message: 'Generating content...',
            totalProgress: Math.floor(Math.random() * 100)
          });
          break;

        case 'workflow:stage-update':
          this.emit('workflow:stage-update', {
            jobId: 'demo_workflow_123',
            stage: {
              name: 'seo_optimization',
              status: 'completed',
              progress: 100,
              duration: 5000
            }
          });
          break;

        case 'notification':
          this.emit('notification', {
            type: 'info',
            title: 'Workflow Update',
            message: 'Your website is being generated...',
            duration: 5000
          });
          break;
      }
    }, 10000);
  }
}

// Real Socket Client (when socket.io is installed)
export class RealSocketClient extends EventEmitter implements SocketClient {
  private socket?: unknown; // Would be Socket from socket.io-client
  private userId?: string;

  connect(userId: string): void {
    // This would use real socket.io-client
    console.log(`[SOCKET CLIENT] Would connect with real Socket.IO for user: ${userId}`);
    
    // For now, fall back to mock
    const mockClient = new MockSocketClient();
    mockClient.connect(userId);
    
    // Proxy events
    mockClient.on('workflow:progress', (data) => this.emit('workflow:progress', data));
    mockClient.on('workflow:completed', (data) => this.emit('workflow:completed', data));
    mockClient.on('workflow:failed', (data) => this.emit('workflow:failed', data));
    mockClient.on('notification', (data) => this.emit('notification', data));
  }

  disconnect(): void {
    console.log('[SOCKET CLIENT] Real socket disconnected');
  }

  isConnected(): boolean {
    return false; // Mock implementation
  }
}

// Factory function
export function createSocketClient(useReal: boolean = false): SocketClient {
  return useReal ? new RealSocketClient() : new MockSocketClient();
}

// Hook for React components
export function useSocketClient() {
  const client = createSocketClient();
  
  const connect = (uid: string) => {
    client.connect(uid);
  };

  const disconnect = () => {
    client.disconnect();
  };

  const subscribe = (event: string, callback: (...args: unknown[]) => void) => {
    client.on(event, callback);
    
    // Return unsubscribe function
    return () => client.off(event, callback);
  };

  return {
    client,
    connect,
    disconnect,
    subscribe,
    isConnected: client.isConnected()
  };
}

export default MockSocketClient;