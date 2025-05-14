import { ChartQueryParams } from "./chart.config";

export const PDF_DOCUMENT_CONFIG = {
  margin: 50,
} as const;

export const PDF_CHART_CONFIG = {
  fit: [500, 300] as [number, number],
  align: "center" as "center" | "right",
} as const;

export interface PdfTextStyles {
  title: {
    fontSize: number;
    align: "center" | "left" | "right";
  };
  subtitle: {
    fontSize: number;
    align: "center" | "left" | "right";
  };
  metadata: {
    fontSize: number;
  };
  section: {
    fontSize: number;
    align: "center" | "left" | "right";
  };
  content: {
    fontSize: number;
  };
}

export const PDF_TEXT_STYLES: PdfTextStyles = {
  title: {
    fontSize: 25,
    align: "center",
  },
  subtitle: {
    fontSize: 18,
    align: "center",
  },
  metadata: {
    fontSize: 12,
  },
  section: {
    fontSize: 18,
    align: "center",
  },
  content: {
    fontSize: 12,
  },
};

export const generateReportFilename = (): string => {
  return `report-${Date.now()}.pdf`;
};

export const formatQueryParamsForPdf = (
  queryParams: ChartQueryParams
): string[] => {
  const lines = [
    `Generated: ${new Date().toISOString()}`,
    `Time Range: ${queryParams.startDate} to ${queryParams.endDate}`,
    `Data Type: ${queryParams.type}`,
    `Service: ${queryParams.service}`,
    `Endpoint: ${queryParams.endpoint}`,
    `Method: ${queryParams.method}`,
  ];

  if (queryParams.eventType !== "All Event Types") {
    lines.push(`Event Type: ${queryParams.eventType}`);
  }

  return lines;
};
