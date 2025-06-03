const hre = require("hardhat");

async function main() {
    console.log("Démarrage du test du contrat Vote...");

    const Vote = await hre.ethers.getContractFactory("Vote");
    const vote = await Vote.deploy();
    await vote.waitForDeployment();
    console.log("Contrat Vote déployé à l'adresse:", await vote.getAddress());

    const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();

    console.log("\nTest 1: Vérification des candidats initiaux");
    const candidates = await vote.getAllCandidates();
    console.log("Candidats:", candidates);

    console.log("\nTest 2: Enregistrement des votants");
    await vote.connect(voter1).registerVoter();
    await vote.connect(voter2).registerVoter();
    await vote.connect(voter3).registerVoter();
    console.log("Votants enregistrés avec succès");

    console.log("\nTest 3: Test de vote");
    await vote.connect(voter1).vote("Alice");
    await vote.connect(voter2).vote("Alice");
    await vote.connect(voter3).vote("John");
    console.log("Votes effectués avec succès");

    console.log("\nTest 4: Vérification des résultats");
    const [candidatesList, votes] = await vote.getAllVotes();
    for (let i = 0; i < candidatesList.length; i++) {
        console.log(`${candidatesList[i]}: ${votes[i]} votes`);
    }

    console.log("\nTest 5: Test de double vote (devrait échouer)");
    try {
        await vote.connect(voter1).vote("Bob");
        console.log("❌ Le test de double vote n'a pas échoué comme prévu");
    } catch (error) {
        console.log("✅ Le test de double vote a échoué comme prévu");
    }

    console.log("\nTest 6: Test de vote sans enregistrement (devrait échouer)");
    const nonRegisteredVoter = await hre.ethers.getImpersonatedSigner("0x0000000000000000000000000000000000000001");
    try {
        await vote.connect(nonRegisteredVoter).vote("Alice");
        console.log("❌ Le test de vote sans enregistrement n'a pas échoué comme prévu");
    } catch (error) {
        console.log("✅ Le test de vote sans enregistrement a échoué comme prévu");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 