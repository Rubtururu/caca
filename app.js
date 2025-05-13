const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let account;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById("walletAddress").innerText = `Connected: ${account}`;
      contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      await loadStats();
    } catch (err) {
      console.error("Connection error:", err);
    }
  } else {
    alert("MetaMask not found. Please install it.");
  }
}

async function loadStats() {
  if (!contract || !account) return;

  try {
    const [
      totalStaked,
      totalTreasury,
      pendingRewards,
      dailyDividend,
      timeLeft
    ] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.getPendingRewards(account).call(),
      contract.methods.getUserDailyDividendEstimate(account).call(),
      contract.methods.getTimeUntilNextDistribution(account).call()
    ]);

    document.getElementById("totalStaked").innerText = web3.utils.fromWei(totalStaked, "ether") + " BNB";
    document.getElementById("totalTreasury").innerText = web3.utils.fromWei(totalTreasury, "ether") + " BNB";
    document.getElementById("pendingRewards").innerText = web3.utils.fromWei(pendingRewards, "ether") + " BNB";
    document.getElementById("dailyDividend").innerText = web3.utils.fromWei(dailyDividend, "ether") + " BNB";

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("nextPayout").innerText = `${mins}m ${secs}s`;
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) return alert("Invalid amount");
  try {
    await contract.methods.stake().send({
      from: account,
      value: web3.utils.toWei(amount, "ether")
    });
    await loadStats();
  } catch (err) {
    console.error("Stake failed:", err);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: account });
    await loadStats();
  } catch (err) {
    console.error("Withdraw stake failed:", err);
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: account });
    await loadStats();
  } catch (err) {
    console.error("Withdraw rewards failed:", err);
  }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
