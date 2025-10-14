# K2W Analytics Implementation Strategy

## Hybrid Approach: Mock + Real Data

### Current Status
- ✅ **Real Data**: AI services, Database operations, Authentication
- 🔄 **Mock Data**: Analytics, Performance metrics, Trend calculations
- 🎯 **Target**: Configurable real/mock data based on environment

## Implementation Plan

### Phase 1: Environment Configuration
```typescript
// apps/api/src/config/analytics.config.ts
export const analyticsConfig = {
  mode: process.env.ANALYTICS_MODE || 'mock', // 'real' | 'mock' | 'hybrid'
  providers: {
    googleAnalytics: {
      enabled: process.env.GA_ENABLED === 'true',
      apiKey: process.env.GA_API_KEY,
      viewId: process.env.GA_VIEW_ID
    },
    ahrefs: {
      enabled: process.env.AHREFS_ENABLED === 'true',
      apiKey: process.env.AHREFS_API_KEY
    },
    semrush: {
      enabled: process.env.SEMRUSH_ENABLED === 'true',
      apiKey: process.env.SEMRUSH_API_KEY
    }
  }
};
```

### Phase 2: Service Abstraction
```typescript
// Analytics Factory Pattern
export class AnalyticsServiceFactory {
  static create(): IAnalyticsService {
    if (analyticsConfig.mode === 'real') {
      return new RealAnalyticsService();
    }
    return new MockAnalyticsService();
  }
}

interface IAnalyticsService {
  getTrafficData(siteId: string): Promise<TrafficData>;
  getKeywordRankings(keywords: string[]): Promise<KeywordRankings>;
  getSEOMetrics(url: string): Promise<SEOMetrics>;
}
```

### Phase 3: Cost Management
```typescript
// Rate limiting và caching cho real APIs
export class CachedAnalyticsService implements IAnalyticsService {
  private cache = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  async getTrafficData(siteId: string): Promise<TrafficData> {
    const cacheKey = `traffic-${siteId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    const data = await this.realAnalyticsService.getTrafficData(siteId);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
}
```

## Cost Analysis

### Mock Data Benefits:
- ✅ Zero API costs
- ✅ Unlimited requests
- ✅ Predictable performance
- ✅ Development friendly
- ✅ Demo ready

### Real Data Benefits:
- ✅ Accurate business insights
- ✅ Real-time performance tracking
- ✅ Actual keyword rankings
- ✅ True traffic metrics
- ✅ Client trust

### Recommended Approach:

1. **Development**: 100% Mock
2. **Staging**: Hybrid (real data với limited calls)
3. **Production**: 
   - Free tier: Mock với real database
   - Paid tier: Full real analytics
   - Enterprise: Real + advanced features

## Technical Implementation

### Environment Variables
```bash
# Development
ANALYTICS_MODE=mock

# Staging  
ANALYTICS_MODE=hybrid
GA_ENABLED=true
GA_API_KEY=limited_key

# Production
ANALYTICS_MODE=real
GA_ENABLED=true
GA_API_KEY=production_key
AHREFS_ENABLED=true
AHREFS_API_KEY=production_key
```

### Service Selection Logic
```typescript
export class AnalyticsService {
  private service: IAnalyticsService;

  constructor() {
    this.service = AnalyticsServiceFactory.create();
  }

  async getProjectAnalytics(projectId: string) {
    // Always get real database data
    const dbData = await this.getDatabaseAnalytics(projectId);
    
    // Get external analytics based on config
    const externalData = await this.service.getExternalAnalytics(projectId);
    
    return {
      ...dbData,
      ...externalData,
      dataSource: analyticsConfig.mode
    };
  }
}
```

## Conclusion

**Recommended Strategy**: Hybrid approach với configuration-based switching

- **Keep mock data** cho development và demo
- **Implement real data** cho production với proper caching
- **Use environment variables** để control data source
- **Gradual migration** từ mock sang real based on business needs

Cost-effective và maintain flexibility cho different use cases.