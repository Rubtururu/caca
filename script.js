// Conexión con MetaMask
let web3;
let contract;
let userAccount;
let contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";  // Dirección de tu contrato desplegado

// ABI del contrato, usa la ABI de tu contrato desplegado
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// Al cargar la página
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = (await web3.eth.getAccounts())[0];
            contract = new web3.eth.Contract(abi, contractAddress);
            document.getElementById('connect-wallet-btn').innerText = 'Conectado: ' + userAccount;
            updateUI();  // Actualizar estadísticas al cargar
        } catch (error) {
            console.error("Error al conectar con MetaMask: ", error);
        }
    } else {
        alert("MetaMask no está instalado");
    }
});

// Función para actualizar las estadísticas del contrato y del usuario
async function updateUI() {
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDailyDividend = await contract.methods.getTotalDailyDividend().call();
    const lastGlobalUpdate = await contract.methods.lastGlobalUpdate().call();
    const userStaked = await contract.methods.users(userAccount).call().then(res => res.stakedAmount);
    const userShare = await contract.methods.getUserShare(userAccount).call();
    const userDailyDividend = await contract.methods.getUserDailyDividendEstimate(userAccount).call();
    const pendingRewards = await contract.methods.getPendingRewards(userAccount).call();

    // Mostrar estadísticas globales
    document.getElementById('total-staked').innerText = 'Total Staked: ' + web3.utils.fromWei(totalStaked, 'ether') + ' BNB';
    document.getElementById('total-treasury').innerText = 'Total Treasury: ' + web3.utils.fromWei(totalTreasury, 'ether') + ' BNB';
    document.getElementById('total-daily-dividend').innerText = 'Total Daily Dividend: ' + web3.utils.fromWei(totalDailyDividend, 'ether') + ' BNB';
    document.getElementById('last-global-update').innerText = 'Última Actualización Global: ' + new Date(lastGlobalUpdate * 1000).toLocaleString();

    // Mostrar estadísticas del usuario
    document.getElementById('user-staked').innerText = 'Stake del Usuario: ' + web3.utils.fromWei(userStaked, 'ether') + ' BNB';
    document.getElementById('user-share').innerText = 'Share del Usuario: ' + (userShare / 1e18 * 100).toFixed(2) + '%';
    document.getElementById('user-daily-dividend').innerText = 'Daily Dividend Estimado: ' + web3.utils.fromWei(userDailyDividend, 'ether') + ' BNB';
    document.getElementById('pending-rewards').innerText = 'Pending Rewards: ' + web3.utils.fromWei(pendingRewards, 'ether') + ' BNB';

    // Actualizar cuenta atrás para el siguiente pago
    updateCountdown();
}

// Función para actualizar la cuenta atrás
function updateCountdown() {
    const countdownElement = document.getElementById("countdown-timer");
    setInterval(async () => {
        const timeLeft = await contract.methods.getTimeUntilNextDistribution(userAccount).call();
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
            document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
            document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById("countdown-timer").innerText = "¡Dividendos disponibles!";
        }
    }, 1000);
}

// Función para hacer stake
document.getElementById("stake-btn").addEventListener("click", async () => {
    const amount = document.getElementById("stake-amount").value;
    if (amount > 0) {
        await contract.methods.stake().send({
            from: userAccount,
            value: web3.utils.toWei(amount, 'ether')
        });
        alert("Stake realizado con éxito");
        updateUI();  // Actualizar UI después de hacer stake
    } else {
        alert("Por favor, ingrese una cantidad válida");
    }
});

// Función para retirar stake
document.getElementById("withdraw-stake-btn").addEventListener("click", async () => {
    await contract.methods.withdrawStake().send({ from: userAccount });
    alert("Stake retirado con éxito");
    updateUI();  // Actualizar UI después de retirar stake
});

// Función para retirar recompensas
document.getElementById("withdraw-rewards-btn").addEventListener("click", async () => {
    await contract.methods.withdrawRewards().send({ from: userAccount });
    alert("Recompensas retiradas con éxito");
    updateUI();  // Actualizar UI después de retirar recompensas
});


