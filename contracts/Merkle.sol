// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract Merkle {
    
    using Address for address;
    bytes32 public merkleRoot;

    function launchpad(bytes32 _merkleRoot) public {
        merkleRoot = _merkleRoot;
    }

    function claim(address target, uint256 roundID, uint256 index, bytes calldata calldataABI, bytes32[] calldata merkleProof) public {
        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(roundID,index,calldataABI));
        // console.logBytes(abi.encodePacked(calldataABI));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "Invalid Proof");

        target.functionCall(calldataABI, "call function fail.");
    }

    function c(address target, bytes calldata calldataABI) public {
        target.functionCall(calldataABI, "call function fail.");
    }


    function v(uint256 roundID, uint256 index,bytes calldata calldataABI, bytes32[] calldata merkleProof,bytes32 root) view public returns (bool){
        bytes32 node = keccak256(abi.encodePacked(roundID,index,calldataABI));
        console.logBytes(abi.encodePacked(calldataABI));
        console.logBytes32(node);
        return MerkleProof.verify(merkleProof, root, node);
    }
}