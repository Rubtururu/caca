// Configuración de Web3
let web3;
let contract;
let account;

// ABI y Dirección del contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; // Agrega el ABI del contrato aquí
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Dirección del contrato

// Conectar con MetaMask y la red BSC
async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            account = (await web3.eth.getAccounts())[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            updateStats();
        } catch (error) {
            console.log("Error al conectar MetaMask", error);
        }
    } else {
        alert("Por favor, instala MetaMask.");
    }
}

// Actualizar estadísticas del usuario
async function updateUserStats() {
    const userShare = await contract.methods.getUserShare(account).call();
    const userDailyDividend = await contract.methods.getUserDailyDividendEstimate(account).call();
    const timeUntilNext = await contract.methods.getTimeUntilNextDistribution(account).call();
    const pendingRewards = await contract.methods.getPendingRewards(account).call();

    document.getElementById("user-share").innerText = `Tu participación: ${web3.utils.fromWei(userShare)}%`;
    document.getElementById("user-daily-dividend").innerText = `Dividendo estimado diario: ${web3.utils.fromWei(userDailyDividend)} BNB`;
    document.getElementById("time-until-next").innerText = `Tiempo hasta la siguiente distribución: ${timeUntilNext} segundos`;
    document.getElementById("pending-rewards").innerText = `Recompensas pendientes: ${web3.utils.fromWei(pendingRewards)} BNB`;
}

// Actualizar estadísticas globales
async function updateGlobalStats() {
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDailyDividend = await contract.methods.getTotalDailyDividend().call();

    document.getElementById("total-staked").innerText = `Total apostado: ${web3.utils.fromWei(totalStaked)} BNB`;
    document.getElementById("total-treasury").innerText = `Tesorería total: ${web3.utils.fromWei(totalTreasury)} BNB`;
    document.getElementById("total-daily-dividend").innerText = `Dividendos diarios totales: ${web3.utils.fromWei(totalDailyDividend)} BNB`;
}

// Función para hacer stake
async function stake() {
    const amount = document.getElementById("stake-amount").value;
    if (amount > 0) {
        await contract.methods.stake().send({
            from: account,
            value: web3.utils.toWei(amount, 'ether')
        });
        updateStats();
    } else {
        alert("Por favor ingresa una cantidad válida.");
    }
}

// Función para retirar stake
async function withdrawStake() {
    await contract.methods.withdrawStake().send({ from: account });
    updateStats();
}

// Función para retirar recompensas
async function withdrawRewards() {
    await contract.methods.withdrawRewards().send({ from: account });
    updateStats();
}

// Actualizar todas las estadísticas
async function updateStats() {
    await updateUserStats();
    await updateGlobalStats();
}

// Configurar los eventos de los botones
document.getElementById("stake-btn").addEventListener("click", stake);
document.getElementById("withdraw-stake-btn").addEventListener("click", withdrawStake);
document.getElementById("withdraw-rewards-btn").addEventListener("click", withdrawRewards);

// Conectar al wallet y cargar estadísticas
connectWallet();
