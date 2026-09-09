import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Text, View } from 'react-native';

import type { AnalysisChartType } from '@/features/analysis/types';

type Props = { type: AnalysisChartType; rows: Record<string, unknown>[] };

const COLORS = ['#397cf0', '#65c7d8', '#806de1', '#f29f67', '#48bd8c'];

function numberValue(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ReadonlyChart({ type, rows }: Props) {
  if (type === 'table') return <ReadonlyTable rows={rows} />;
  if (type === 'kpiCard') return <KpiCard rows={rows} />;
  if (type === 'pie') return <PieChart rows={rows} />;
  if (type === 'funnel') return <FunnelChart rows={rows} />;

  const values = rows.slice(0, 12).map((row) => numberValue(Object.values(row).at(-1)));
  const max = Math.max(...values, 1);
  const width = 720;
  const height = 320;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map(
    (value, index) => `${index * step},${height - (value / max) * 250 - 20}`,
  );
  const isBar = type === 'interval' || type === 'stacked' || type === 'combo';

  return (
    <View className="h-[320px] w-full overflow-hidden rounded-2xl border border-[#dce7f3] bg-white p-3">
      <Svg height="100%" viewBox={`0 0 ${width} ${height}`} width="100%">
        {[70, 145, 220, 295].map((y) => (
          <Line key={y} stroke="#e4edf7" strokeWidth="1" x1="0" x2={width} y1={y} y2={y} />
        ))}
        {isBar ? (
          values.map((value, index) => {
            const barWidth = Math.max(12, step * 0.55);
            const barHeight = (value / max) * 250;
            return (
              <Rect
                key={index}
                fill={COLORS[index % COLORS.length]}
                height={barHeight}
                rx="5"
                width={barWidth}
                x={index * step - barWidth / 2}
                y={height - barHeight - 20}
              />
            );
          })
        ) : (
          <Path d={`M ${points.join(' L ')}`} fill="none" stroke="#397cf0" strokeWidth="4" />
        )}
        {!isBar &&
          values.map((value, index) => (
            <Circle
              key={index}
              cx={index * step}
              cy={height - (value / max) * 250 - 20}
              fill="#397cf0"
              r="5"
            />
          ))}
      </Svg>
    </View>
  );
}

function KpiCard({ rows }: { rows: Record<string, unknown>[] }) {
  const value = rows[0] ? Object.values(rows[0]).find((item) => typeof item === 'number') : 0;
  return (
    <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
      <Text className="text-4xl font-black text-[#397cf0]">{String(value ?? 0)}</Text>
      <Text className="mt-2 text-xs text-[#7b8aa0]">当前指标</Text>
    </View>
  );
}

function PieChart({ rows }: { rows: Record<string, unknown>[] }) {
  const values = rows.slice(0, 5).map((row) => numberValue(Object.values(row).at(-1)));
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let offset = 0;
  return (
    <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-5">
      <Svg height="220" viewBox="0 0 220 220" width="220">
        <Circle
          cx="110"
          cy="110"
          fill="none"
          r="75"
          stroke="#edf3fa"
          strokeWidth="36"
          transform="rotate(-90 110 110)"
        />
        {values.map((value, index) => {
          const length = (value / total) * 471;
          const dash = `${length} ${471 - length}`;
          const current = offset;
          offset += length;
          return (
            <Circle
              key={index}
              cx="110"
              cy="110"
              fill="none"
              r="75"
              stroke={COLORS[index % COLORS.length]}
              strokeDasharray={dash}
              strokeDashoffset={-current}
              strokeWidth="36"
              transform="rotate(-90 110 110)"
            />
          );
        })}
      </Svg>
      <Text className="text-xs text-[#7b8aa0]">数据占比</Text>
    </View>
  );
}

function FunnelChart({ rows }: { rows: Record<string, unknown>[] }) {
  const values = rows.slice(0, 5).map((row) => numberValue(Object.values(row).at(-1)));
  const max = Math.max(...values, 1);
  return (
    <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-5">
      {values.map((value, index) => (
        <View
          key={index}
          className="h-9 self-center rounded bg-[#397cf0]"
          style={{ opacity: 1 - index * 0.12, width: `${Math.max(20, (value / max) * 100)}%` }}
        />
      ))}
    </View>
  );
}

function ReadonlyTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = Object.keys(rows[0] ?? {});
  return (
    <View className="overflow-hidden rounded-2xl border border-[#dce7f3] bg-white">
      <View className="flex-row bg-[#edf5ff]">
        {columns.map((column) => (
          <Text key={column} className="min-w-[130px] flex-1 p-3 text-xs font-black text-[#425b7c]">
            {column}
          </Text>
        ))}
      </View>
      {rows.slice(0, 30).map((row, index) => (
        <View key={index} className="flex-row border-t border-[#edf1f6]">
          {columns.map((column) => (
            <Text
              key={column}
              numberOfLines={1}
              className="min-w-[130px] flex-1 p-3 text-xs text-[#5f7088]"
            >
              {String(row[column] ?? '')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
