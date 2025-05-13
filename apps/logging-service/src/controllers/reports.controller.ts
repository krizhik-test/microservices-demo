import { Controller, Get, Query, Res, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ReportsService } from "../services/reports.service";
import { ReportGenerationQueryDto } from "../dto/report-generation-query.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";
import { ApiGenerateReport } from "../swagger/reports.swagger";

@Controller("reports")
@ApiTags("reports")
@UseInterceptors(ApiLogInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("generate")
  @ApiGenerateReport()
  async generateReport(
    @Query() queryDto: ReportGenerationQueryDto,
    @Res() res: Response
  ) {
    const { buffer, filename } = await this.reportsService.generateReport(
      queryDto
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Content-Length": buffer.length,
    });

    res.end(buffer);
  }
}
