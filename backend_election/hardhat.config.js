require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/71edba578fb04c7c944b40dddf7a70a9",
      accounts: ["fa01f5ed6d75d31b313341ecde0590fea728dab6c1cae7446ee64837b8b16698"],
    }
  }
};
