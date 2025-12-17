const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the contract factory
  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  
  // Deploy the contract
  console.log("Deploying SimpleNFT contract...");
  const nft = await SimpleNFT.deploy();
  
  // Wait for deployment to complete
  await nft.waitForDeployment();
  
  const contractAddress = await nft.getAddress();
  
  console.log("✅ SimpleNFT deployed to:", contractAddress);
  console.log("\n📝 Save this address! You'll need it for the backend and frontend.");
  console.log("\n🔗 View on Sepolia Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Verify deployment by calling a function
  const name = await nft.name();
  const symbol = await nft.symbol();
  const totalSupply = await nft.getTotalSupply();
  
  console.log("\n📊 Contract Info:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", totalSupply.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });