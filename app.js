const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3, contract, account;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById("walletAddress").innerText = `Connected: ${account}`;
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    loadStats();
  } else {
    alert("Please install MetaMask to use this dApp!");
  }
}

async function loadStats() {
  try {
    const [staked, treasury, rewards, daily, next] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.getPendingRewards(account).call(),
      contract.methods.getUserDailyDividendEstimate(account).call(),
      contract.methods.getTimeUntilNextDistribution(account).call()
    ]);

    document.getElementById("totalStaked").innerText = `${web3.utils.fromWei(staked)} BNB`;
    document.getElementById("totalTreasury").innerText = `${web3.utils.fromWei(treasury)} BNB`;
    document.getElementById("pendingRewards").innerText = `${web3.utils.fromWei(rewards)} BNB`;
    document.getElementById("dailyDividend").innerText = `${web3.utils.fromWei(daily)} BNB`;

    const minutes = Math.floor(next / 60);
    const seconds = next % 60;
    document.getElementById("nextPayout").innerText = `${minutes}m ${seconds}s`;

  } catch (error) {
    console.error("Error loading contract stats:", error);
  }
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount");
  await contract.methods.stake().send({ from: account, value: web3.utils.toWei(amount, "ether") });
  loadStats();
}

async function withdrawStake() {
  await contract.methods.withdrawStake().send({ from: account });
  loadStats();
}

async function withdrawRewards() {
  await contract.methods.withdrawRewards().send({ from: account });
  loadStats();
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
