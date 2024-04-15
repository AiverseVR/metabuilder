import { UserDocument } from '@app/users/user.schema';
import { slugify } from '@common/utils/string';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { getTemplate } from './space.const';
import { CreateSpaceDto, UpdateSpaceDto } from './space.dto';
import { Space, SpaceDocument } from './space.schema';

@Injectable()
export class SpaceService {
  constructor(@InjectModel(Space.name) private readonly spaceModel: Model<SpaceDocument>) {}

  async createSpace(user: UserDocument, spaceDto: CreateSpaceDto): Promise<SpaceDocument> {
    const space = new this.spaceModel(spaceDto);
    space.slug = slugify(space.slug);
    space.createdBy = user._id;
    const { entities, previewImage } = getTemplate(spaceDto.template);
    space.entities = entities;
    space.previewImage = previewImage;
    try {
      await space.save();
      return space;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Space with slug ${space.slug} already exists`);
      }
      throw error;
    }
  }

  async getSpaceBySlug(slug: string, throwOnError = true): Promise<SpaceDocument> {
    const space = await this.spaceModel.findOne({ slug });
    if (!space && throwOnError) {
      throw new Error(`Space with slug ${slug} not found`);
    }
    return space;
  }

  async getSpacesByOwner(owner: Schema.Types.ObjectId, select: string): Promise<SpaceDocument[]> {
    return this.spaceModel
      .find({
        owner,
      })
      .select(select);
  }

  async updateSpace(slug: string, spaceDto: UpdateSpaceDto): Promise<SpaceDocument> {
    const space = await this.getSpaceBySlug(slug);
    if (!space) {
      throw new Error(`Space with slug ${slug} not found`);
    }
    if (spaceDto.name) {
      space.name = spaceDto.name;
    }
    if (spaceDto.previewImage) {
      space.previewImage = spaceDto.previewImage;
    }
    if (spaceDto.entities) {
      space.entities = spaceDto.entities;
    }
    await space.save();
    return space;
  }

  async getListSpace(): Promise<SpaceDocument[]> {
    return this.spaceModel.find({});
  }
}
