const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Dirección en testnet
const abi = [ // ABI mínima necesaria
  { "inputs": [], "name": "totalStaked", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalTreasury", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getTotalDailyDividend", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }], "name": "getUserShare", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }], "name": "getUserDailyDividendEstimate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }], "name": "getPendingRewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }], "name": "getTimeUntilNextDistribution", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "stake", "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "withdrawStake", "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "withdrawRewards", "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "stakers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
];

let web3;
let account;
let contract;
let chartInstance;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
    document.getElementById("connectButton").addEventListener("click", connectWallet);
  } else {
    alert("MetaMask no está instalado.");
  }
});

async function connectWallet() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    document.getElementById("connectButton").innerText = `✅ ${account.slice(0, 6)}...${account.slice(-4)}`;
    updateUI();
    updateChart();
    setInterval(updateUI, 30000);
    setInterval(updateChart, 60000);
  } catch (error) {
    console.error("Error al conectar:", error);
  }
}

async function updateUI() {
  if (!contract || !account) return;

  const [
    totalStaked,
    totalTreasury,
    totalDailyDividend,
    userShare,
    userDailyDividend,
    userPendingRewards,
    countdown
  ] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.getTotalDailyDividend().call(),
    contract.methods.getUserShare(account).call(),
    contract.methods.getUserDailyDividendEstimate(account).call(),
    contract.methods.getPendingRewards(account).call(),
    contract.methods.getTimeUntilNextDistribution(account).call()
  ]);

  const users = await getTotalUsers();

  document.getElementById("totalStaked").innerText = formatBNB(totalStaked);
  document.getElementById("totalTreasury").innerText = formatBNB(totalTreasury);
  document.getElementById("totalDailyDividend").innerText = formatBNB(totalDailyDividend);
  document.getElementById("totalUsers").innerText = users;

  document.getElementById("userShare").innerText = `${(userShare / 1e16).toFixed(2)}%`;
  document.getElementById("userDailyDividend").innerText = formatBNB(userDailyDividend);
  document.getElementById("userPendingRewards").innerText = formatBNB(userPendingRewards);
  document.getElementById("userCountdown").innerText = formatCountdown(countdown);
}

function formatBNB(wei) {
  return `${web3.utils.fromWei(wei, "ether")} BNB`;
}

function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function getTotalUsers() {
  const length = await contract.methods.stakers().call().catch(() => []); // fallback
  if (Array.isArray(length)) return length.length;
  return 0;
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Ingresa una cantidad válida");

  const value = web3.utils.toWei(amount, "ether");
  try {
    await contract.methods.stake().send({ from: account, value });
    updateUI();
  } catch (err) {
    console.error("Error en stake:", err);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: account });
    updateUI();
  } catch (err) {
    console.error("Error al retirar:", err);
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: account });
    updateUI();
  } catch (err) {
    console.error("Error al reclamar recompensas:", err);
  }
}

async function updateChart() {
  const value = await contract.methods.getTotalDailyDividend().call();
  const bnb = parseFloat(web3.utils.fromWei(value, "ether"));

  const now = new Date();
  const label = now.toLocaleTimeString();

  if (!chartInstance) {
    const ctx = document.getElementById("dividendChart").getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [label],
        datasets: [{
          label: "BNB en Pool de Dividendos",
          data: [bnb],
          backgroundColor: "rgba(0, 255, 195, 0.2)",
          borderColor: "#00ffc3",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.body).getPropertyValue("--foreground")
            }
          }
        },
        scales: {
          x: { ticks: { color: getComputedStyle(document.body).getPropertyValue("--foreground") } },
          y: { ticks: { color: getComputedStyle(document.body).getPropertyValue("--foreground") } }
        }
      }
    });
  } else {
    chartInstance.data.labels.push(label);
    chartInstance.data.datasets[0].data.push(bnb);
    if (chartInstance.data.labels.length > 10) {
      chartInstance.data.labels.shift();
      chartInstance.data.datasets[0].data.shift();
    }
    chartInstance.update();
  }
}
