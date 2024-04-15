import { UserDocument } from '@app/users/user.schema';
import { UseAuth } from '@common/decorators/request.decorator';
import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/')
  @Render('dashboard')
  @UseAuth()
  async renderDashboard(@Req() req: Request, @Query('action') action: string) {
    const data = await this.dashboardService.getDashboardData(req.user as UserDocument);
    return {
      title: 'Dashboard',
      modal: action === 'create',
      isAuthenticated: true,
      name: (req.user as UserDocument)?.name || '',
      ...data,
    };
  }
}
