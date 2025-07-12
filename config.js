// config.js

window.CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with your actual contract
window.CONTRACT_ABI = [
  "function getTeleportState(uint256 tokenId) view returns (tuple(string currentCID, uint256 cooldownEndsAt, bool isOnlySender, bool isOnlyReceiver, bool hasRequest))",
  "function teleport(uint256 tokenId) external",
  "function requestTeleport(uint256 tokenId) external",
  "event Teleported(uint256 indexed tokenId, string newCID)",
  "event TeleportRequested(uint256 indexed tokenId)"
];

// ✅ Define your actual CIDs below
window.CID_DEFAULT_1 = "ipfs://bafkreib43lx3zuxvszcf5o5c4rmfrybbvnkzvw4xsgvhid7rqbeipd6mnu";
window.CID_DEFAULT_2 = "ipfs://bafkreihdwdceikckrbbokx7nwkkt2gf6m6xw3o4jygs32f4st4ihmuvmu4";
window.CID_MERGED     = "ipfs://bafybeid37wbk2gnro4qcfhrhe3phzdqqra7txmtqmv5qajcujgmzzv6xju";
window.CID_SENDING    = "ipfs://bafkreicpl36unqtzsn2vmz5pbgci6mjui7ylxtdjl5cn7pp7mdhd6ts7sm";
