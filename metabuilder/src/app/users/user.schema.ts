import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthProvider, Role } from './user.const';

@Schema({ _id: false })
export class Provider {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  provider: AuthProvider;
}

const ProviderSchema = SchemaFactory.createForClass(Provider);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, select: false })
  password: string;

  @Prop({ type: [ProviderSchema], default: [] })
  providers: Provider[];

  @Prop({ default: Role.USER })
  role: number;

  @Prop({ select: false })
  __v: number;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
