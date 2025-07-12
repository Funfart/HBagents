import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

// Load from config
const CONTRACT_ADDRESS = window.CONTRACT_ADDRESS;
const CONTRACT_ABI = window.CONTRACT_ABI;

const stateSelector = document.getElementById("stateSelector");
const nftImage = document.getElementById("nftImage");
const statusEl = document.getElementById("status");
const sound = document.getElementById("teleport-sound");

let contract, signer;
let tokenId = 1; // Default, or read from URL

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : `https://ipfs.io/ipfs/${cid}`;

// Map config variable names to actual CID values (you can define these in config.js)
const stateCIDs = {
  CID_DEFAULT_1: window.CID_DEFAULT_1,
  CID_DEFAULT_2: window.CID_DEFAULT_2,
  CID_MERGED: window.CID_MERGED,
  CID_SENDING: window.CID_SENDING
};

window.onload = async () => {
  // Optional: grab token ID from ?id= param
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("id")) {
    tokenId = parseInt(urlParams.get("id"));
  }

  if (!window.ethereum) {
    statusEl.textContent = "🦊 MetaMask required.";
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    statusEl.textContent = `Connected to wallet. Token ID #${tokenId}`;

    stateSelector.addEventListener("change", () => {
      simulateTeleport(stateSelector.value);
    });

    simulateTeleport("CID_DEFAULT_1");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Failed to connect.";
  }
};

function simulateTeleport(cidKey) {
  const newCID = stateCIDs[cidKey];
  if (!newCID) {
    statusEl.textContent = "⚠️ CID not available.";
    return;
  }

  teleportTransition(() => {
    nftImage.src = ipfsGateway(newCID);
    statusEl.textContent = `🖼️ Showing: ${cidKey.replace("CID_", "")}`;
  });
}

function teleportTransition(callback) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
  nftImage.classList.add("shake");
  document.body.classList.add("flash");

  setTimeout(() => {
    nftImage.classList.remove("shake");
    document.body.classList.remove("flash");
    callback();
  }, 600);
}
