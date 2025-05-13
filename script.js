const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
let contract;
let userAddress = null;
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Replace with your contract address
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

document.getElementById("connect-wallet-btn").addEventListener("click", connectWallet);

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];
        contract = new web3.eth.Contract(contractABI, contractAddress);
        updateStats();
    } else {
        alert("MetaMask no está instalado");
    }
}

async function updateStats() {
    if (!userAddress) return;

    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDailyDividend = await contract.methods.getTotalDailyDividend().call();
    const userStaked = await contract.methods.getUserShare(userAddress).call();
    const userPendingRewards = await contract.methods.getPendingRewards(userAddress).call();

    document.getElementById("total-staked").innerText = `Total Staked: ${web3.utils.fromWei(totalStaked)} BNB`;
    document.getElementById("total-treasury").innerText = `Total Treasury: ${web3.utils.fromWei(totalTreasury)} BNB`;
    document.getElementById("total-daily-dividend").innerText = `Total Daily Dividend: ${web3.utils.fromWei(totalDailyDividend)} BNB`;
    
    document.getElementById("user-staked").innerText = `Stake del Usuario: ${web3.utils.fromWei(userStaked)} BNB`;
    document.getElementById("pending-rewards").innerText = `Pending Rewards: ${web3.utils.fromWei(userPendingRewards)} BNB`;
}

document.getElementById("stake-btn").addEventListener("click", async () => {
    const stakeAmount = document.getElementById("stake-amount").value;
    if (!stakeAmount || stakeAmount <= 0) return;
    
    await contract.methods.stake().send({ from: userAddress, value: web3.utils.toWei(stakeAmount, 'ether') });
    updateStats();
});

document.getElementById("withdraw-stake-btn").addEventListener("click", async () => {
    await contract.methods.withdrawStake().send({ from: userAddress });
    updateStats();
});

document.getElementById("withdraw-rewards-btn").addEventListener("click", async () => {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    updateStats();
});

async function updateCountdown() {
    const timeUntilNext = await contract.methods.getTimeUntilNextDistribution(userAddress).call();
    const hours = Math.floor(timeUntilNext / 3600);
    const minutes = Math.floor((timeUntilNext % 3600) / 60);
    const seconds = timeUntilNext % 60;

    document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
}

setInterval(updateCountdown, 1000);



