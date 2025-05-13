const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let provider, contract, signer, account;

const connectWalletButton = document.getElementById('connectWallet');
const stakeButton = document.getElementById('stakeButton');
const withdrawStakeButton = document.getElementById('withdrawStake');
const withdrawRewardsButton = document.getElementById('withdrawRewards');

const ctx = document.getElementById('stakeChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Staked Amount (BNB)',
      data: [],
      borderColor: '#4CAF50',
      tension: 0.1
    }]
  }
});

connectWalletButton.addEventListener('click', async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    account = await signer.getAddress();
    document.getElementById('accountAddress').innerText = account;
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    updateDashboard();
  } else {
    alert('MetaMask no está instalada');
  }
});

const updateDashboard = async () => {
  const totalStaked = await contract.totalStaked();
  const totalTreasury = await contract.totalTreasury();
  const pendingRewards = await contract.getPendingRewards(account);
  const nextDistribution = await contract.getTimeUntilNextDistribution(account);
  const totalDailyDividend = await contract.getTotalDailyDividend();
  const userShare = await contract.getUserShare(account);
  const userDailyEstimate = await contract.getUserDailyDividendEstimate(account);

  document.getElementById('totalStaked').innerText = ethers.utils.formatEther(totalStaked);
  document.getElementById('totalTreasury').innerText = ethers.utils.formatEther(totalTreasury);
  document.getElementById('pendingRewards').innerText = ethers.utils.formatEther(pendingRewards);
  document.getElementById('nextDistribution').innerText = `${Math.floor(nextDistribution / 60)}m ${nextDistribution % 60}s`;
  document.getElementById('totalDailyDividend').innerText = ethers.utils.formatEther(totalDailyDividend);
  document.getElementById('userShare').innerText = `${(userShare / 1e18 * 100).toFixed(2)}%`;
  document.getElementById('userDailyEstimate').innerText = ethers.utils.formatEther(userDailyEstimate);

  // Actualización del gráfico
  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(parseFloat(ethers.utils.formatEther(totalStaked)));
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
};

stakeButton.addEventListener('click', async () => {
  const amount = document.getElementById('stakeAmount').value;
  try {
    await contract.stake({ value: ethers.utils.parseEther(amount) });
    alert('Staking completado!');
    updateDashboard();
  } catch (error) {
    alert('Error en el staking: ' + error.message);
  }
});

withdrawStakeButton.addEventListener('click', async () => {
  try {
    await contract.withdrawStake();
    alert('Stake retirado correctamente.');
    updateDashboard();
  } catch (error) {
    alert('Error al retirar el stake: ' + error.message);
  }
});

withdrawRewardsButton.addEventListener('click', async () => {
  try {
    await contract.withdrawRewards();
    alert('Recompensas retiradas correctamente.');
    updateDashboard();
  } catch (error) {
    alert('Error al retirar recompensas: ' + error.message);
  }
});

setInterval(updateDashboard, 60000); // Actualización cada minuto
