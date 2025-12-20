import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from 'ethers';
import { Model, QueryFilter } from 'mongoose';
import {
  GetTransactionsDto,
  TransactionStatsDto,
} from 'src/dto/transaction.dto';
import { NFT, NFTDocument } from 'src/schemas/nft.schema';
import { TransactionDocument } from 'src/schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
  ) {}

  async findAll(queryDto: GetTransactionsDto) {
    const {
      type,
      address,
      tokenId,
      page = 1,
      limit = 20,
      sortOrder = 'desc',
    } = queryDto;

    const filter: QueryFilter<TransactionDocument> = {};

    if (type) {
      filter.type = type;
    }

    if (tokenId !== undefined) {
      filter.tokenId = tokenId;
    }

    if (address) {
      const lowercaseAddress = address.toLowerCase();
      filter.$or = [{ from: lowercaseAddress }, { to: lowercaseAddress }];
    }

    const total = await this.transactionModel.countDocuments(filter).exec();

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const enrishedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const nft = await this.nftModel
          .findOne({ tokenId: tx.tokenId })
          .select('name imageUrl')
          .lean()
          .exec();
        return {
          ...tx,
          nft: nft ? { name: nft.name, imageUrl: nft.imageUrl } : null,
        };
      }),
    );

    return {
      transactions: enrishedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByHash(transactionHash: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findOne({ transactionHash })
      .exec();

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with hash ${transactionHash} not found`,
      );
    }

    return transaction;
  }

  async findByTokenId(tokenId: number, page = 1, limit = 20) {
    const filter: QueryFilter<TransactionDocument> = { tokenId };

    const total = await this.transactionModel.countDocuments(filter).exec();

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const nft = await this.nftModel
      .findOne({ tokenId })
      .select('name imageUrl')
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      nft,
      transactions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByAddress(address: string, page = 1, limit = 20) {
    const lowercaseAddress = address.toLowerCase();

    const filter: QueryFilter<TransactionDocument> = {
      $or: [{ from: lowercaseAddress }, { to: lowercaseAddress }],
    };

    const total = await this.transactionModel.countDocuments(filter).exec();

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const enrishedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const nft = await this.nftModel
          .findOne({ tokenId: tx.tokenId })
          .select('name imageUrl')
          .lean()
          .exec();
        return {
          ...tx,
          nft: nft ? { name: nft.name, imageUrl: nft.imageUrl } : null,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: enrishedTransactions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStats(): Promise<TransactionStatsDto> {
    const totalTransactions = await this.transactionModel
      .countDocuments()
      .exec();

    const totalMints = await this.transactionModel
      .countDocuments({ type: 'mint' })
      .exec();

    const totalTransfers = await this.transactionModel
      .countDocuments({ type: 'transfer' })
      .exec();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last24Hours = await this.transactionModel
      .countDocuments({
        timestamp: { $gte: oneDayAgo },
      })
      .exec();

    const last7Days = await this.transactionModel
      .countDocuments({
        timestamp: { $gte: sevenDaysAgo },
      })
      .exec();

    const last30Days = await this.transactionModel
      .countDocuments({
        timestamp: { $gte: thirtyDaysAgo },
      })
      .exec();

    return {
      totalTransactions,
      totalMints,
      totalTransfers,
      last24Hours,
      last7Days,
      last30Days,
    };
  }

  async getRecent(limit = 10) {
    const transactions = await this.transactionModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();

    const enrishedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const nft = await this.nftModel
          .findOne({ tokenId: tx.tokenId })
          .select('name imageUrl')
          .lean()
          .exec();

        return {
          ...tx,
          nft: nft ? { name: nft.name, imageUrl: nft.imageUrl } : null,
        };
      }),
    );

    return enrishedTransactions;
  }

  async getNFTHistory(tokenId: number) {
    const transactions = await this.transactionModel
      .find({ tokenId })
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    const nft = await this.nftModel
      .findOne({ tokenId })
      .select('name imageUrl')
      .lean()
      .exec();

    if (!nft) {
      throw new NotFoundException(`NFT with tokenId ${tokenId} not found`);
    }

    const ownershipChain = transactions.map((tx, index) => ({
      step: index + 1,
      type: tx.type,
      from: tx.from || 'Genesis (Minted)',
      to: tx.to,
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
    }));

    return {
      nft,
      currentOwner: nft.owner,
      OrignialMinter: nft.minter,
      ownershipChain,
      totalTransfers: ownershipChain.length,
    };
  }
}
