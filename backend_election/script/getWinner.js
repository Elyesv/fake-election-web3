const hre = require("hardhat");

async function main() {
    console.log("Récupération du gagnant de l'élection...\n");

    // Adresse du contrat déployé
    const contractAddress = "0x536B5604191f22A7a6fb5f068f6077c4AAD0B2cC";

    // Récupérer l'instance du contrat
    const Vote = await hre.ethers.getContractFactory("Vote");
    const vote = await Vote.attach(contractAddress);

    try {
        // Vérifier l'état de l'élection
        const isActive = await vote.isElectionActive();
        console.log("État de l'élection:", isActive ? "Active" : "Terminée");

        // Afficher les résultats actuels
        const [candidates, votes] = await vote.getAllVotes();
        console.log("\nRésultats actuels :");
        console.log("------------------");
        for (let i = 0; i < candidates.length; i++) {
            console.log(`${candidates[i]}: ${votes[i].toString()} vote${parseInt(votes[i].toString()) > 1 ? 's' : ''}`);
        }

        // Récupérer le gagnant
        const winner = await vote.getWinner();
        console.log("\nGagnant de l'élection:", winner);

    } catch (error) {
        console.error("\n❌ Erreur:", error.message);
        if (error.message.includes("Election is still active")) {
            console.log("\nL'élection n'est pas encore terminée.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erreur:", error);
        process.exit(1);
    }); 