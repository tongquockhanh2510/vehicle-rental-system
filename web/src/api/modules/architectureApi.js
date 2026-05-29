import apiClient from '../client';

const mockHealth = {
  gateway: { status: 'HEALTHY', latency_ms: 34, rate_limiter: 'ACTIVE', retry_policy: '3-5s exponential backoff' },
  services: [
    { key: 'user-service', status: 'HEALTHY', latency_ms: 52 },
    { key: 'vehicle-service', status: 'HEALTHY', latency_ms: 61 },
    { key: 'rental-service', status: 'WARNING', latency_ms: 88 },
    { key: 'contract-service', status: 'HEALTHY', latency_ms: 57 },
    { key: 'tracking-service', status: 'HEALTHY', latency_ms: 70 },
    { key: 'inspection-service', status: 'HEALTHY', latency_ms: 64 },
    { key: 'payment-service', status: 'HEALTHY', latency_ms: 73 },
    { key: 'dispute-service', status: 'WARNING', latency_ms: 92 },
    { key: 'review-service', status: 'HEALTHY', latency_ms: 51 },
    { key: 'statistic-service', status: 'HEALTHY', latency_ms: 47 },
    { key: 'notification-service', status: 'HEALTHY', latency_ms: 66 },
    { key: 'config-service', status: 'HEALTHY', latency_ms: 42 }
  ],
  redis: { status: 'HEALTHY', hit_rate: 91.7, object_crud_ms: 3.6 },
  rabbitmq: { status: 'HEALTHY', queue_length: 28, event_rate_per_min: 194 },
  jwt: { enabled: true, access_token_ttl: '60m' },
  docker_compose: { running_services: 13, expected_services: 13 }
};

export const architectureApi = {
  async getSystemHealth() {
    try {
      return await apiClient.get('/api/statistics/system-health');
    } catch {
      return { data: mockHealth };
    }
  },

  async getArchitectureOverview() {
    try {
      return await apiClient.get('/api/statistics/architecture-overview');
    } catch {
      return {
        data: {
          context: 'Web App -> API Gateway -> Microservices -> MongoDB/Redis/RabbitMQ',
          tradeoffs: [
            'Microservices tăng độ linh hoạt triển khai độc lập, đổi lại chi phí vận hành cao hơn monolith.',
            'Redis cải thiện hiệu năng đọc, cần chiến lược invalidation chặt chẽ.',
            'RabbitMQ tách luồng bất đồng bộ, cần theo dõi queue để tránh tồn đọng sự kiện.'
          ],
          advantages: [
            'Scalability theo từng service',
            'Fault isolation tốt hơn',
            'CI/CD theo service độc lập'
          ],
          disadvantages: [
            'Độ phức tạp vận hành cao',
            'Observability khó hơn',
            'Đồng bộ schema/event cần governance'
          ],
          compare_monolith: [
            'Monolith phát triển ban đầu nhanh hơn cho team nhỏ.',
            'Microservices phù hợp khi traffic tăng và domain tách biệt rõ.'
          ]
        }
      };
    }
  },

  async getSystemLogs() {
    try {
      return await apiClient.get('/api/statistics/system-logs');
    } catch {
      return {
        data: [
          { id: 'ARCH-001', level: 'INFO', message: 'Gateway rate limiter active at 120 req/min per IP', timestamp: new Date().toISOString() },
          { id: 'ARCH-002', level: 'WARN', message: 'Queue rental.created backlog > 20 events', timestamp: new Date(Date.now() - 12 * 60000).toISOString() }
        ]
      };
    }
  }
};
