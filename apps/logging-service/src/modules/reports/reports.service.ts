import { Injectable } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as PDFDocument from 'pdfkit';
import { TimeSeriesService } from '../timeseries/timeseries.service';
import { ReportGenerationQueryDto } from './dto/request';
import {
  CHART_CANVAS_CONFIG,
  ChartQueryParams,
  createChartConfig,
  getRandomColor,
} from '../../configs/chart.config';
import {
  PDF_DOCUMENT_CONFIG,
  PDF_CHART_CONFIG,
  PDF_TEXT_STYLES,
  generateReportFilename,
  formatQueryParamsForPdf,
} from '../../configs/pdf.config';
import { calculateStatistics } from '../../utils';

@Injectable()
export class ReportsService {
  private readonly chartJSCanvas: ChartJSNodeCanvas;

  constructor(private readonly timeSeriesService: TimeSeriesService) {
    this.chartJSCanvas = new ChartJSNodeCanvas(CHART_CANVAS_CONFIG);
  }

  async generateReport(
    reportQueryDto: ReportGenerationQueryDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const queryParams: ChartQueryParams = {
      type: reportQueryDto.type || 'All Types',
      service: reportQueryDto.service || 'All Services',
      endpoint: reportQueryDto.endpoint || 'All Endpoints',
      method: reportQueryDto.method || 'All Methods',
      eventType: reportQueryDto.eventType || 'All Event Types',
      startDate: reportQueryDto.startDate,
      endDate: reportQueryDto.endDate,
    };

    let timeSeriesData = [];
    try {
      timeSeriesData = await this.timeSeriesService.queryTimeSeries(
        reportQueryDto,
      );
    } catch (error) {
      console.error('Error querying time series data:', error.message);
      timeSeriesData = [];
    }

    const doc = new PDFDocument(PDF_DOCUMENT_CONFIG);
    const buffers: Buffer[] = [];

    doc.on('data', (buffer) => buffers.push(buffer));
    doc
      .fontSize(PDF_TEXT_STYLES.title.fontSize)
      .text('Performance Report', { align: PDF_TEXT_STYLES.title.align });
    doc.moveDown();

    const metadataLines = formatQueryParamsForPdf(queryParams);
    metadataLines.forEach((line) => {
      doc.fontSize(PDF_TEXT_STYLES.metadata.fontSize).text(line);
    });

    doc.moveDown();

    try {
      const chartBuffer = await this.generateTimeSeriesChart(
        timeSeriesData,
        queryParams,
      );
      if (chartBuffer) {
        doc.image(chartBuffer, PDF_CHART_CONFIG);
      }
    } catch (error) {
      console.error('Error generating chart:', error);
      doc.fontSize(12).text('Error generating chart', { align: 'center' });
    }
    doc.moveDown(2);

    doc.addPage();
    doc
      .fontSize(PDF_TEXT_STYLES.section.fontSize)
      .text('Summary', { align: PDF_TEXT_STYLES.section.align });
    doc.moveDown();

    const stats = calculateStatistics(timeSeriesData);
    doc
      .fontSize(PDF_TEXT_STYLES.content.fontSize)
      .text(`Total Data Points: ${stats.totalDataPoints}`);
    doc
      .fontSize(PDF_TEXT_STYLES.content.fontSize)
      .text(`Average Value: ${stats.average.toFixed(2)}`);
    doc
      .fontSize(PDF_TEXT_STYLES.content.fontSize)
      .text(`Minimum Value: ${stats.min.toFixed(2)}`);
    doc
      .fontSize(PDF_TEXT_STYLES.content.fontSize)
      .text(`Maximum Value: ${stats.max.toFixed(2)}`);
    doc
      .fontSize(PDF_TEXT_STYLES.content.fontSize)
      .text(`Standard Deviation: ${stats.stdDev.toFixed(2)}`);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        const filename = generateReportFilename();
        resolve({ buffer, filename });
      });
    });
  }

  private async generateTimeSeriesChart(
    timeSeriesData: any[],
    queryParams: any,
  ): Promise<Buffer | null> {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return null;
    }

    try {
      const labels = [];
      const datasets = [];

      const allTimestamps = new Set<number>();
      timeSeriesData.forEach((series) => {
        if (series.data && series.data.length > 0) {
          series.data.forEach((point) => {
            allTimestamps.add(point.timestamp);
          });
        }
      });

      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      sortedTimestamps.forEach((timestamp) => {
        const date = new Date(timestamp);
        labels.push(date.toLocaleTimeString());
      });

      timeSeriesData.forEach((series, index) => {
        if (!series.data || series.data.length === 0) {
          return;
        }

        const valueMap = {};
        series.data.forEach((point) => {
          valueMap[point.timestamp] = point.value;
        });

        const dataValues = sortedTimestamps.map((timestamp) => {
          return valueMap[timestamp] || null;
        });

        datasets.push({
          label: series.labels?.endpoint || series.key || `Series ${index + 1}`,
          data: dataValues,
          borderColor: getRandomColor(),
          backgroundColor: getRandomColor(0.2),
          borderWidth: 2,
          pointRadius: 3,
          fill: false,
        });
      });

      if (datasets.length === 0) {
        return null;
      }

      const chartConfig = createChartConfig(labels, datasets, queryParams);

      return await this.chartJSCanvas.renderToBuffer(chartConfig);
    } catch (error) {
      console.error('Error generating chart:', error);
      return null;
    }
  }
}
