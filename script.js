// ==========================
// 🔗 Configuración de Web3
// ==========================
let web3;
let contract;
let account;

// ✅ ABI y Dirección del contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; // Aquí debe estar el ABI completo del contrato
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Dirección del contrato en BSC

// ==========================
// 💰 Conectar con MetaMask
// ==========================
const connectWallet = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        account = (await web3.eth.getAccounts())[0];
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("🟢 Wallet conectada:", account);
        await updateStats();
        startCountdown();
    } else {
        alert("MetaMask no está instalada.");
    }
};

// ==========================
// 📊 Actualización de Datos
// ==========================
const updateStats = async () => {
    try {
        // 🔄 Estadísticas globales
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

        // ✅ Mostrar en la interfaz
        document.getElementById("total-staked").innerText = `${web3.utils.fromWei(totalStaked)} BNB`;
        document.getElementById("total-treasury").innerText = `${web3.utils.fromWei(totalTreasury)} BNB`;
        document.getElementById("total-daily-dividend").innerText = `${web3.utils.fromWei(totalDailyDividend)} BNB`;
        document.getElementById("last-global-update").innerText = new Date(lastGlobalUpdate * 1000).toLocaleString();

        // 🔄 Datos del usuario
        const userData = await contract.methods.users(account).call();
        const userShare = await contract.methods.getUserShare(account).call();
        const dailyEstimate = await contract.methods.getUserDailyDividendEstimate(account).call();
        const pendingRewards = await contract.methods.getPendingRewards(account).call();

        // ✅ Mostrar en la interfaz
        document.getElementById("user-staked").innerText = `${web3.utils.fromWei(userData.stakedAmount)} BNB`;
        document.getElementById("user-share").innerText = `${(userShare / 1e16).toFixed(2)} %`;
        document.getElementById("user-daily-dividend").innerText = `${web3.utils.fromWei(dailyEstimate)} BNB`;
        document.getElementById("pending-rewards").innerText = `${web3.utils.fromWei(pendingRewards)} BNB`;

    } catch (error) {
        console.error("❌ Error al actualizar las estadísticas:", error.message);
    }
};

// ==========================
// 🎯 Eventos de los botones
// ==========================
document.getElementById("stake-btn").addEventListener("click", async () => {
    const amount = document.getElementById("stake-amount").value;
    if (amount > 0) {
        try {
            await contract.methods.stake().send({
                from: account,
                value: web3.utils.toWei(amount, 'ether')
            });
            alert("✅ Stake completado con éxito.");
            await updateStats();
        } catch (error) {
            console.error("❌ Error en el Stake:", error.message);
        }
    } else {
        alert("Introduce una cantidad válida.");
    }
});

document.getElementById("withdraw-stake-btn").addEventListener("click", async () => {
    try {
        await contract.methods.withdrawStake().send({ from: account });
        alert("✅ Stake retirado con éxito.");
        await updateStats();
    } catch (error) {
        console.error("❌ Error al retirar Stake:", error.message);
    }
});

document.getElementById("withdraw-rewards-btn").addEventListener("click", async () => {
    try {
        await contract.methods.withdrawRewards().send({ from: account });
        alert("✅ Recompensas retiradas con éxito.");
        await updateStats();
    } catch (error) {
        console.error("❌ Error al retirar recompensas:", error.message);
    }
});

// ==========================
// ⏳ Cuenta regresiva
// ==========================
const startCountdown = async () => {
    setInterval(async () => {
        try {
            const timeLeft = await contract.methods.getTimeUntilNextDistribution(account).call();
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            document.getElementById("hours").innerText = String(hours).padStart(2, '0');
            document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
            document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
        } catch (error) {
            console.error("❌ Error en la cuenta regresiva:", error.message);
        }
    }, 1000);
};

// ==========================
// 🚀 Iniciar aplicación
// ==========================
window.addEventListener('load', connectWallet);


