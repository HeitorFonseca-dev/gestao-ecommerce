import { ApiTags } from '@nestjs/swagger';
import { GenerateReportsService } from '../services/report-from-orders.service';
import { Controller, Get, Query } from '@nestjs/common';

@ApiTags('reports')
@Controller('reports')
export class GenerateReportsController {
  constructor(private readonly _reportFromOrders: GenerateReportsService) {}

  @Get('orders')
  async getReportFromOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<string> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this._reportFromOrders.getReportFromOrders(start, end);
  }
}
