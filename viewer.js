import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

// Load from config
const CONTRACT_ADDRESS = window.CONTRACT_ADDRESS;
const CONTRACT_ABI = window.CONTRACT_ABI;

const stateSelector = document.getElementById("stateSelector");
const nftImage = document.getElementById("nftImage");
const overlay = document.getElementById("overlay"); // for .gif sending animation
const statusEl = document.getElementById("status");
const sound = document.getElementById("teleport-sound");
const backgroundEl = document.querySelector(".background-layer");

let contract, signer;
let tokenId = 1; // Default or from URL param

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : `https://ipfs.io/ipfs/${cid}`;

// CIDs defined in config.js
const stateCIDs = {
  CID_DEFAULT_1: window.CID_DEFAULT_1,
  CID_DEFAULT_2: window.CID_DEFAULT_2,
  CID_MERGED: window.CID_MERGED,
  CID_SENDING: window.CID_SENDING,
  CID_GHOST: window.CID_GHOST,
};

const backgroundCID = "bafybeibk5wnczn3q3jhig2mjwb7i6mlfavzkp6wq72pt3b743cjy3s55om"; // Static background

window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("id")) {
    tokenId = parseInt(urlParams.get("id"));
  }

  // Apply background layer
  if (backgroundEl) {
    backgroundEl.style.backgroundImage = `url(${ipfsGateway(backgroundCID)})`;
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
    fallbackToGhost();
    return;
  }

  if (cidKey === "CID_SENDING") {
    // Show .gif briefly on overlay, then swap to merged
    teleportTransition(() => {
      overlay.src = ipfsGateway(newCID);
      overlay.classList.remove("hidden");

      setTimeout(() => {
        overlay.classList.add("hidden");
        simulateTeleport("CID_MERGED");
      }, 2000); // Duration to show gif
    });
  } else {
    teleportTransition(() => {
      nftImage.src = ipfsGateway(newCID);
      statusEl.textContent = `🖼️ Showing: ${cidKey.replace("CID_", "")}`;
    });
  }
}

function fallbackToGhost() {
  teleportTransition(() => {
    nftImage.src = ipfsGateway(stateCIDs["CID_GHOST"]);
    statusEl.textContent = "👻 Empty state (GHOST)";
  });
}

function teleportTransition(callback) {
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  nftImage.classList.add("shake");
  document.body.classList.add("flash");

  setTimeout(() => {
    nftImage.classList.remove("shake");
    document.body.classList.remove("flash");
    callback();
  }, 600);
}
