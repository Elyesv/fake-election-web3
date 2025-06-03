const hre = require("hardhat");

async function main() {
    console.log("Démarrage de la réinitialisation de l'élection...\n");

    // Adresse du contrat déployé
    const contractAddress = "0x536B5604191f22A7a6fb5f068f6077c4AAD0B2cC";

    // Récupérer l'instance du contrat
    const Vote = await hre.ethers.getContractFactory("Vote");
    const vote = await Vote.attach(contractAddress);

    try {
        // Récupérer le compte owner
        const [owner] = await hre.ethers.getSigners();

        // Afficher les résultats actuels
        const [candidates, votes] = await vote.getAllVotes();
        console.log("\nRésultats avant réinitialisation :");
        console.log("------------------");
        for (let i = 0; i < candidates.length; i++) {
            console.log(`${candidates[i]}: ${votes[i].toString()} vote${parseInt(votes[i].toString()) > 1 ? 's' : ''}`);
        }

        // Réinitialiser l'élection
        console.log("\nRéinitialisation de l'élection...");
        await vote.connect(owner).restartElection();
        console.log("✅ Élection réinitialisée avec succès");


    } catch (error) {
        console.error("\n❌ Erreur lors de la réinitialisation:", error.message);
        if (error.message.includes("Only admin can call this function")) {
            console.log("\nSeul l'admin peut réinitialiser l'élection.");
        } else if (error.message.includes("Election is already active")) {
            console.log("\nL'élection est déjà active.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erreur:", error);
        process.exit(1);
    }); 