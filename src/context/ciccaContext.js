
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAddress } from '../utils/address';
import { tokenABI } from '../utils/abi';

const CiccaContext = createContext();
const { ethereum } = window;

const CiccaContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentAccount, setCurrentAccount] = useState();
   

    useEffect(() => {
        checkIsWalletConnected();
      
    }, [])

    ethereum.on("accountsChanged", async(account) => {
        setCurrentAccount(account[0]?.toLowerCase());
     
    })

    const checkIsWalletConnected = async () => {
        try {
            if (!ethereum) return alert("please install MetaMask");
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length) {
                setCurrentAccount(accounts[0]?.toLowerCase());
                console.log("Account", accounts[0]?.toLowerCase())
            } else {
                console.log("No account Found");
            }
        } catch (err) {
            console.log(err);
        }
    }



    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install Metamask");
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setCurrentAccount(accounts[0]?.toLowerCase());

        } catch (err) {
            console.log(err);
        }
    }

  const getCicccaTokenContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const vendingMachineContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    // console.log(vendingMachineContract);
    return vendingMachineContract;
}
  const getCicccaTokenContractBalance = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const balanceWei = await provider.getBalance(tokenAddress);
}


  const CONTEXT_VALUES = {
    isLoading,
        

    }

  return (
    <CiccaContext.Provider value={CONTEXT_VALUES}>
      {children}
    </CiccaContext.Provider>
  );
};

const GetCiccaContext = () => {    
    return useContext(CiccaContext)

}

export { CiccaContext, CiccaContextProvider,GetCiccaContext };