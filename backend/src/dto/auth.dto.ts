import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class GetNonceDto {
  @IsEthereumAddress({ message: 'Invalid Ethereum wallet address' })
  @IsNotEmpty()
  walletAddress: string;
}

export class AuthLoginDto {
  @IsEthereumAddress({ message: 'Invalid Ethereum wallet address' })
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
  refreshToken?: string;
  user: {
    walletAddress: string;
    username?: string;
    nftsOwned: number;
    nftsMinted: number;
  };
  expiresIn: number;
}

export interface JwtPayload {
  walletAddress: string;
  sub: string;
  iat?: number;
  exp?: number;
}
