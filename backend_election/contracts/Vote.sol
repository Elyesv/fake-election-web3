// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vote {
    address public admin;
    uint public constant MAX_VOTERS = 2;
    uint public voterCount;
    bool public isElectionActive;

    string[] public candidates;
    mapping(string => uint) public votes;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;
    address[] private currentVoters;

    event ElectionEnded(string[] candidates, uint[] results);
    event ElectionReset();
    event ElectionRestarted();

    constructor(string[] memory _candidates) {
        admin = msg.sender;
        candidates = _candidates;
        isElectionActive = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function restartElection() public onlyAdmin {
        require(!isElectionActive, "Election is already active");
        
        // Réinitialiser tous les états
        for (uint i = 0; i < candidates.length; i++) {
            votes[candidates[i]] = 0;
        }

        // Réinitialiser l'état des votants
        for (uint i = 0; i < currentVoters.length; i++) {
            registeredVoters[currentVoters[i]] = false;
            hasVoted[currentVoters[i]] = false;
        }

        // Vider le tableau des votants actuels
        delete currentVoters;

        // Réinitialiser le compteur de votants
        voterCount = 0;

        // Réactiver l'élection
        isElectionActive = true;

        emit ElectionRestarted();
    }

    function registerVoter() public {
        require(isElectionActive, "Election is not active");
        require(!registeredVoters[msg.sender], "Already registered.");
        require(voterCount < MAX_VOTERS, "Maximum number of voters reached");
        
        registeredVoters[msg.sender] = true;
        currentVoters.push(msg.sender);
        voterCount++;
    }

    function vote(string memory candidate) public {
        require(isElectionActive, "Election is not active");
        require(registeredVoters[msg.sender], "You must be registered to vote.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(validCandidate(candidate), "Invalid candidate.");

        votes[candidate]++;
        hasVoted[msg.sender] = true;

        if (voterCount == MAX_VOTERS && allVotersHaveVoted()) {
            checkForTie();
        }
    }

    function allVotersHaveVoted() internal view returns (bool) {
        uint votedCount = 0;
        for (uint i = 0; i < candidates.length; i++) {
            votedCount += votes[candidates[i]];
        }
        return votedCount == MAX_VOTERS;
    }

    function checkForTie() internal {
        bool hasTie = false;
        uint maxVotes = 0;
        uint maxVotesCount = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (votes[candidates[i]] > maxVotes) {
                maxVotes = votes[candidates[i]];
                maxVotesCount = 1;
            } else if (votes[candidates[i]] == maxVotes) {
                maxVotesCount++;
            }
        }

        if (maxVotesCount > 1) {
            hasTie = true;
        }

        if (hasTie) {
            resetElection();
            emit ElectionReset();
        } else {
            uint[] memory results = new uint[](candidates.length);
            for (uint i = 0; i < candidates.length; i++) {
                results[i] = votes[candidates[i]];
            }
            isElectionActive = false;
            emit ElectionEnded(candidates, results);
        }
    }

    function resetElection() internal {
        for (uint i = 0; i < candidates.length; i++) {
            votes[candidates[i]] = 0;
        }

        for (uint i = 0; i < currentVoters.length; i++) {
            registeredVoters[currentVoters[i]] = false;
            hasVoted[currentVoters[i]] = false;
        }

        delete currentVoters;

        voterCount = 0;
        isElectionActive = true;
    }

    function getAllVotes() public view returns (string[] memory, uint[] memory) {
        uint[] memory results = new uint[](candidates.length);

        for (uint i = 0; i < candidates.length; i++) {
            results[i] = votes[candidates[i]];
        }

        return (candidates, results);
    }

    function getAllCandidates() public view returns (string[] memory) {
        return candidates;
    }

    function validCandidate(string memory name) internal view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i])) == keccak256(bytes(name))) {
                return true;
            }
        }
        return false;
    }

    function getWinner() public view returns (string memory) {
        require(!isElectionActive, "Election is still active");
        
        string memory winner = candidates[0];
        uint maxVotes = votes[candidates[0]];
        bool hasTie = false;

        for (uint i = 1; i < candidates.length; i++) {
            if (votes[candidates[i]] > maxVotes) {
                winner = candidates[i];
                maxVotes = votes[candidates[i]];
                hasTie = false;
            } else if (votes[candidates[i]] == maxVotes) {
                hasTie = true;
            }
        }

        if (hasTie) {
            return "Tie";
        }

        return winner;
    }
}
