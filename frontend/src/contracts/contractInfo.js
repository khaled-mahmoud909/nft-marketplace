import SimpleNFTArtifact from './SimpleNFT.json';

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = SimpleNFTArtifact.abi;

// Export full artifact if needed
export const SimpleNFT = SimpleNFTArtifact;