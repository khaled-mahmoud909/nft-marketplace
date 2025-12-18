import * as SimpleNFTArtifact from './SimpleNFT.json';

export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = SimpleNFTArtifact.abi;
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || '';
