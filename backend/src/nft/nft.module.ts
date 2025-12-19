import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NFT, NFTSchema } from 'src/schemas/nft.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: NFT.name, schema: NFTSchema }])],
  providers: [NftService],
  controllers: [NftController],
  exports: [NftService],
})
export class NftModule {}
