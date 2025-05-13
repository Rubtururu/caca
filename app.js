const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [ // Solo las funciones necesarias para la interfaz
  { "inputs": [], "name": "stake", "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "withdrawStake", "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "withdrawRewards", "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "totalStaked", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalTreasury", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "userAddr", "type": "address" }], "name": "getPendingRewards", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "userAddr", "type": "address" }], "name": "getUserDailyDividendEstimate", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "userAddr", "type": "address" }], "name": "getTimeUntilNextDistribution", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

let web3, contract, account;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    document.getElementById("walletAddress").innerText = `Connected: ${account}`;
    loadStats();
  } else {
    alert("Install MetaMask!");
  }
}

async function loadStats() {
  const [staked, treasury, rewards, daily, next] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.getPendingRewards(account).call(),
    contract.methods.getUserDailyDividendEstimate(account).call(),
    contract.methods.getTimeUntilNextDistribution(account).call()
  ]);

  document.getElementById("totalStaked").innerText = web3.utils.fromWei(staked) + " BNB";
  document.getElementById("totalTreasury").innerText = web3.utils.fromWei(treasury) + " BNB";
  document.getElementById("pendingRewards").innerText = web3.utils.fromWei(rewards) + " BNB";
  document.getElementById("dailyDividend").innerText = web3.utils.fromWei(daily) + " BNB";

  const minutes = Math.floor(next / 60);
  const seconds = next % 60;
  document.getElementById("nextPayout").innerText = `${minutes}m ${seconds}s`;
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
  
