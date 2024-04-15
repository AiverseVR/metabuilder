import { SpaceService } from '@app/spaces/space.service';
import { UserDocument } from '@app/users/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(private readonly spaceSerive: SpaceService) {}

  async getDashboardData(user: UserDocument) {
    const spaces = await this.spaceSerive.getSpacesByOwner(user._id, 'name slug previewImage');
    return { spaces };
  }
}
