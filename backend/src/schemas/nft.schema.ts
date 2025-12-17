import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NFT {
  @Prop({ required: true, unique: true })
  tokenId: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  metadataUrl: string;

  @Prop({ required: true, lowercase: true })
  minter: string;

  @Prop({ required: true, lowercase: true })
  owner: string;

  @Prop({ required: true })
  transactionHash: string;

  @Prop()
  blockNumber?: number;
}

export type NFTDocument = NFT & Document;
export const NFTSchema = SchemaFactory.createForClass(NFT);

NFTSchema.index({ tokenId: 1 });
NFTSchema.index({ owner: 1 });
NFTSchema.index({ minter: 1 });
NFTSchema.index({ name: 'text', description: 'text' });
