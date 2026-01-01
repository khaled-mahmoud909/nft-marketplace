import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Nonce {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  nonce: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Date })
  expiresAt: Date;
}
export type NonceDocument = Nonce & Document;
export const NonceSchema = SchemaFactory.createForClass(Nonce);

NonceSchema.index({ walletAddress: 1 });
NonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
