export interface TimeSeriesStatistics {
  totalDataPoints: number;
  min: number;
  max: number;
  average: number;
  stdDev: number;
}

export const calculateStatistics = (
  timeSeriesData: any[],
): TimeSeriesStatistics => {
  let totalDataPoints = 0;
  const allValues: number[] = [];

  // Extract all values from all series
  timeSeriesData.forEach((series) => {
    if (series.data && series.data.length > 0) {
      totalDataPoints += series.data.length;
      series.data.forEach((point) => {
        if (typeof point.value === 'number') {
          allValues.push(point.value);
        }
      });
    }
  });

  if (allValues.length === 0) {
    return {
      totalDataPoints: 0,
      min: 0,
      max: 0,
      average: 0,
      stdDev: 0,
    };
  }

  // Calculate statistics
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const sum = allValues.reduce((acc, val) => acc + val, 0);
  const average = sum / allValues.length;

  // Calculate standard deviation
  const squaredDiffs = allValues.map((value) => {
    const diff = value - average;
    return diff * diff;
  });
  const avgSquaredDiff =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    totalDataPoints,
    min,
    max,
    average,
    stdDev,
  };
};
