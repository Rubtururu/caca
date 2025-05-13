// ==========================
// 🔗 Configuración de Web3
// ==========================
let web3;
let contract;
let account;

// ✅ ABI y Dirección del contrato
const contractABI = [...]; // Coloca aquí el ABI del contrato
const contractAddress = "0xYourContractAddress"; // Dirección del contrato en BSC

// ==========================
// 💰 Conexión con MetaMask
// ==========================
async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            account = (await web3.eth.getAccounts())[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            updateStats();
            startCountdown();
        } catch (error) {
            console.error("Error al conectar MetaMask:", error);
        }
    } else {
        alert("Por favor, instala MetaMask.");
    }
}

// ==========================
// 📊 Actualización de Datos
// ==========================
async function updateStats() {
    // Estadísticas globales
    const [totalStaked, totalTreasury, totalDailyDividend] = await Promise.all([
        contract.methods.totalStaked().call(),
        contract.methods.totalTreasury().call(),
        contract.methods.getTotalDailyDividend().call()
    ]);

    const lastGlobalUpdate = await contract.methods.lastGlobalUpdate().call();
    const totalStakers = await contract.methods.stakers().call();

    document.getElementById("total-staked").innerText = `${web3.utils.fromWei(totalStaked)} BNB`;
    document.getElementById("total-treasury").innerText = `${web3.utils.fromWei(totalTreasury)} BNB`;
    document.getElementById("total-daily-dividend").innerText = `${web3.utils.fromWei(totalDailyDividend)} BNB`;
    document.getElementById("total-stakers").innerText = `${totalStakers.length}`;
    document.getElementById("last-global-update").innerText = new Date(lastGlobalUpdate * 1000).toLocaleString();

    // Estadísticas del usuario
    const [userShare, userDailyDividend, pendingRewards, userStaked] = await Promise.all([
        contract.methods.getUserShare(account).call(),
        contract.methods.getUserDailyDividendEstimate(account).call(),
        contract.methods.getPendingRewards(account).call(),
        contract.methods.users(account).call()
    ]);

    document.getElementById("user-share").innerText = `${(userShare / 1e16).toFixed(2)}%`;
    document.getElementById("user-daily-dividend").innerText = `${web3.utils.fromWei(userDailyDividend)} BNB`;
    document.getElementById("pending-rewards").innerText = `${web3.utils.fromWei(pendingRewards)} BNB`;
    document.getElementById("user-staked").innerText = `${web3.utils.fromWei(userStaked.stakedAmount)} BNB`;
}

// ==========================
// ⏳ Cuenta Regresiva
// ==========================
function startCountdown() {
    setInterval(async () => {
        const timeLeft = await contract.methods.getTimeUntilNextDistribution(account).call();
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            document.getElementById("hours").innerText = String(hours).padStart(2, '0');
            document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
            document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
        } else {
            document.getElementById("countdown").innerText = "Distribución en proceso...";
        }
    }, 1000);
}

// ==========================
// 🔄 Funciones del Contrato
// ==========================
async function stake() {
    const amount = document.getElementById("stake-amount").value;
    if (amount > 0) {
        try {
            await contract.methods.stake().send({
                from: account,
                value: web3.utils.toWei(amount, 'ether')
            });
            alert("Stake realizado correctamente!");
            updateStats();
        } catch (error) {
            alert("Error al realizar el Stake.");
            console.error(error);
        }
    } else {
        alert("Ingresa una cantidad válida.");
    }
}

async function withdrawStake() {
    try {
        await contract.methods.withdrawStake().send({ from: account });
        alert("Stake retirado correctamente!");
        updateStats();
    } catch (error) {
        alert("Error al retirar el Stake.");
        console.error(error);
    }
}

async function withdrawRewards() {
    try {
        await contract.methods.withdrawRewards().send({ from: account });
        alert("Recompensas retiradas correctamente!");
        updateStats();
    } catch (error) {
        alert("Error al retirar las recompensas.");
        console.error(error);
    }
}

// ==========================
// 🎯 Eventos de los botones
// ==========================
document.getElementById("stake-btn").addEventListener("click", stake);
document.getElementById("withdraw-stake-btn").addEventListener("click", withdrawStake);
document.getElementById("withdraw-rewards-btn").addEventListener("click", withdrawRewards);

// 🔗 Conectar al wallet y cargar estadísticas
connectWallet();
