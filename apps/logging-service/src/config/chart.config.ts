export const CHART_CANVAS_CONFIG = {
  width: 800,
  height: 400,
  backgroundColour: "white",
};

export interface ChartDatasetConfig {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  pointRadius: number;
  fill: boolean;
}

export interface ChartQueryParams {
  type: string;
  service: string;
  endpoint: string;
  method: string;
  eventType: string;
  startDate: string;
  endDate: string;
}

export const createChartConfig = (
  labels: string[],
  datasets: ChartDatasetConfig[],
  queryParams: ChartQueryParams
) => {
  return {
    type: "line" as const,
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Execution Time (ms)",
          },
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: `${queryParams.type} Performance Data`,
          font: {
            size: 18,
          },
        },
        subtitle: {
          display: true,
          text: `Service: ${queryParams.service} | Endpoint: ${
            queryParams.endpoint
          } | Method: ${queryParams.method}${
            queryParams.eventType !== "All Event Types"
              ? ` | Event Type: ${queryParams.eventType}`
              : ""
          }`,
          font: {
            size: 14,
          },
          padding: {
            bottom: 10,
          },
        },
        legend: {
          position: "bottom" as const,
        },
      },
    },
  };
};

export const getRandomColor = (alpha = 1): string => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
