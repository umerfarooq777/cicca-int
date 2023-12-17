import logo from './logo.svg';
import './App.css';
import { GetCiccaContext } from './context/ciccaContext';
import { useEffect, useState } from 'react';
import { convertSecondsToDate, getTimeSincePostCreation, getWeitoEther } from './utils/helpers';

function App() {

  const {
    isLoading,
    currentAccount,
    connectWallet,
    getUserStakinDetails,
    UserStakeDetails,
    getUserAllowance,
    userAllowance,
    unstakeAmount,
    withdrawReward,
    approveStakeAmount
    } = GetCiccaContext()

    const [stakeAmount, setStakeAmount] = useState()



    const refreshData = async ()=>{
      if (currentAccount) {
        await getUserStakinDetails(currentAccount)
        await getUserAllowance(currentAccount)
      }
    }
    const getAccountData = async ()=>{
      if (currentAccount) {
        await getUserAllowance(currentAccount)
        await getUserStakinDetails(currentAccount)
      }
    }


    useEffect(() => {

      const intervalId = setInterval(() => {
        // getAccountData()
        refreshData()
      }, 5000);

      return () => clearInterval(intervalId);
    }, []);




    // useEffect(() => {
    //   console.log("userAllowance",userAllowance);

    // }, [userAllowance]);

    useEffect(() => {

    getAccountData()
    }, [currentAccount]);
    

const {isLoadingData,amount,startTime,endTime,rewardTaken,rewardToBeWithdrawn,claimed,rewardTillNow} = UserStakeDetails;
  return (
    <div className="App">
      <header className="App-header">
        <h4>CICCA APP</h4>
        {
          !currentAccount?
          <button onClick={connectWallet}>Connect Wallet</button>
          :
          <>
          
          <p>Connected Account: {currentAccount}</p>

          <h3> ================ Stake ================</h3>
          <input type='number' style={{height:"30px",fontSize:"30px"}} value={stakeAmount} onChange={(e)=>{setStakeAmount(e.target.value)}}></input>
          {
            Number(userAllowance) === 0?

            <button disabled={!stakeAmount || Number(stakeAmount)<100} onClick={()=>approveStakeAmount(stakeAmount)} >Approve Amount</button>
            :
          <button disabled={!stakeAmount || Number(stakeAmount)<100} >Stake Amount</button>
          }
          <h4>================  User Staking Details  ================</h4>
          {
            !isLoadingData
            ?<>
          <p>Amount Staked: {getWeitoEther(amount)} {Number(getWeitoEther(amount))>0 && <button onClick={unstakeAmount} >Unstake Now</button>} </p>
          <p>Stake Start Time: {getTimeSincePostCreation(startTime)} | {convertSecondsToDate(startTime)}</p>
          <p>Stake End Time: {convertSecondsToDate(endTime)}</p>
          <p>Last Reward Claimed: {getTimeSincePostCreation(rewardTaken)}</p>
          <p>Reward Claimed : {getWeitoEther(claimed)}</p>
          <p>Reward Available Till Now : {getWeitoEther(rewardTillNow)} {Number(getWeitoEther(rewardTillNow))>0 && <button onClick={withdrawReward} >Claim Now</button>}</p>
            </>
            :
            <p>Loading...</p>
          }
          

          
          
          

          
          </>
        }
       
      </header>
    </div>
  );
}

export default App;
