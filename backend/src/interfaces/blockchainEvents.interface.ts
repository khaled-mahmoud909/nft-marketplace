export interface NFTMintedEvent {
  tokenId: bigint;
  minter: string;
  tokenURI: string;
  timestamp: bigint;
}

export interface BlockchainEventLog {
  log: {
    transactionHash: string;
    blockNumber: number;
  };
}
