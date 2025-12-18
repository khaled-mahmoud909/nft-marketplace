import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    walletAddress: string;
    username?: string;
    nftsOwned: number;
    nftsMinted: number;
  };
}
