import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

const gateway = cid => cid.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cid.slice(7)}` : cid;

let provider, signer, contract;
let currentState = "default1";
const tokenId = 1;

const nftEl = document.getElementById("nftImage");
const ghostEl = document.getElementById("ghostLayer");
const cooldownEl = document.getElementById("cooldownDisplay");
const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("teleport-toggle");

async function init() {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(window.CONTRACT_ADDRESS, window.CONTRACT_ABI, signer);

    toggleBtn.addEventListener("click", toggleState);
    await updateUI();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Could not connect wallet";
  }
}

async function updateUI() {
  try {
    const state = await contract.getTeleportState(tokenId);
    const cooldown = Number(state.cooldownEndsAt);
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = cooldown - now;

    cooldownEl.textContent = timeLeft > 0 ? `⏳ Cooldown: ${timeLeft}s` : `✅ Ready`;

    const cid = state.currentCID || window.CID_GHOST;
    nftEl.src = gateway(cid);
    ghostEl.classList.toggle("hidden", cid !== window.CID_GHOST);
    statusEl.textContent = `CID: ${cid.slice(-8)}`;
  } catch (err) {
    console.warn("Fallback to GHOST:", err);
    nftEl.src = gateway(window.CID_GHOST);
    ghostEl.classList.remove("hidden");
    statusEl.textContent = "👻 Ghost mode";
  }
}

function toggleState() {
  nftEl.classList.add("flash");

  setTimeout(() => {
    nftEl.classList.remove("flash");

    if (currentState === "default1") {
      nftEl.src = gateway(window.CID_DEFAULT_2);
      currentState = "default2";
    } else if (currentState === "default2") {
      nftEl.src = gateway(window.CID_MERGED);
      currentState = "merged";
    } else if (currentState === "merged") {
      nftEl.src = gateway(window.CID_SENDING);
      currentState = "sending";
    } else {
      nftEl.src = gateway(window.CID_DEFAULT_1);
      currentState = "default1";
    }
  }, 500);
}

init();
