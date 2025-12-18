import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class UserProfileDto {
  walletAddress: string;
  username?: string;
  email?: string;
  nftsOwned: number;
  nftsMinted: number;
  createdAt: Date;
  updatedAt: Date;
}
