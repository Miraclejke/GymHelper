import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { RestController } from './rest.controller';
import { RestService } from './rest.service';

@Module({
  imports: [DashboardModule],
  controllers: [RestController],
  providers: [RestService],
})
export class RestModule {}
