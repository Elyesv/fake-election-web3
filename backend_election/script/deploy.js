const hre = require("hardhat");

async function main() {
  console.log("Démarrage du déploiement sur Sepolia...");

  const Vote = await hre.ethers.getContractFactory("Vote");
  const candidates = ["Alice", "Bob", "John"];

  console.log("Déploiement du contrat avec les candidats:", candidates);
  const vote = await Vote.deploy(candidates);
  
  console.log("Attente de la confirmation de la transaction...");
  await vote.waitForDeployment();
  
  const address = await vote.getAddress();
  console.log("Contrat Vote déployé avec succès sur Sepolia!");
  console.log("Adresse du contrat:", address);
  console.log("Candidats initialisés:", candidates);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement:", error);
    process.exit(1);
  });

