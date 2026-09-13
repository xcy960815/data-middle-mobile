/** 指标健康状态：ok 正常、warning 警告、danger 危险、unavailable 不可用。 */
export type MetricStatus = 'ok' | 'warning' | 'danger' | 'unavailable';

/** 监控指标标识：host_ 前缀为宿主机指标，nuxt_ 前缀为应用容器（Nuxt）指标。 */
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

/** 单个监控指标的取值与展示信息。 */
export type MetricValue = {
  key: MetricKey;
  label: string;
  unit: string;
  /** 原始数值；null 表示指标当前不可用或未采集。 */
  value: number | null;
  /** 服务端已格式化的展示值，UI 直接呈现。 */
  formattedValue: string;
  status: MetricStatus;
  /** 指标数据来源采集器：node-exporter、prom-client 或 cadvisor。 */
  source: 'node-exporter' | 'prom-client' | 'cadvisor';
  description?: string;
  updatedAt: string;
};

/** 宿主机监控只读快照：服务端一次聚合生成的指标快照与采集元信息。 */
export type SnapshotResponse = {
  /** 监控数据源是否已连接；false 时页面提示“监控数据源未连接”。 */
  connected: boolean;
  timestamp: string;
  refreshIntervalSeconds: number;
  retentionDays: number;
  /** 宿主机指标组。 */
  host: MetricValue[];
  /** 应用容器（Nuxt）指标组。 */
  nuxt: MetricValue[];
  /** 可选的附加提示信息。 */
  message?: string;
};
