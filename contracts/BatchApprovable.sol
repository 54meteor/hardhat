// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC721/IERC721Receiver.sol)
pragma solidity ^0.8.0;
interface BatchApprovable {
	function approveBatch(address[] memory accounts, uint256[] memory amounts) external;
	event ApproveBatch(address indexed owner, address[] accounts, uint256[] amounts);
}