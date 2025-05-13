// ==========================
// 🔗 Configuración de Web3
// ==========================
let web3 = new Web3(window.ethereum);
let contract;
let account;

// ✅ ABI y Dirección del contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; // Coloca aquí el ABI del contrato
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Dirección del contrato en BSC

window.onload = async () => {
    await connectWallet();
    await updateStats();
};

// ==========================
// 📊 Actualización de Datos
// ==========================
async function updateStats() {
    const [
        totalStaked,
        totalTreasury,
        totalDailyDividend,
        lastGlobalUpdate
    ] = await Promise.all([
        contract.methods.totalStaked().call(),
        contract.methods.totalTreasury().call(),
        contract.methods.getTotalDailyDividend().call(),
        contract.methods.lastGlobalUpdate().call()
    ]);

    // ✅ Actualización en la interfaz
    document.getElementById("total-staked").innerText = `${web3.utils.fromWei(totalStaked)} BNB`;
    document.getElementById("total-treasury").innerText = `${web3.utils.fromWei(totalTreasury)} BNB`;
    document.getElementById("total-daily-dividend").innerText = `${web3.utils.fromWei(totalDailyDividend)} BNB`;
    document.getElementById("last-global-update").innerText = new Date(lastGlobalUpdate * 1000).toLocaleString();

    // ✅ Datos del usuario
    const userData = await contract.methods.users(account).call();
    document.getElementById("user-staked").innerText = `${web3.utils.fromWei(userData.stakedAmount)} BNB`;
    document.getElementById("pending-rewards").innerText = `${web3.utils.fromWei(userData.pendingRewards)} BNB`;
}

// ==========================
// 💰 Conexión con MetaMask
// ==========================
async function connectWallet() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    account = (await web3.eth.getAccounts())[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

// ==========================
// 🎯 Eventos de los botones
// ==========================
document.getElementById("stake-btn").addEventListener("click", async () => {
    const amount = document.getElementById("stake-amount").value;
    if (amount > 0) {
        await contract.methods.stake().send({
            from: account,
            value: web3.utils.toWei(amount, 'ether')
        });
        await updateStats();
    }
});

