import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetNFTsDto, NFTListResponseDto, NFTStatsDto } from 'src/dto/nft.dto';
import { NFT, NFTDocument } from 'src/schemas/nft.schema';

@Injectable()
export class NftService {
  constructor(@InjectModel(NFT.name) private nftModel: Model<NFTDocument>) {}

  async findAll(queryDto: GetNFTsDto): Promise<NFTListResponseDto> {
    const {
      search,
      owner,
      minter,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (owner) {
      filter.owner = owner.toLowerCase();
    }

    if (minter) {
      filter.minter = minter.toLowerCase();
    }

    const total = await this.nftModel.countDocuments(filter);

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const nfts = await this.nftModel
      .find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      nfts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByTokenId(tokenId: number): Promise<NFTDocument> {
    const nft = await this.nftModel.findOne({ tokenId }).exec();

    if (!nft) {
      throw new NotFoundException(`NFT with tokenId ${tokenId} not found`);
    }

    return nft;
  }

  async findByOwner(owner: string, page: number = 1, limit: number = 12) {
    const filter = { owner: owner.toLowerCase() };

    const total = await this.nftModel.countDocuments(filter);

    const nfts = await this.nftModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      nfts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByMinter(minter: string, page: number = 1, limit: number = 12) {
    const filter = { minter: minter.toLowerCase() };

    const total = await this.nftModel.countDocuments(filter);

    const nfts = await this.nftModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      nfts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStats(): Promise<NFTStatsDto> {
    const totalNFTs = await this.nftModel.countDocuments();
    const totalOwners = (await this.nftModel.distinct('owner')).length;
    const totalMinters = (await this.nftModel.distinct('minter')).length;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMints = await this.nftModel.countDocuments({
      createdAt: { $gte: oneDayAgo },
    });

    return {
      totalNFTs,
      totalOwners,
      totalMinters,
      recentMints,
    };
  }

  async count(): Promise<{ total: number }> {
    const total = await this.nftModel.countDocuments();
    return { total };
  }

  async exists(tokenId: number): Promise<boolean> {
    const count = await this.nftModel.countDocuments({ tokenId });
    return count > 0;
  }
}
