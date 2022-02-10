import React, { useEffect, useState } from "react";
export const TransactionContext = React.createContext();
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contants";
const { ethereum } = window;

const getEthereumContract = () => {
	const provider = new ethers.providers.Web3Provider(ethereum);
	const signer = provider.getSigner();
	const transactionContract = new ethers.Contract(
		contractAddress,
		contractABI,
		signer
	);
	return transactionContract;
};

export const TransactionProvider = ({ children }) => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [formData, setFormData] = useState({
		addressTo: "",
		addressFrom: "",
		keyword: "",
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [transactionCount, setTransactionCount] = useState(
		localStorage.getItem("transactionCount")
	);
	const [transactions, setTransactions] = useState([])

	const handleChange = (e, name) => {
		setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
	};
	const checkIfWalletConnected = async () => {
		try {
			if (!ethereum) return alert("Please install Metamask");
			const accounts = await ethereum.request({ method: "eth_accounts" });
			if (accounts.length) {
				setCurrentAccount(accounts[0]);
				//get all transactions
			} else {
				console.log("no accounts found");
			}
		} catch (error) {
			console.log("No ethereum object");
			throw new Error(error);
		}
	};

	const connectWallet = async () => {
		try {
			if (!ethereum) return alert("Please install Metamask");
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log(accounts);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log("No ethereum object");
			throw new Error(error);
		}
	};

	const sendTransaction = async () => {
		try {
			if (!ethereum) return alert("Please install Metamask");
			const { addressTo, amount, keyword, message } = formData;
			const transactionConstact = getEthereumContract();

			const parsedAmount = ethers.utils.parseEther(amount);

			await ethereum.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: "0x5208",
						value: parsedAmount._hex,
					},
				],
			});

			const transactionHash = await transactionConstact.addToBlockchain(
				addressTo,
				parsedAmount,
				message,
				keyword
			);
			setIsLoading(true);
			console.log(`Loading - ${transactionHash.hash}`);
			await transactionHash.wait();
			setIsLoading(false);
			console.log(`Success - ${transactionHash.hash}`);
			const transactionCount = await transactionContract.getTransactionCount();
			setTransactionCount(transactionCount.toNumber());
		} catch (error) {
			console.log("No ethereum object");
			throw new Error(error);
		}
	};
	const getAllTransactions = async () => {
		try {
			if (ethereum) {
				const transactionsContract = getEthereumContract();
				const availableTransactions = await transactionsContract.getAllTransactions();
				const structuredTransactions = availableTransactions.map((transaction) => ({
					addressTo: transaction.receiver,
					addressFrom: transaction.sender,
					timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
					message: transaction.message,
					keyword: transaction.keyword,
					amount: parseInt(transaction.amount._hex) / (10 ** 18)
				}));
				console.log(structuredTransactions);
				setTransactions(structuredTransactions);
			} else {
				console.log("Ethereum is not present");
			}
		} catch (error) {
			console.log(error);
		}
	};


	const checkIfTransactionsExists = async () => {
		try {
			if (ethereum) {
				const transactionsContract = getEthereumContract();
				const currentTransactionCount = await transactionsContract.getTransactionCount();
				window.localStorage.setItem("transactionCount", currentTransactionCount);
			}
		} catch (error) {
			console.log(error);
			throw new Error("No ethereum object");
		}
	};

	return (
		<TransactionContext.Provider
			value={{
				connectWallet,
				currentAccount,
				formData,
				setFormData,
				handleChange,
				sendTransaction,
				checkIfWalletConnected,
				transactions,
				getAllTransactions
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
};
