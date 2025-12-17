import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  walletAddress: string;

  @Prop()
  username?: string;

  @Prop()
  email?: string;

  @Prop({ default: 0 })
  nftsOwned: number;

  @Prop({ default: 0 })
  nftsMinted: number;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ walletAddress: 1 });
