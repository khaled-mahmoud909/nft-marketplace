import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { UpdateUserDto } from 'src/dto/user.dto';
import { NFT, NFTDocument } from 'src/schemas/nft.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
  ) {}

  async findByAddress(walletAddress: string): Promise<UserDocument> {
    const address = walletAddress.toLowerCase();

    let user = await this.userModel.findOne({ walletAddress: address }).exec();

    if (!user) {
      const nftsOwned = await this.nftModel
        .countDocuments({ owner: address })
        .exec();
      const nftsMinted = await this.nftModel
        .countDocuments({ minter: address })
        .exec();

      user = await this.userModel.create({
        walletAddress: address,
        nftsOwned,
        nftsMinted,
      });
    }

    return user;
  }

  async getUserProfile(walletAddress: string) {
    const user = await this.findByAddress(walletAddress);

    const nftsOwned = await this.nftModel
      .countDocuments({ owner: user.walletAddress })
      .exec();
    const nftsMinted = await this.nftModel
      .countDocuments({ minter: user.walletAddress })
      .exec();

    const recentMints = await this.nftModel
      .find({ minter: user.walletAddress })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('tokenId name imageUrl createdAt')
      .lean()
      .exec();

    return {
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      nftsOwned,
      nftsMinted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      recentMints,
    };
  }

  async updateProfile(
    walletAddress: string,
    updateDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const address = walletAddress.toLowerCase();

    if (updateDto.username) {
      const existingUser = await this.userModel
        .findOne({
          username: updateDto.username,
          walletAddress: { $ne: address },
        })
        .exec();

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { walletAddress: address },
        { $set: updateDto },
        { new: true, upsert: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserNFTs(walletAddress: string, page = 1, limit = 12) {
    const address = walletAddress.toLowerCase();

    const filter: QueryFilter<NFTDocument> = { owner: address };

    const total = await this.nftModel.countDocuments(filter).exec();

    const totalPages = Math.ceil(total / limit);

    const nfts = await this.nftModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    return {
      nfts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserMintedNFTs(walletAddress: string, page = 1, limit = 12) {
    const address = walletAddress.toLowerCase();

    const filter: QueryFilter<NFTDocument> = { minter: address };

    const total = await this.nftModel.countDocuments(filter).exec();

    const totalPages = Math.ceil(total / limit);

    const nfts = await this.nftModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    return {
      nfts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAll(page = 1, limit = 12) {
    const total = await this.userModel.countDocuments().exec();

    const totalPages = Math.ceil(total / limit);

    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    return {
      users,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async exists(walletAddress: string): Promise<boolean> {
    const address = walletAddress.toLowerCase();
    const count = await this.userModel
      .countDocuments({ walletAddress: address })
      .exec();
    return count > 0;
  }

  async getUserStats(walletAddress: string) {
    const address = walletAddress.toLowerCase();

    const nftsOwned = await this.nftModel
      .countDocuments({ owner: address })
      .exec();
    const nftsMinted = await this.nftModel
      .countDocuments({ minter: address })
      .exec();

    return {
      nftsOwned,
      nftsMinted,
      totalValueOwned: 0,
    };
  }
}
