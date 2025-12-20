import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TransactionType } from 'src/schemas/transaction.schema';

export class GetTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'Type must be either "mint" or "transfer".',
  })
  type?: TransactionType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tokenId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface TransactionListResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  transactions: any[];
}

export interface TransactionStatsDto {
  totalTransactions: number;
  totalMints: number;
  totalTransfers: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}
