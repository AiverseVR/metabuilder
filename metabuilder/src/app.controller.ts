import { SpaceService } from '@app/spaces/space.service';
import { UseOptionalAuth } from '@common/decorators/request.decorator';
import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly spaceSerivce: SpaceService) {}

  @Get()
  @Render('index')
  @UseOptionalAuth()
  async getHello(@Req() req: Request) {
    const spaces = await this.spaceSerivce.getListSpace();
    return {
      title: 'Home',
      spaces,
      isAuthenticated: !!req.user,
    };
  }
}
