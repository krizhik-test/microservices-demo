import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ReportsService } from "../services";
import { ReportGenerationQueryDto } from "../dto/request";
import { ApiGenerateReport } from "../swagger";

@Controller("reports")
@ApiTags("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("generate")
  @ApiGenerateReport()
  async generateReport(
    @Query() queryDto: ReportGenerationQueryDto,
    @Res() res: Response
  ): Promise<void> {
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
