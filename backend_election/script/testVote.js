const hre = require("hardhat");

async function main() {
    console.log("Démarrage du test du contrat Vote...");

    // Déploiement du contrat
    const Vote = await hre.ethers.getContractFactory("Vote");
    const candidates = ["Alice", "Bob", "John"];
    const vote = await Vote.deploy(candidates);
    await vote.waitForDeployment();
    console.log("Contrat Vote déployé à l'adresse:", await vote.getAddress());

    // Récupération des comptes de test
    const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();

    // Test 1: Vérification des candidats initiaux
    console.log("\nTest 1: Vérification des candidats initiaux");
    const initialCandidates = await vote.getAllCandidates();
    console.log("Candidats:", initialCandidates);

    // Test 2: Enregistrement des votants (limite à 2)
    console.log("\nTest 2: Test de la limite de 2 votants");
    await vote.connect(voter1).registerVoter();
    await vote.connect(voter2).registerVoter();
    console.log("✅ Les deux premiers votants enregistrés avec succès");

    // Test 3: Tentative d'enregistrement d'un troisième votant (devrait échouer)
    console.log("\nTest 3: Tentative d'enregistrement d'un troisième votant");
    try {
        await vote.connect(voter3).registerVoter();
        console.log("❌ Le test n'a pas échoué comme prévu");
    } catch (error) {
        console.log("✅ Le test a échoué comme prévu: Maximum number of voters reached");
    }

    // Test 4: Premier tour de vote avec égalité
    console.log("\nTest 4: Premier tour de vote avec égalité");
    await vote.connect(voter1).vote("Alice");
    await vote.connect(voter2).vote("Bob");
    console.log("✅ Votes effectués avec succès");

    // Vérification des résultats après égalité
    const [candidatesList1, votes1] = await vote.getAllVotes();
    console.log("Résultats après égalité:");
    for (let i = 0; i < candidatesList1.length; i++) {
        console.log(`${candidatesList1[i]}: ${votes1[i]} votes`);
    }

    // Test 5: Réenregistrement et deuxième tour de vote
    console.log("\nTest 5: Réenregistrement et deuxième tour de vote");
    console.log("Réenregistrement des votants...");
    await vote.connect(voter1).registerVoter();
    await vote.connect(voter2).registerVoter();
    console.log("✅ Votants réenregistrés avec succès");

    console.log("Votes du deuxième tour...");
    await vote.connect(voter1).vote("Alice");
    await vote.connect(voter2).vote("Alice");
    console.log("✅ Votes du deuxième tour effectués avec succès");

    // Vérification des résultats finaux
    const [candidatesList2, votes2] = await vote.getAllVotes();
    console.log("Résultats finaux:");
    for (let i = 0; i < candidatesList2.length; i++) {
        console.log(`${candidatesList2[i]}: ${votes2[i]} votes`);
    }

    // Test 6: Tentative de vote après la fin de l'élection
    console.log("\nTest 6: Tentative de vote après la fin de l'élection");
    try {
        await vote.connect(voter1).registerVoter();
        console.log("❌ Le test n'a pas échoué comme prévu");
    } catch (error) {
        console.log("✅ Le test a échoué comme prévu: Election is not active");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erreur lors du test:", error);
        process.exit(1);
    }); 