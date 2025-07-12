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
  CID_MERGED: window.CID_MERGED,
  CID_SENDING: window.CID_SENDING,
  CID_DEFAULT_2: window.CID_DEFAULT_2,
  CID_GHOST: window.CID_GHOST
};

window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("id")) {
    tokenId = parseInt(urlParams.get("id"));
  }

  document.getElementById("background-layer").style.backgroundImage =
    `url("https://ipfs.io/ipfs/bafybeibk5wnczn3q3jhig2mjwb7i6mlfavzkp6wq72pt3b743cjy3s55om")`;

  if (!window.ethereum) {
    statusEl.textContent = "🦊 MetaMask required.";
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    statusEl.textContent = `✅ Connected | Token #${tokenId}`;

    toggleBtn.addEventListener("click", handleToggle);

    simulateTeleport(stateOrder[currentIndex]);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Failed to connect.";
  }
};

function handleToggle() {
  currentIndex = (currentIndex + 1) % stateOrder.length;
  const nextKey = stateOrder[currentIndex];
  simulateTeleport(nextKey);
}

function simulateTeleport(cidKey) {
  const newCID = stateCIDs[cidKey];
  if (!newCID) {
    statusEl.textContent = "⚠️ CID not available.";
    return;
  }

  toggleBtn.disabled = true;

  if (cidKey === "CID_SENDING") {
    teleportTransition(() => {
      nftImage.style.visibility = "hidden";
      overlay.src = ipfsGateway(newCID);
      overlay.classList.remove("hidden");
      statusEl.textContent = `✈️ Sending...`;

      let handled = false;
      overlay.onload = () => {
        if (handled) return;
        handled = true;

        requestAnimationFrame(() => {
          setTimeout(() => {
            overlay.classList.add("hidden");

            overlay.addEventListener("transitionend", function handleFade() {
              overlay.removeEventListener("transitionend", handleFade);
              showDefault2State(); // Switch cleanly to CID_DEFAULT_2
            });
          }, 2000); // Match your GIF timing
        });
      };
    });
  } else {
    teleportTransition(() => {
      nftImage.src = ipfsGateway(newCID);
      nftImage.onload = () => {
        statusEl.textContent = `🖼️ Showing: ${cidKey.replace("CID_", "")}`;
      };
      overlay.classList.add("hidden");
      nftImage.style.visibility = "visible";
      toggleBtn.disabled = false;
    });
  }
}

function showDefault2State() {
  const defaultCID = stateCIDs["CID_DEFAULT_2"];
  if (!defaultCID) {
    statusEl.textContent = "⚠️ CID_DEFAULT_2 not available.";
    return;
  }

  nftImage.src = ipfsGateway(defaultCID);
  nftImage.onload = () => {
    statusEl.textContent = "🖼️ Showing: DEFAULT_2";
  };

  nftImage.style.visibility = "visible";
  overlay.classList.add("hidden");

  // ✅ Set index to point to the NEXT state, not current
  currentIndex = (stateOrder.indexOf("CID_DEFAULT_2") + 1) % stateOrder.length;

  toggleBtn.disabled = false;
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
