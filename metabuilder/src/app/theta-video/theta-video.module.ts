import { Module } from '@nestjs/common';
import { ThetaVideoController } from './theta-video.controller';
import { ThetaVideoService } from './theta-video.service';

@Module({
  imports: [],
  controllers: [ThetaVideoController],
  providers: [ThetaVideoService],
  exports: [ThetaVideoService],
})
export class ThetaVideoModule {}
