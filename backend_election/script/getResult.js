const hre = require("hardhat");

async function main() {
    console.log("Récupération des résultats du vote...\n");

    // Récupérer l'adresse du contrat déployé
    const contractAddress = "0x536B5604191f22A7a6fb5f068f6077c4AAD0B2cC"; // Remplacez par l'adresse de votre contrat

    try {
        // Vérifier si l'adresse est valide
        if (!hre.ethers.isAddress(contractAddress)) {
            throw new Error("Adresse du contrat invalide");
        }

        // Récupérer l'instance du contrat
        const Vote = await hre.ethers.getContractFactory("Vote");
        const vote = await Vote.attach(contractAddress);

        // Vérifier si le contrat est déployé à cette adresse
        const code = await hre.ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("Aucun contrat n'est déployé à cette adresse");
        }

        try {
            // Récupérer l'état de l'élection
            const isActive = await vote.isElectionActive();
            console.log("État de l'élection:", isActive ? "En cours" : "Terminée");

            // Récupérer le nombre de votants
            const voterCount = await vote.voterCount();
            console.log("Nombre de votants:", voterCount.toString(), "/ 2\n");

            // Récupérer les candidats et leurs votes
            const [candidates, votes] = await vote.getAllVotes();

            // Afficher les résultats de manière formatée
            console.log("=== RÉSULTATS DU VOTE ===");
            console.log("------------------------");
            
            let totalVotes = 0;
            for (let i = 0; i < candidates.length; i++) {
                const voteCount = votes[i].toString();
                totalVotes += parseInt(voteCount);
                console.log(`${candidates[i]}: ${voteCount} vote${parseInt(voteCount) > 1 ? 's' : ''}`);
            }
            
            console.log("------------------------");
            console.log(`Total des votes: ${totalVotes}`);
            console.log("========================");

            // Si l'élection est terminée, afficher le gagnant
            if (!isActive) {
                let maxVotes = 0;
                let winners = [];
                
                for (let i = 0; i < votes.length; i++) {
                    const voteCount = parseInt(votes[i].toString());
                    if (voteCount > maxVotes) {
                        maxVotes = voteCount;
                        winners = [candidates[i]];
                    } else if (voteCount === maxVotes) {
                        winners.push(candidates[i]);
                    }
                }

                if (winners.length === 1) {
                    console.log(`\n🏆 Gagnant: ${winners[0]} avec ${maxVotes} vote${maxVotes > 1 ? 's' : ''}`);
                } else {
                    console.log("\n⚠️ Égalité entre les candidats suivants:");
                    winners.forEach(winner => {
                        console.log(`- ${winner}`);
                    });
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'interaction avec le contrat:", error.message);
            console.log("\nVérifiez que :");
            console.log("1. L'adresse du contrat est correcte");
            console.log("2. Le contrat est bien déployé sur le réseau spécifié");
            console.log("3. Vous êtes connecté au bon réseau (localhost/sepolia)");
        }
    } catch (error) {
        console.error("Erreur:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erreur lors de la récupération des résultats:", error);
        process.exit(1);
    });