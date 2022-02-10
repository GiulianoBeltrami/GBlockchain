import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/Constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading,setIsLoading] = useState(true);
    const [transactionCount,setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions,setTransactions] = useState([]);


    const handleChange = (event, name) => {
        setFormData((previusState) => ({ ...previusState, [name]: event.target.value }));
    }

    const getAllTransactions = async () => {
        try {
            if(ethereum){
                checkIfMetamaskIsInstalled();
                const transactionContract = getEthereumContract();
                const availableTransactions = await transactionContract.getAllTransactions();
                const structuredTransactions = availableTransactions.map((transaction) => ({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                    message: transaction.message,
                    keyword:transaction.keyword,
                    amount: parseInt(transaction.amount._hex) / (10**18)
    
                }));
                setTransactions(structuredTransactions);
            }
            else{
                console.log("Ethereum is not present, you installed metamask?");
            }
            
        } catch (error) {
            console.error(error);
        }
    }

    const checkIfMetamaskIsInstalled = () => {
        if (!ethereum) return alert("Please install metamask");
    }

    const checkIfWalletIsConnected = async () => {

        try {
            setIsLoading(true);
            checkIfMetamaskIsInstalled();

            const accounts = await ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length) {
                
                setCurrentAccount(accounts[0]);
                await getAllTransactions();
                setIsLoading(false);
            }
            else {
                console.error("No accounts found.");
            }
        } catch (error) {
            throw new Error("No ethereum object.");
        }


    }

    const checkIfTransactionExists = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transactionCount',transactionCount);
        } catch (error) {
            console.error(error);
            throw new Error("No ethereum object.");
        }
    }

    const connectWallet = async () => {
        try {
            checkIfMetamaskIsInstalled();

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });

            setCurrentAccount(accounts[0]);

        } catch (error) {
            console.error(error);

            throw new Error("No ethereum object.");
        }
    }

    const sendTransaction = async () => {
        try {
            checkIfMetamaskIsInstalled();

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            })

            const transactionHash = await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            setIsLoading(false);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

            window.reload();
        } catch (error) {
            console.error(error);
            throw new Error("No ethereum object.");
        }

    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionExists();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, handleChange, sendTransaction, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}