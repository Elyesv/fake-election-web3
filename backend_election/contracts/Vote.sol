// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vote {
    address public admin;

    string[] public candidates;
    mapping(string => uint) public votes;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory _candidates) {
        admin = msg.sender;
        candidates = _candidates;
    }

    function registerVoter() public {
        require(!registeredVoters[msg.sender], "Already registered.");
        registeredVoters[msg.sender] = true;
    }

    function vote(string memory candidate) public {
        require(registeredVoters[msg.sender], "You must be registered to vote.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(validCandidate(candidate), "Invalid candidate.");

        votes[candidate]++;
        hasVoted[msg.sender] = true;
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
}
