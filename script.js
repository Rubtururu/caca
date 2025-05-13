// ==============================
// Interacciones con SmartStakingBNB - Versión Mejorada
// ==============================

let web3;
let contract;
let account;

// ABI y Dirección del contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; // Agrega el ABI del contrato aquí
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Dirección del contrato

// Conectar con MetaMask
async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            account = (await web3.eth.getAccounts())[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            document.getElementById("connect-wallet").innerText = `Conectado: ${account}`;
            updateStats();
            startCountdown();
        } catch (error) {
            console.log("Error al conectar MetaMask", error);
        }
    } else {
        alert("Por favor, instala MetaMask.");
    }
}

document.getElementById("connect-wallet").addEventListener("click", connectWallet);

// Actualización de estadísticas
async function updateStats() {
    await updateUserStats();
    await updateGlobalStats();
}

// Estadísticas del usuario
async function updateUserStats() {
    const userShare = await contract.methods.getUserShare(account).call();
    const userDailyDividend = await contract.methods.getUserDailyDividendEstimate(account).call();
    const timeUntilNext = await contract.methods.getTimeUntilNextDistribution(account).call();
    const pendingRewards = await contract.methods.getPendingRewards(account).call();

    document.getElementById("user-share").innerHTML = `Tu Participación: <span>${web3.utils.fromWei(userShare)}%</span>`;
    document.getElementById("user-daily-dividend").innerHTML = `Dividendos Estimados: <span>${web3.utils.fromWei(userDailyDividend)} BNB</span>`;
    document.getElementById("time-until-next").innerHTML = `Próxima Distribución: <span>${formatTime(timeUntilNext)}</span>`;
    document.getElementById("pending-rewards").innerHTML = `Recompensas Pendientes: <span>${web3.utils.fromWei(pendingRewards)} BNB</span>`;

    startCountdown(timeUntilNext);
}

// Estadísticas globales
async function updateGlobalStats() {
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDailyDividend = await contract.methods.getTotalDailyDividend().call();
    const stakersCount = await contract.methods.stakers().call();

    document.getElementById("total-staked").innerHTML = `Total Apostado: <span>${web3.utils.fromWei(totalStaked)} BNB</span>`;
    document.getElementById("total-treasury").innerHTML = `Tesorería Total: <span>${web3.utils.fromWei(totalTreasury)} BNB</span>`;
    document.getElementById("total-daily-dividend").innerHTML = `Dividendos Diarios: <span>${web3.utils.fromWei(totalDailyDividend)} BNB</span>`;
    document.getElementById("total-stakers").innerHTML = `Total de Stakers: <span>${stakersCount.length}</span>`;
}

// Cuenta regresiva para la próxima distribución
function startCountdown(seconds) {
    const countdown = document.getElementById("countdown");
    const interval = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(interval);
            countdown.innerText = "Distribución en curso...";
            updateStats();
        } else {
            countdown.innerText = formatTime(seconds);
            seconds--;
        }
    }, 1000);
}

// Formatear tiempo
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

console.log("SmartStakingBNB UI mejorada correctamente.");
