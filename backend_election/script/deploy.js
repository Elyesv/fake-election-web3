const hre = require("hardhat");

async function main() {
  const Vote = await hre.ethers.getContractFactory("Vote");

  const candidates = ["Alice", "Bob", "John"];

  const vote = await Vote.deploy(candidates);
  await vote.waitForDeployment();

  // Log the contract address
  console.log("Vote contract deployed to:", await vote.getAddress());
  console.log("Candidates initialized:", candidates);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

