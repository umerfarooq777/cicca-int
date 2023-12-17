
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { stakingAddress, tokenAddress } from '../utils/address';
import { stakingABI, tokenABI } from '../utils/abi';
import { getEthertoWei, getWeitoEther } from '../utils/helpers';

const CiccaContext = createContext();
const { ethereum } = window;

const CiccaContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [allowRefresh, setAllowRefresh] = useState(true);
    const [currentAccount, setCurrentAccount] = useState();
    const [userAllowance, setUserAllowance] = useState("0");
    const [UserStakeDetails, setUserStakeDetails] = useState({
        isLoadingData:true,
        userBal:"0",
        amount:"0",
        startTime:"0",
        endTime:"0",
        rewardTaken:"0",
        rewardToBeWithdrawn:"0",
        claimed:"0",
        rewardTillNow:"0",
    });

   

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

  const getTokenContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    // console.log(tokenContract);
    return tokenContract;
}

  const getStakinContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const stakingContract = new ethers.Contract(stakingAddress, stakingABI, signer);
    // console.log(stakingContract);
    return stakingContract;
}

const getStakinContractState = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const stakingContract = new ethers.Contract(stakingAddress, stakingABI, signer);
    // console.log(stakingContract);
    return stakingContract;
}

const getUserStakinDetails = async (userAddress) => {
    if (allowRefresh) {
        
        const userData =  await getStakinContract().getDetails(userAddress)
        const reward =  await getStakinContract().calculateReward(userAddress)
        const ciccaBal =  await getTokenContract().balanceOf(userAddress)
        // console.log(stakingContract);
        setUserStakeDetails(
            {
                userBal:ciccaBal.toString(),
                
                amount:userData?.amount?.toString(),
                startTime:userData?.startTime?.toString(),
                endTime:userData?.endTime?.toString(),
                rewardTaken:userData?.rewardTaken?.toString(),
                rewardToBeWithdrawn:userData?.rewardToBeWithdrawn?.toString(),
                claimed:userData?.claimed?.toString(),
                rewardTillNow:reward.toString(),
                isLoadingData:false,
            }
        )
    }
}

const getUserAllowance = async (userAddress) => {
    // console.log("hello 1");
    let res =  await getTokenContract().allowance(userAddress,stakingAddress)
    res = res.toString()
    setUserAllowance(getWeitoEther(res)?.toString())
    // console.log("hello 2");
}




//!============== WRITES =================

const approveStakeAmount = async (amount) => {
    try {
        setIsLoading(true)
        let maxApproveAmt = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        
        let res =  await getTokenContract().approve(stakingAddress,maxApproveAmt)
        
        await getUserAllowance(currentAccount)
        setIsLoading(false)
        
    } catch (error) {
        setIsLoading(false)
        console.log("Error on approve:" , error);
        
    }
}
const stakeCiccaAmount = async (amount) => {
    try {
        setIsLoading(true)

        // whenNotPaused
        
        let res =  await getStakinContract().stake(getEthertoWei(amount))
        setAllowRefresh(false)
        
        setUserStakeDetails((oldData)=>({...oldData,isLoadingData:true}))
        await getUserAllowance(currentAccount)
        await getUserStakinDetails(currentAccount)
        setAllowRefresh(true)
        setIsLoading(false)
        
    } catch (error) {
        setIsLoading(false)
        setAllowRefresh(true)

        console.log("Error on stake:" , error);
        
    }
}
const unstakeAmount = async (amount) => {
    try {
        setIsLoading(true)

        // whenNotPaused
        
        let res =  await getStakinContract().unstake()
        setAllowRefresh(false)
        
        setUserStakeDetails((oldData)=>({...oldData,isLoadingData:true}))
        
        await getUserStakinDetails(currentAccount)
        setAllowRefresh(true)
        setIsLoading(false)
        
    } catch (error) {
        console.log("Error on stake:" , error);
        setAllowRefresh(true)
        setIsLoading(false)

        
    }
}
const withdrawReward = async (amount) => {
    try {
        setIsLoading(true)


        // whenNotPaused
        
        
        let res =  await getStakinContract().withdrawReward()
        setAllowRefresh(false)
        
        setUserStakeDetails((oldData)=>({...oldData,isLoadingData:true}))
        
        await getUserStakinDetails(currentAccount)
        setAllowRefresh(true)
        setIsLoading(false)
        
        
    } catch (error) {
        setAllowRefresh(true)
        setIsLoading(false)

        console.log("Error on stake:" , error);
        
    }
}


  const CONTEXT_VALUES = {
    isLoading,
    currentAccount,
    connectWallet,

    //!====== READS
    getUserStakinDetails,
    UserStakeDetails,
    getUserAllowance,
    userAllowance,
    //! ============== WRIITES
    approveStakeAmount,
    unstakeAmount,
    withdrawReward,
    stakeCiccaAmount,
    approveStakeAmount
        

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