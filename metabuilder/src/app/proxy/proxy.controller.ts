import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  get(@Query('url') url: string, @Res() res: Response) {
    return this.proxyService.get(url, res);
  }
}
