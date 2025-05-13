const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";

const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let account;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("stakeBtn").addEventListener("click", stake);
    document.getElementById("withdrawStakeBtn").addEventListener("click", withdrawStake);
    document.getElementById("withdrawRewardsBtn").addEventListener("click", withdrawRewards);
  } else {
    alert("Please install MetaMask!");
  }
});

async function connectWallet() {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById("walletAddress").innerText = `Connected: ${account}`;
    loadStats();
  } catch (error) {
    console.error("Wallet connection failed", error);
  }
}

async function loadStats() {
  try {
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const pendingRewards = await contract.methods.getPendingRewards(account).call();
    const dailyDividend = await contract.methods.getUserDailyDividendEstimate(account).call();
    const nextPayout = await contract.methods.getTimeUntilNextDistribution(account).call();

    document.getElementById("totalStaked").innerText = `${web3.utils.fromWei(totalStaked)} BNB`;
    document.getElementById("totalTreasury").innerText = `${web3.utils.fromWei(totalTreasury)} BNB`;
    document.getElementById("pendingRewards").innerText = `${web3.utils.fromWei(pendingRewards)} BNB`;
    document.getElementById("dailyDividend").innerText = `${web3.utils.fromWei(dailyDividend)} BNB`;

    const minutes = Math.floor(nextPayout / 60);
    const seconds = nextPayout % 60;
    document.getElementById("nextPayout").innerText = `${minutes}m ${seconds}s`;
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount");
  try {
    await contract.methods.stake().send({ from: account, value: web3.utils.toWei(amount, "ether") });
    loadStats();
  } catch (err) {
    console.error("Stake failed:", err);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: account });
    loadStats();
  } catch (err) {
    console.error("Withdraw stake failed:", err);
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: account });
    loadStats();
  } catch (err) {
    console.error("Withdraw rewards failed:", err);
  }
}
