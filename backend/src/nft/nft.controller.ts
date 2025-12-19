import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { GetNFTsDto } from 'src/dto/nft.dto';

@Controller('nfts')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllNFTs(
    @Query(new ValidationPipe({ transform: true })) queryDto: GetNFTsDto,
  ) {
    return this.nftService.findAll(queryDto);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.nftService.getStats();
  }

  @Get('stats/count')
  @HttpCode(HttpStatus.OK)
  async getCount() {
    return this.nftService.count();
  }

  @Get('owner/:address')
  @HttpCode(HttpStatus.OK)
  async getNFTsByOwner(
    @Param('address') address: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.nftService.findByOwner(address, page, limit);
  }

  @Get('minter/:address')
  @HttpCode(HttpStatus.OK)
  async getNFTsByMinter(
    @Param('address') address: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.nftService.findByMinter(address, page, limit);
  }

  @Get(':tokenId')
  @HttpCode(HttpStatus.OK)
  async getNFT(@Param('tokenId', ParseIntPipe) tokenId: number) {
    return this.nftService.findByTokenId(tokenId);
  }
}
