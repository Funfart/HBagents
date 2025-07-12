window.CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with real address
window.CONTRACT_ABI = [
  "function getTeleportState(uint256 tokenId) view returns (tuple(string currentCID, uint256 cooldownEndsAt, bool isOnlySender, bool isOnlyReceiver, bool hasRequest))",
  "function teleport(uint256 tokenId) external",
  "function requestTeleport(uint256 tokenId) external",
  "event Teleported(uint256 indexed tokenId, string newCID)",
  "event TeleportRequested(uint256 indexed tokenId)"
];

//window.CID_DEFAULT_1 = "ipfs://bafybeiclhpw4ila6u7oejt2zmezxrffl44dxjkxyfjbacawgcighlghr4i";
window.CID_MERGED     = "ipfs://bafybeiayekrbt5rirlewyq6zfqx6r3ygwfsrwjqdmqohxcr5rmo5c2tadm";
window.CID_SENDING    = "ipfs://bafybeidrzpoooah2mlnjmwhuvpg6o4vqqxsrgkgn3rwnqlsffttp5zrg4i";
window.CID_DEFAULT_2 = "ipfs://bafybeieiht7rijbauvain7fjz7ankjocrk4bz6d7vprqpscmuvfuevbmhy";
window.CID_GHOST      = "ipfs://bafybeigddxpm5fjmhxjmtwndbj7f47uuoknnzebpfvy4revunbggaaxeg4";
