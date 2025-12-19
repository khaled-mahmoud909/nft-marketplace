import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Username is too short. Minimum length is 3 characters.',
  })
  @MaxLength(20, {
    message: 'Username is too long. Maximum length is 20 characters.',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain alphanumeric characters and underscores.',
  })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address.' })
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
