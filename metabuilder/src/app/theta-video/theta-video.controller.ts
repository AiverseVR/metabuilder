import { Controller, Post } from '@nestjs/common';
import { ThetaVideoService } from './theta-video.service';

@Controller('theta-video')
export class ThetaVideoController {
  constructor(private readonly thetaVideoService: ThetaVideoService) {}

  @Post('sign-url')
  async updateSpace() {
    return this.thetaVideoService.signURL();
  }
}
