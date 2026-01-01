import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NFT, NFTSchema } from 'src/schemas/nft.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: NFT.name, schema: NFTSchema },
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
