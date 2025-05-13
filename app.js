const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let account;

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("stakeButton").addEventListener("click", stake);
    document.getElementById("withdrawStakeButton").addEventListener("click", withdrawStake);
    document.getElementById("withdrawRewardsButton").addEventListener("click", withdrawRewards);
  } else {
    alert("MetaMask not found!");
  }
});

async function connectWallet() {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById("walletAddress").innerText = `Connected: ${account}`;
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    updateStats();
    setInterval(updateStats, 15000);
  } catch (err) {
    console.error("Wallet connection failed", err);
  }
}

async function updateStats() {
  if (!contract || !account) return;

  try {
    const [
      totalStaked,
      totalTreasury,
      pendingRewards,
      dailyEstimate,
      nextPayout
    ] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.getPendingRewards(account).call(),
      contract.methods.getUserDailyDividendEstimate(account).call(),
      contract.methods.getTimeUntilNextDistribution(account).call()
    ]);

    document.getElementById("totalStaked").innerText = parseFloat(web3.utils.fromWei(totalStaked)).toFixed(4) + " BNB";
    document.getElementById("totalTreasury").innerText = parseFloat(web3.utils.fromWei(totalTreasury)).toFixed(4) + " BNB";
    document.getElementById("pendingRewards").innerText = parseFloat(web3.utils.fromWei(pendingRewards)).toFixed(4) + " BNB";
    document.getElementById("dailyEstimate").innerText = parseFloat(web3.utils.fromWei(dailyEstimate)).toFixed(4) + " BNB";

    const minutes = Math.floor(nextPayout / 60);
    const seconds = nextPayout % 60;
    document.getElementById("nextPayout").innerText = `${minutes}m ${seconds}s`;

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter valid amount");
  await contract.methods.stake().send({ from: account, value: web3.utils.toWei(amount, "ether") });
  updateStats();
}

async function withdrawStake() {
  await contract.methods.withdrawStake().send({ from: account });
  updateStats();
}

async function withdrawRewards() {
  await contract.methods.withdrawRewards().send({ from: account });
  updateStats();
}
