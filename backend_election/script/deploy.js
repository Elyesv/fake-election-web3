const hre = require("hardhat");

async function main() {
  // Get the Safe contract factory
  const Vote = await hre.ethers.getContractFactory("Vote");

  // Deploy the contract
  const vote = await Vote.deploy();
  await vote.waitForDeployment();

  // Log the contract address
  console.log("Vote contract deployed to:", await vote.getAddress());
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

