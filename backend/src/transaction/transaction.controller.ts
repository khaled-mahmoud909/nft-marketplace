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
import { TransactionService } from './transaction.service';
import { GetTransactionsDto } from 'src/dto/transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTransactions(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: GetTransactionsDto,
  ) {
    return this.transactionService.findAll(queryDto);
  }
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.transactionService.getStats();
  }

  @Get('recent')
  @HttpCode(HttpStatus.OK)
  async getRecent(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.transactionService.getRecent(limit);
  }

  @Get('token/:tokenId')
  @HttpCode(HttpStatus.OK)
  async getTransactionById(
    @Param('tokenId', ParseIntPipe) tokenId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.transactionService.findByTokenId(tokenId, page, limit);
  }

  @Get('token/:tokenId/history')
  @HttpCode(HttpStatus.OK)
  async getNFTHistory(@Param('tokenId', ParseIntPipe) tokenId: number) {
    return this.transactionService.getNFTHistory(tokenId);
  }

  @Get('address/:address')
  @HttpCode(HttpStatus.OK)
  async getTransactionByAddress(
    @Param('address') address: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.transactionService.findByAddress(address, page, limit);
  }

  @Get(':hash')
  @HttpCode(HttpStatus.OK)
  async getTransaction(@Param('hash') hash: string) {
    return this.transactionService.findByHash(hash);
  }
}
