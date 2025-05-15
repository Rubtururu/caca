const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Testnet
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let currentAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
    document.getElementById("connectButton").addEventListener("click", connectWallet);
  } else {
    alert("MetaMask not detected.");
  }
});

async function connectWallet() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  currentAccount = accounts[0];
  document.getElementById("walletAddress").innerText = currentAccount;
  loadStats();
}

async function loadStats() {
  const [totalStaked, totalTreasury, dailyDividend, userShare, pendingRewards, dailyEstimate, timeLeft] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.getTotalDailyDividend().call(),
    contract.methods.getUserShare(currentAccount).call(),
    contract.methods.getPendingRewards(currentAccount).call(),
    contract.methods.getUserDailyDividendEstimate(currentAccount).call(),
    contract.methods.getTimeUntilNextDistribution(currentAccount).call()
  ]);

  document.getElementById("totalStaked").innerText = web3.utils.fromWei(totalStaked);
  document.getElementById("totalTreasury").innerText = web3.utils.fromWei(totalTreasury);
  document.getElementById("totalDailyDividend").innerText = web3.utils.fromWei(dailyDividend);
  document.getElementById("userShare").innerText = (userShare / 1e16).toFixed(2); // 100% = 1e18
  document.getElementById("pendingRewards").innerText = web3.utils.fromWei(pendingRewards);
  document.getElementById("dailyEstimate").innerText = web3.utils.fromWei(dailyEstimate);
  document.getElementById("nextDistribution").innerText = formatTime(timeLeft);

  const user = await contract.methods.users(currentAccount).call();
  document.getElementById("userStaked").innerText = web3.utils.fromWei(user.stakedAmount);

  const stakerCount = await contract.methods.stakers().call();
  document.getElementById("stakerCount").innerText = stakerCount.length;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount");

  await contract.methods.stake().send({
    from: currentAccount,
    value: web3.utils.toWei(amount, "ether")
  });

  loadStats();
}

async function withdraw() {
  await contract.methods.withdrawStake().send({ from: currentAccount });
  loadStats();
}

async function claim() {
  await contract.methods.withdrawRewards().send({ from: currentAccount });
  loadStats();
}

// Aquí ya deberías tener Web3, contrato y funciones definidos
// Agrega esto al final de `updateUI()` para actualizar la gráfica

let chartInstance;

async function updateChart() {
  const value = await contract.methods.getTotalDailyDividend().call();
  const bnb = parseFloat(web3.utils.fromWei(value, 'ether'));

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

// Llama a esto al final de updateUI()
setInterval(updateChart, 60000); // cada minuto
updateChart();
