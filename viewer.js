import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

const ipfsGateway = cid =>
  cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : cid;

const contractAddress = window.CONTRACT_ADDRESS;
const contractABI = window.CONTRACT_ABI;

let provider, signer, contract;
let tokenId = 1;

const imgEl = document.getElementById("nft-img");
const statusEl = document.getElementById("status");
const messageIcon = document.getElementById("message");
const teleportSound = document.getElementById("teleport-sound");
const bgEl = document.getElementById("background-layer");
const slider = document.getElementById("cid-slider");

let currentCID = "";
let cooldownEndsAt = 0;

window.onload = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    tokenId = parseInt(urlParams.get("id")) || 1;

    bgEl.style.backgroundImage = `url(${ipfsGateway(window.BACKGROUND_CID)})`;

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    slider.addEventListener("input", onSliderChange);

    await refreshUI();
    setInterval(updateCooldown, 1000);
    listenToEvents();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Failed to load.";
  }
};

async function refreshUI() {
  try {
    const state = await contract.getTeleportState(tokenId);
    cooldownEndsAt = Number(state.cooldownEndsAt);
    currentCID = state.currentCID;

    imgEl.src = ipfsGateway(currentCID);
    messageIcon.textContent = cooldownEndsAt > Date.now() / 1000 ? "⏳ Cooldown" : "🟢 Ready";
    messageIcon.className = cooldownEndsAt > Date.now() / 1000 ? "message-icon active" : "message-icon muted";

    statusEl.textContent = `Token #${tokenId} - CID Preview`;
  } catch (err) {
    console.error("refreshUI failed", err);
    statusEl.textContent = "❌ Error loading state.";
  }
}

function updateCooldown() {
  const now = Math.floor(Date.now() / 1000);
  const diff = cooldownEndsAt - now;

  if (diff > 0) {
    statusEl.textContent = `⏳ Cooldown: ${diff}s`;
    slider.disabled = true;
  } else {
    slider.disabled = false;
  }
}

function onSliderChange(e) {
  const value = parseInt(e.target.value);
  let newCID;

  switch (value) {
    case 0:
      newCID = window.CID_DEFAULT_1;
      break;
    case 1:
      newCID = window.CID_DEFAULT_2;
      break;
    case 2:
      newCID = window.CID_MERGED;
      break;
    default:
      newCID = currentCID;
  }

  simulateTeleportEffect();
  imgEl.src = ipfsGateway(newCID);
}

function simulateTeleportEffect() {
  if (teleportSound) {
    teleportSound.currentTime = 0;
    teleportSound.play();
  }

  imgEl.classList.add("flash");
  imgEl.classList.add("shake");
  setTimeout(() => {
    imgEl.classList.remove("flash");
    imgEl.classList.remove("shake");
  }, 1000);
}

function listenToEvents() {
  contract.on("Teleported", async (_tokenId, newCID) => {
    if (Number(_tokenId) === tokenId) {
      currentCID = newCID;
      simulateTeleportEffect();
      await refreshUI();
    }
  });
}
