import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : cid;

const nftContractAddress = window.NFT_CONTRACT_ADDRESS;

let provider, signer;

let currentState = 0;
const cidStates = [
  window.CID_DEFAULT_1,
  window.CID_DEFAULT_2,
  window.CID_MERGED,
  window.CID_EMPTY
];

const imgEl = document.getElementById("nft-img");
const statusEl = document.getElementById("status");
const teleportBtn = document.getElementById("teleport-btn");
const messageIcon = document.getElementById("message");
const teleportSound = document.getElementById("teleport-sound");
const bgEl = document.getElementById("background-layer");

window.onload = async () => {
  // Set background
  bgEl.style.backgroundImage = `url(${ipfsGateway(window.BACKGROUND_CID)})`;

  // Set default image
  imgEl.src = ipfsGateway(cidStates[currentState]);
  statusEl.textContent = `🖼️ Displaying CID State ${currentState + 1}`;

  // Optional MetaMask check
  if (!window.ethereum) {
    statusEl.textContent = "🦊 MetaMask required (optional).";
    teleportBtn.disabled = false;
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
  } catch (err) {
    console.warn("⚠️ MetaMask not connected:", err);
  }

  teleportBtn.addEventListener("click", simulateTeleport);
};

function simulateTeleport() {
  teleportBtn.disabled = true;
  statusEl.textContent = "🚀 Simulating teleport...";
  playTeleportAnimation();

  setTimeout(() => {
    // Advance CID state
    currentState = (currentState + 1) % cidStates.length;
    imgEl.src = ipfsGateway(cidStates[currentState]);

    // Reset UI
    statusEl.textContent = `✅ Teleport complete! CID State ${currentState + 1}`;
    teleportBtn.disabled = false;
  }, 1200);
}

function playTeleportAnimation() {
  // Sound
  if (teleportSound) {
    teleportSound.currentTime = 0;
    teleportSound.play();
  }

  // Flash + Shake
  imgEl.classList.add("flash");
  imgEl.classList.add("shake");
  setTimeout(() => {
    imgEl.classList.remove("flash");
    imgEl.classList.remove("shake");
  }, 1000);
}
