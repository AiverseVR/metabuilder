import { User } from '@app/users/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Space {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: 'https://via.placeholder.com/800x400' })
  previewImage: string;

  @Prop({ required: false, default: false })
  isVR: boolean;

  @Prop({ required: false })
  spawnPoint: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true, type: MSSchema.Types.Mixed, default: [] })
  entities: any;

  @Prop({ required: true, ref: User.name })
  createdBy: MSSchema.Types.ObjectId;
}

export type SpaceDocument = Space & Document;
export const SpaceSchema = SchemaFactory.createForClass(Space);
