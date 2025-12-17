import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TransactionType {
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  transactionHash: string;

  @Prop({ required: true, enum: Object.values(TransactionType) })
  type: TransactionType;

  @Prop({ lowercase: true })
  from?: string;

  @Prop({ lowercase: true, required: true })
  to: string;

  @Prop({ required: true })
  tokenId: number;

  @Prop()
  blockNumber?: number;

  @Prop({ required: true })
  timestamp: Date;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ transactionHash: 1 });
TransactionSchema.index({ tokenId: 1 });
TransactionSchema.index({ from: 1 });
TransactionSchema.index({ to: 1 });
TransactionSchema.index({ timestamp: -1 });
