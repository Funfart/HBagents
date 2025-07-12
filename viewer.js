import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

// Load contract details from config.js
const contractAddress = window.CONTRACT_ADDRESS;  // TeleportController contract
const contractABI = window.CONTRACT_ABI;

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : cid;

// Your NFT collection contract address (ERC-721 or ERC-1155)
const nftContractAddress = window.NFT_CONTRACT_ADDRESS;

let provider, signer, contract;
let tokenId;

const imgEl = document.getElementById("nft-img");
const statusEl = document.getElementById("status");
const teleportBtn = document.getElementById("teleport-btn");
const messageIcon = document.getElementById("message");
const teleportSound = document.getElementById("teleport-sound");
const bgEl = document.getElementById("background-layer");

let cooldownEndsAt = 0;

window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  tokenId = parseInt(urlParams.get("id") || "1");

  // Optional: set background image via IPFS CID
  bgEl.style.backgroundImage = `url(${ipfsGateway(window.BACKGROUND_CID)})`;

  if (!window.ethereum) {
    statusEl.textContent = "🦊 MetaMask required.";
    teleportBtn.disabled = true;
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    teleportBtn.addEventListener("click", onTeleport);

    await refreshUI();
    setInterval(updateCooldown, 1000);

    listenToEvents();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Connection failed.";
  }
};

async function refreshUI() {
  try {
    // Call getState(nftContractAddress, tokenId) on TeleportController
    const state = await contract.getState(nftContractAddress, tokenId);

    cooldownEndsAt = Number(state.lastTeleport) + 86400; // 1 day cooldown

    const isMerged = state.isMerged;
    const isSending = !isMerged && state.isCooldown;

    // Show appropriate image based on state
    if (isSending) {
      imgEl.src = ipfsGateway(window.CID_SENDING);
    } else {
      imgEl.src = ipfsGateway(state.currentCID);
    }

    // Update message icon and status
    // You can add more logic here based on your contract events
    messageIcon.textContent = state.isCooldown ? "⏳ Cooldown active" : "🟢 Ready";
    messageIcon.className = state.isCooldown ? "message-icon active" : "message-icon muted";

    updateCooldown();

    teleportBtn.disabled = false;
    statusEl.textContent = `Displaying Token #${tokenId}`;
  } catch (err) {
    console.error("refreshUI error:", err);
    statusEl.textContent = "❌ Could not fetch state.";
  }
}

function updateCooldown() {
  if (!cooldownEndsAt) return;
  const now = Math.floor(Date.now() / 1000);
  const diff = cooldownEndsAt - now;

  if (diff > 0) {
    statusEl.textContent = `⏳ Cooldown: ${diff}s`;
    teleportBtn.classList.add("btn-disabled");
  } else {
    statusEl.textContent = `🟢 Ready`;
    teleportBtn.classList.remove("btn-disabled");
  }
}

async function onTeleport() {
  try {
    teleportBtn.disabled = true;
    statusEl.textContent = "🚀 Teleporting...";

    // Example: teleport to paired token (tokenId 1 <-> 2)
    const toId = tokenId === 1 ? 2 : 1;

    // Call teleport function on contract
    const tx = await contract.teleport(nftContractAddress, tokenId, toId);
    await tx.wait();

    statusEl.textContent = "✅ Teleport complete!";
    await refreshUI();
  } catch (err) {
    console.error("Teleport error:", err);
    statusEl.textContent = "❌ Teleport failed.";
  } finally {
    teleportBtn.disabled = false;
  }
}

function playTeleportEffect() {
  teleportSound.currentTime = 0;
  teleportSound.play();
  document.body.style.filter = "invert(1)";
  setTimeout(() => {
    document.body.style.filter = "invert(0)";
  }, 600);
}

function listenToEvents() {
  contract.on("TeleportTriggered", async (_nft, fromId, toId, newFromCID, newToCID) => {
    if (Number(fromId) === tokenId || Number(toId) === tokenId) {
      playTeleportEffect();
      await refreshUI();
    }
  });

  contract.on("CooldownStarted", async (_nft, tId) => {
    if (Number(tId) === tokenId) {
      await refreshUI();
    }
  });
}