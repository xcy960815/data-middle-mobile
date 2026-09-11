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
