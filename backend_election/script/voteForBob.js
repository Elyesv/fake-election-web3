const hre = require("hardhat");

async function main() {
    console.log("Démarrage du processus de vote pour Bob...\n");

    // Adresse du contrat déployé
    const contractAddress = "0x536B5604191f22A7a6fb5f068f6077c4AAD0B2cC";

    // Récupérer l'instance du contrat
    const Vote = await hre.ethers.getContractFactory("Vote");
    const vote = await Vote.attach(contractAddress);

    try {
        // Récupérer les comptes disponibles
        const [owner, voter1, voter2] = await hre.ethers.getSigners();

        // Vérifier si l'élection est active
        const isActive = await vote.isElectionActive();
        if (!isActive) {
            console.log("❌ L'élection est terminée");
            return;
        } 

        // Voter pour Bob
        console.log("\nVote pour Bob en cours...");
        await vote.connect(owner).vote("Bob");
        console.log("✅ Vote pour Bob enregistré avec succès");

    } catch (error) {
        console.error("\n❌ Erreur lors du vote:", error.message);
        if (error.message.includes("Already registered")) {
            console.log("\nLe compte a déjà voté. Essayez avec un autre compte.");
        } else if (error.message.includes("You have already voted")) {
            console.log("\nLe compte a déjà voté. Essayez avec un autre compte.");
        } else if (error.message.includes("Maximum number of voters reached")) {
            console.log("\nLe nombre maximum de votants est atteint.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erreur:", error);
        process.exit(1);
    });