export interface RequestWithUser extends Request {
  user: {
    walletAddress: string;
    username?: string;
    nftsOwned: number;
    nftsMinted: number;
  };
}
