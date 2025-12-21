import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import * as crypto from 'crypto';
import { Nonce, NonceDocument } from 'src/schemas/nonce.schema';
import { AuthLoginDto, AuthResponseDto, JwtPayload } from 'src/dto/auth.dto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Nonce.name) private readonly nonceModel: Model<NonceDocument>,
  ) {}

  async getNonce(
    walletAddress: string,
  ): Promise<{ nonce: string; message: string }> {
    const address = walletAddress.toLowerCase();

    const nonce = `nonce_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;

    const message = `Welcome to NFT Marketplace!\n\nSign this message to authenticate your wallet.\n\nNonce: ${nonce}\n\nThis request will expire in 5 minutes.`;

    await this.nonceModel.create({
      walletAddress: address,
      nonce,
      used: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return { nonce, message };
  }

  async login(loginDto: AuthLoginDto): Promise<AuthResponseDto> {
    const { walletAddress, signature, message } = loginDto;

    const address = walletAddress.toLowerCase();

    const nonceMatch = message.match(/Nonce: (nonce_[a-f0-9]+_\d+)/);
    if (!nonceMatch) {
      throw new BadRequestException('Invalid message format');
    }
    const nonce = nonceMatch[1];

    const nonceRecord = await this.nonceModel.findOne({
      walletAddress: address,
      nonce,
      used: false,
    });

    if (!nonceRecord) {
      throw new UnauthorizedException(
        'Invalid or expired nonce. Please request a new nonce and try again.',
      );
    }

    if (nonceRecord.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Nonce has expired. Please request a new nonce and try again.',
      );
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (error) {
      throw new UnauthorizedException('Failed to verify signature' + error);
    }

    if (recoveredAddress.toLowerCase() !== address) {
      throw new UnauthorizedException(
        'Signature does not match wallet address',
      );
    }

    await this.nonceModel.updateOne(
      { _id: nonceRecord._id },
      { $set: { used: true } },
    );

    const user = await this.userService.findByAddress(address);

    const payload: JwtPayload = {
      walletAddress: address,
      sub: user._id.toString(),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        nftsOwned: user.nftsOwned,
        nftsMinted: user.nftsMinted,
      },
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token' + error);
    }
  }

  async getCurrentUser(walletAddress: string) {
    return this.userService.getUserProfile(walletAddress);
  }
}
