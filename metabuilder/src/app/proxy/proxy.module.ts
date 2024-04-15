import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
