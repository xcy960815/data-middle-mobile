export type MetricStatus = 'ok' | 'warning' | 'danger' | 'unavailable';

export type MetricKey =
  | 'host_cpu_usage'
  | 'host_memory_usage'
  | 'host_disk_usage'
  | 'host_load'
  | 'host_uptime'
  | 'nuxt_container_cpu_usage'
  | 'nuxt_container_memory_usage'
  | 'nuxt_node_memory_usage'
  | 'nuxt_log_disk_usage';

export type MetricValue = {
  key: MetricKey;
  label: string;
  unit: string;
  value: number | null;
  formattedValue: string;
  status: MetricStatus;
  source: 'node-exporter' | 'prom-client' | 'cadvisor';
  description?: string;
  updatedAt: string;
};

export type SnapshotResponse = {
  connected: boolean;
  timestamp: string;
  refreshIntervalSeconds: number;
  retentionDays: number;
  host: MetricValue[];
  nuxt: MetricValue[];
  message?: string;
};
