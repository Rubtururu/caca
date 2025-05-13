const CONTRACT_ADDRESS = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let provider, contract, signer, account;

const connectWalletButton = document.getElementById('connectWallet');
const stakeButton = document.getElementById('stakeButton');
const withdrawStakeButton = document.getElementById('withdrawStake');
const withdrawRewardsButton = document.getElementById('withdrawRewards');

// Conectar con MetaMask
connectWalletButton.addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Solicitar acceso a MetaMask
            signer = provider.getSigner();
            account = await signer.getAddress();
            document.getElementById('accountAddress').innerText = `Conectado como: ${account}`;
            contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
            updateDashboard(); // Actualizar la interfaz con los datos del contrato
        } catch (error) {
            alert('Error al conectar con MetaMask: ' + error.message);
        }
    } else {
        alert('MetaMask no está instalado.');
    }
});

// Actualizar los datos del contrato
const updateDashboard = async () => {
    try {
        const totalStaked = await contract.totalStaked();
        const totalTreasury = await contract.totalTreasury();
        const pendingRewards = await contract.getPendingRewards();
        const nextDistribution = await contract.getTimeUntilNextDistribution();

        document.getElementById('totalStaked').innerText = ethers.utils.formatEther(totalStaked);
        document.getElementById('totalTreasury').innerText = ethers.utils.formatEther(totalTreasury);
        document.getElementById('pendingRewards').innerText = ethers.utils.formatEther(pendingRewards);
        document.getElementById('nextDistribution').innerText = `${Math.floor(nextDistribution / 60)}m ${nextDistribution % 60}s`;
    } catch (error) {
        alert('Error al obtener datos del contrato: ' + error.message);
    }
};

// Función para hacer staking
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

// Función para retirar el staking
withdrawStakeButton.addEventListener('click', async () => {
    try {
        await contract.withdrawStake();
        alert('Stake retirado correctamente.');
        updateDashboard();
    } catch (error) {
        alert('Error al retirar el stake: ' + error.message);
    }
});

// Función para retirar las recompensas
withdrawRewardsButton.addEventListener('click', async () => {
    try {
        await contract.withdrawRewards();
        alert('Recompensas retiradas correctamente.');
        updateDashboard();
    } catch (error) {
        alert('Error al retirar recompensas: ' + error.message);
    }
});
