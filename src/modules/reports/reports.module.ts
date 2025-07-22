import { Module } from '@nestjs/common';
import { GenerateReportsController } from './controller/reports.controller';
import { GenerateReportsService } from './services/report-from-orders.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GenerateReportsController],
  providers: [GenerateReportsService],
  exports: [GenerateReportsService],
})
export class ReportsModule {}
