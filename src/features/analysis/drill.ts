import type { AnalysisDimension, AnalysisFilter } from './types';

type DrillValue = string | number | boolean | null;

type DimensionDrillRule = {
  enabled?: boolean;
  role?: string;
  value?: DrillValue;
};

type DrillPathItem = {
  dimension: AnalysisDimension;
  value: DrillValue;
};

function hasDrillValue(value: unknown): value is DrillValue {
  return value !== null && typeof value !== 'undefined' && value !== '';
}

function isDrillDimension(dimension: AnalysisDimension): boolean {
  const drillRule = dimension.dimensionRule?.drill as DimensionDrillRule | undefined;
  return drillRule?.enabled !== false && (!drillRule?.role || drillRule.role === 'level');
}

function setDimensionDrillValue(
  dimension: AnalysisDimension,
  value: DrillValue | undefined,
): AnalysisDimension {
  const drillRule = dimension.dimensionRule?.drill as DimensionDrillRule | undefined;
  return {
    ...dimension,
    dimensionRule: {
      ...dimension.dimensionRule,
      drill: { ...drillRule, value },
    },
  };
}

function repairDrillDimensions(dimensions: AnalysisDimension[]): AnalysisDimension[] {
  const drillIndexes = dimensions.reduce<number[]>(
    (indexes, dimension, index) => (isDrillDimension(dimension) ? [...indexes, index] : indexes),
    [],
  );
  const drillIndexSet = new Set(drillIndexes);
  const maxPersistedPathLength = Math.max(drillIndexes.length - 1, 0);
  let acceptsPathValue = true;
  let persistedPathLength = 0;

  return dimensions.map((dimension, index) => {
    const drillValue = (dimension.dimensionRule?.drill as DimensionDrillRule | undefined)?.value;

    if (!drillIndexSet.has(index)) {
      return hasDrillValue(drillValue) ? setDimensionDrillValue(dimension, undefined) : dimension;
    }

    if (
      !acceptsPathValue ||
      persistedPathLength >= maxPersistedPathLength ||
      !hasDrillValue(drillValue)
    ) {
      acceptsPathValue = false;
      return hasDrillValue(drillValue) ? setDimensionDrillValue(dimension, undefined) : dimension;
    }

    persistedPathLength += 1;
    return dimension;
  });
}

function buildDrillFilters(drillPath: DrillPathItem[]): AnalysisFilter[] {
  return drillPath.map(({ dimension, value }) => ({
    ...dimension,
    filterRule: { aggregation: 'raw', operator: 'eq', operand: value == null ? '' : String(value) },
    displayName:
      dimension.displayName || dimension.columnComment || dimension.columnName || '钻取路径',
  }));
}

function filterValidQueryFilters(filters: AnalysisFilter[]): AnalysisFilter[] {
  return filters.filter((item) => {
    const rule = item.filterRule as
      { aggregation?: unknown; operator?: unknown; operand?: unknown } | undefined;
    return Boolean(rule?.aggregation && (rule.operator || rule.operand));
  });
}

/**
 * 按维度钻取规则整理图表查询条件：修复钻取路径残留值，并把已走过的路径转换为等值筛选。
 *
 * 仅钻取规则未显式关闭（drill.enabled 不为 false）且角色为 'level'（或未设置）的维度
 * 参与钻取。修复时清除非钻取维度上残留的钻取值；钻取值只接受从第一个可钻取维度开始
 * 连续的前缀，中断之后的残留值以及最后一个可钻取维度上的值都会被清除。当可钻取维度
 * 多于一个时视为启用钻取：查询维度收窄为钻取路径的下一层（路径已走完时仍返回全部
 * 修复后维度），并把路径逐层转换为 aggregation 'raw'、operator 'eq' 的筛选条件，
 * 追加到 filters 末尾。
 *
 * @param {object} params - 图表配置中的维度与筛选条件。
 * @param {AnalysisDimension[]} params.dimensions - 图表配置的维度列表，可含残留钻取值。
 * @param {AnalysisFilter[]} params.filters - 图表配置的筛选条件；缺少聚合方式或算子的
 *   无效项会被丢弃。
 * @returns {{ dimensions: AnalysisDimension[]; filters: AnalysisFilter[] }} 整理后的
 *   查询维度与筛选条件，可直接用作 AnalysisDataQueryRequest 的对应字段。
 */
export function resolveAnalysisDrillQueryFields(params: {
  dimensions: AnalysisDimension[];
  filters: AnalysisFilter[];
}): { dimensions: AnalysisDimension[]; filters: AnalysisFilter[] } {
  const repairedDimensions = repairDrillDimensions(params.dimensions || []);
  const drillDimensions = repairedDimensions.filter(isDrillDimension);
  const drillPath: DrillPathItem[] = [];

  for (const dimension of drillDimensions) {
    const value = (dimension.dimensionRule?.drill as DimensionDrillRule | undefined)?.value;
    if (!hasDrillValue(value)) break;
    drillPath.push({ dimension, value: value as DrillValue });
  }

  const isDrillQueryEnabled = drillDimensions.length > 1;
  const currentDrillDimension = drillDimensions[drillPath.length];

  return {
    dimensions:
      isDrillQueryEnabled && currentDrillDimension ? [currentDrillDimension] : repairedDimensions,
    filters: [
      ...filterValidQueryFilters(params.filters || []),
      ...(isDrillQueryEnabled ? buildDrillFilters(drillPath) : []),
    ],
  };
}
