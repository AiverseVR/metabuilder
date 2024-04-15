import { SpaceModule } from '@app/spaces/space.module';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SpaceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
