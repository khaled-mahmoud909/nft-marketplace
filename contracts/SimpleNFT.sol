// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Store minter for each token
    mapping(uint256 => address) public tokenMinter;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId, 
        address indexed minter, 
        string tokenURI,
        uint256 timestamp
    );
    
    constructor() ERC721("SimpleNFT", "SNFT") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    /**
     * @dev Mint a new NFT
     * @param recipient Address that will own the NFT
     * @param tokenURI Metadata URI (IPFS or HTTP link)
     */
    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        tokenMinter[newTokenId] = msg.sender;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev Get total number of NFTs minted
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get the original minter of a token
     */
    function getMinter(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMinter[tokenId];
    }
    
    /**
     * @dev Get all token IDs owned by an address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
}