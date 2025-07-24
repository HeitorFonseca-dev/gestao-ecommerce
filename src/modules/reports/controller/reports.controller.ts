import { ApiTags } from '@nestjs/swagger';
import { GenerateReportsService } from '../services/report-from-orders.service';
import { Controller, Get, Query } from '@nestjs/common';
import { Profile } from '../../user/enum/profiles.enum';
import { Profiles } from '../../../config/global.const';

@ApiTags('reports')
@Controller('reports')
export class GenerateReportsController {
  constructor(private readonly _reportFromOrders: GenerateReportsService) {}

  @Get('orders')
  @Profiles(Profile.Admin)
  async getReportFromOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<string> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this._reportFromOrders.getReportFromOrders(start, end);
  }
}
