require("@nomiclabs/hardhat-waffle");

module.exports = {
	solidity: "0.8.0",
	networks: {
		goerli: {
			url: "https://eth-goerli.alchemyapi.io/v2/BroVmxYgXp8eIAiLvarI-XWRwXqJOt6R",
			accounts: [
				"6cf4efe7556ce9aa82d5444de7e5f9fac7a8c9d4b13c5d913684143d839ae869",
			],
		},
	},
};
