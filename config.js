// config.js
window.CONTRACT_ADDRESS = "0xYourContractAddress";
window.CONTRACT_ABI = [
  "function getTeleportState(uint256 tokenId) view returns (tuple(string currentCID, uint256 cooldownEndsAt, bool isOnlySender, bool isOnlyReceiver, bool hasRequest))",
  "function teleport(uint256 tokenId) external",
  "function requestTeleport(uint256 tokenId) external",
  "event Teleported(uint256 indexed tokenId, string newCID)",
  "event TeleportRequested(uint256 indexed tokenId)"
];