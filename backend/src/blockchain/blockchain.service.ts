import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from 'src/contracts/contractInfo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NFT, NFTDocument } from 'src/schemas/nft.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from 'src/schemas/transaction.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { NFTMetadata } from 'src/interfaces/metadata.interface';
import { BlockchainEventLog } from 'src/interfaces/blockchainEvents.interface';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    // Inject Mongoose models for NFT, Transaction, and User
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.initializeBlockchain();
    await this.startEventListeners();
  }

  private async initializeBlockchain() {
    try {
      const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
      const contractAddress =
        this.configService.get<string>('CONTRACT_ADDRESS');

      if (!rpcUrl || !contractAddress) {
        throw new Error(
          'Missing required configuration: SEPOLIA_RPC_URL or CONTRACT_ADDRESS',
        );
      }

      this.logger.log(`Connecting to Sepolia RPC at ${rpcUrl}`);

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      const network = await this.provider.getNetwork();
      this.logger.log(
        `Connected to network: ${network.name} (chainId: ${network.chainId})`,
      );

      this.contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        this.provider,
      );

      const name = (await this.contract.name()) as string;
      const symbol = (await this.contract.symbol()) as string;
      this.logger.log(
        `Connected to contract: ${name} (${symbol}) at address ${contractAddress}`,
      );
    } catch (error) {
      this.logger.error('Error initializing blockchain connection', error);
      throw error;
    }
  }

  private async startEventListeners() {
    this.logger.log('Starting event listeners for blockchain events');

    void this.contract.on(
      'NFTMinted',
      (
        tokenId,
        minter: string,
        tokenURI: string,
        timestamp,
        event: BlockchainEventLog,
      ) => {
        void (async () => {
          this.logger.log(
            `NFTMinted event detected: tokenId=${tokenId}, minter=${minter}`,
          );

          try {
            await this.handleNFTMinted(
              Number(tokenId),
              minter,
              tokenURI,
              Number(timestamp),
              event.log.transactionHash,
              event.log.blockNumber,
            );
          } catch (error) {
            // eslint-disable-next-line prettier/prettier
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Error handling NFTMinted event', errorMessage);
          }
        })();
      },
    );

    await this.syncPastEvents();
  }

  private async handleNFTMinted(
    tokenId: number,
    minter: string,
    tokenURI: string,
    timestamp: number,
    transactionHash: string,
    blockNumber: number,
  ) {
    const existingNFT = await this.nftModel.findOne({ tokenId });
    if (existingNFT) {
      this.logger.log(`NFT with tokenId=${tokenId} already exists in DB`);
      return;
    }

    let metadata: NFTMetadata = {
      name: `NFT #${tokenId}`,
      description: '',
      image: '',
    };
    if (tokenURI.startsWith('http')) {
      try {
        const response = await fetch(tokenURI);
        if (response.ok) {
          metadata = (await response.json()) as NFTMetadata;
        } else {
          this.logger.warn(
            `Failed to fetch metadata from ${tokenURI}: ${response.statusText}`,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Error fetching metadata from ${tokenURI}: ${errorMessage}`,
        );
      }
    }

    await this.nftModel.create({
      tokenId,
      name: metadata.name || `NFT #${tokenId}`,
      description: metadata.description || '',
      imageUrl: metadata.image || '',
      metadataUrl: tokenURI,
      minter: minter.toLowerCase(),
      owner: minter.toLowerCase(),
      transactionHash,
      blockNumber,
    });

    this.logger.log(`Saving new NFT to database: ${tokenId}`);

    await this.transactionModel.create({
      transactionHash,
      type: TransactionType.MINT,
      to: minter.toLowerCase(),
      tokenId,
      blockNumber,
      timestamp: new Date(timestamp * 1000),
    });

    await this.updateUserStats(minter.toLowerCase());

    this.logger.log('Created NFT and transaction record successfully');
  }

  private async updateUserStats(walletAddress: string) {
    const nftsOwned = await this.nftModel.countDocuments({
      owner: walletAddress,
    });
    const nftsMinted = await this.nftModel.countDocuments({
      minter: walletAddress,
    });

    await this.userModel.findOneAndUpdate(
      { walletAddress },
      {
        walletAddress,
        nftsOwned,
        nftsMinted,
      },
      { upsert: true, new: true },
    );
  }

  private async syncPastEvents() {
    this.logger.log('Syncing past NFTMinted events from blockchain');

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      const fillter = this.contract.filters.NFTMinted();
      const events = await this.contract.queryFilter(
        fillter,
        fromBlock,
        currentBlock,
      );

      this.logger.log(`Found ${events.length} past NFTMinted events`);

      for (const event of events) {
        if ('args' in event) {
          const [tokenId, minter, tokenURI, timestamp] = event.args;

          await this.handleNFTMinted(
            Number(tokenId),
            String(minter),
            String(tokenURI),
            Number(timestamp),
            event.transactionHash,
            event.blockNumber,
          );
        }
      }

      this.logger.log('Finished syncing past NFTMinted events');
    } catch (error) {
      this.logger.error('Error syncing past NFTMinted events', error);
    }
  }

  getContract() {
    return this.contract;
  }

  getProvider() {
    return this.provider;
  }

  async getTotalSupply(): Promise<number> {
    const totalSupply = (await this.contract.getTotalSupply()) as number;
    return totalSupply;
  }

  async getTokenURI(tokenId: number): Promise<string> {
    const tokenURI = (await this.contract.tokenURI(tokenId)) as string;
    return tokenURI;
  }

  async getOwnerOf(tokenId: number): Promise<string> {
    const owner = (await this.contract.ownerOf(tokenId)) as string;
    return owner;
  }
}
