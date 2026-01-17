import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

// Load from config
const CONTRACT_ADDRESS = window.CONTRACT_ADDRESS;
const CONTRACT_ABI = window.CONTRACT_ABI;

// DOM elements
const nftImage = document.getElementById("nftImage");
const overlay = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const sound = document.getElementById("teleport-sound");
const toggleBtn = document.getElementById("teleport-toggle");

// State order for toggling
const stateOrder = ["CID_MERGED", "CID_SENDING", "CID_DEFAULT_2", "CID_GHOST"];
let currentIndex = 0;

let contract, signer;
let tokenId = 1; // Default fallback

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : `https://ipfs.io/ipfs/${cid}`;

// Define all state CIDs
const stateCIDs = {
  //CID_DEFAULT_1: window.CID_DEFAULT_1,
 
  CID_MERGED: window.CID_MERGED,
  CID_SENDING: window.CID_SENDING, 
  CID_DEFAULT_2: window.CID_DEFAULT_2,
  CID_GHOST: window.CID_GHOST
};

window.onload = async () => {
  // Get tokenId from query param if available
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("id")) {
    tokenId = parseInt(urlParams.get("id"));
  }

  // Background stays static
  document.getElementById("background-layer").style.backgroundImage = `url("https://ipfs.io/ipfs/bafybeibk5wnczn3q3jhig2mjwb7i6mlfavzkp6wq72pt3b743cjy3s55om")`;

  if (!window.ethereum) {
    statusEl.textContent = "🦊 MetaMask required.";
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    statusEl.textContent = `✅ Connected | Token #${tokenId}`;

    // Setup toggle button
    toggleBtn.addEventListener("click", handleToggle);

    // Start with default state
    simulateTeleport(stateOrder[currentIndex]);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Failed to connect.";
  }
};

function handleToggle() {
  // Advance to next state
  currentIndex = (currentIndex + 1) % stateOrder.length;
  const nextKey = stateOrder[currentIndex];
  simulateTeleport(nextKey);
}

let userCanToggle = true; // global flag

function simulateTeleport(cidKey) {
  const newCID = stateCIDs[cidKey];
  if (!newCID) {
    statusEl.textContent = "⚠️ CID not available.";
    return;
  }

  // Block user toggling during animation
  toggleBtn.disabled = true;

  if (cidKey === "CID_SENDING") {
    teleportTransition(() => {
      overlay.src = ipfsGateway(newCID);
      overlay.classList.add("shift-right");
      overlay.classList.remove("hidden");
      statusEl.textContent = `✈️ Sending...`;

      // Wait until overlay (GIF) fully loads before starting transition timer
      overlay.onload = () => {
        setTimeout(() => {
          overlay.classList.add("hidden");
          simulateTeleport("CID_DEFAULT_2");

          // Reset current index to CID_DEFAULT_2
          currentIndex = stateOrder.indexOf("CID_DEFAULT_2");
          toggleBtn.disabled = false;
        }, 2000); // ⏱️ Adjust timing to match half of your .gif loop
      };
    });
  } else {
    teleportTransition(() => {
      nftImage.src = ipfsGateway(newCID);
      overlay.classList.add("hidden");
      statusEl.textContent = `🖼️ Showing: ${cidKey.replace("CID_", "")}`;
      toggleBtn.disabled = false;
    });
  }
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
