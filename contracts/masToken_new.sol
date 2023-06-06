// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BatchApprovable.sol";

contract MasToken is ERC20, ERC20Burnable, Pausable, AccessControl, ERC20Permit, ERC20Votes, BatchApprovable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MINTTIME_ROLE = keccak256("MINTTIME_ROLE");
	uint256 public constant TOTAL_LIMIT = 1000000000 * 1000000000000000000;

	struct MintTime{
		uint256 total;
		uint256 amount;
		uint256 time;
		bool minted;
	}

	event SetMintTimeEvent(uint[] times, uint256[] amounts);
	event AddMintTimeEvent(uint[] times, uint256[] amounts);

	error MintTimeMustInSequence();
	error HasSetMintTime();
	error OverFlowTotalLimit();
	error NotMintTimeYet();
	error OverFlowerMintAmount();
	error TotalAmountNotEqualToTotalLimit();

	bool private _hasSetMintTime;
	MintTime[] private _mintTime;

    constructor() ERC20("MasToken", "MAS") ERC20Permit("MasToken") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MINTTIME_ROLE, msg.sender);

		_hasSetMintTime = false;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
		uint256 total = totalSupply();
		if(total + amount > TOTAL_LIMIT){
			revert OverFlowTotalLimit();
		}
		bool flag = false;
		uint idx = 0;
		for(uint i=0; i<_mintTime.length; i++){
			if(_mintTime[i].minted){
				continue;
			}
			if(_mintTime[i].time <= block.timestamp){
				if(_mintTime[idx].amount < amount){
					revert OverFlowerMintAmount();
				}
				flag = true;
				idx = i;
				break;
			}
		}
		if(!flag){
			revert NotMintTimeYet();
		}

        _mint(to, amount);
		
		_mintTime[idx].amount = _mintTime[idx].amount - amount;
		if(_mintTime[idx].amount == 0){
			_mintTime[idx].minted = true;
		}
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

	// 自定义的函数

	function setMintTime(uint[] memory times, uint256[] memory amounts) public onlyRole(MINTTIME_ROLE) {
		if(_hasSetMintTime){
			revert HasSetMintTime();
		}
		if(times.length == 0){
			revert("please input time points");
		}
		for(uint i=0; i<times.length-1; i++){
			if(times[i] >= times[i+1]){
				revert MintTimeMustInSequence();
			}
		}

		uint256 total = 0;
		for(uint i=0; i<times.length; i++){
			total += amounts[i];
		}
		if(total > TOTAL_LIMIT){
			revert OverFlowTotalLimit();
		}

		for(uint i=0; i<times.length; i++){
			_mintTime.push(MintTime(
				amounts[i],
				amounts[i],
				times[i],
				false
			));
		}

		emit SetMintTimeEvent(times, amounts);
		
		_hasSetMintTime = true;
	}

	function addMintTime(uint[] memory times, uint256[] memory amounts) public onlyRole(MINTTIME_ROLE){
		if(times.length == 0){
			revert("please input time points");
		}
		for(uint i=0; i<times.length-1; i++){
			if(times[i] >= times[i+1]){
				revert MintTimeMustInSequence();
			}
		}

		uint sz = _mintTime.length;
		if(sz == 0){
			setMintTime(times, amounts);
			return;
		}

		MintTime storage mintm = _mintTime[sz-1];
		if(mintm.time >= times[0]){
			revert MintTimeMustInSequence();
		}

		uint256 total = 0;
		for(uint i=0; i<_mintTime.length; i++){
			total += _mintTime[i].total;
		}
		for(uint i=0; i<times.length; i++){
			total += amounts[i];
		}
		if(total > TOTAL_LIMIT){
			revert OverFlowTotalLimit();
		}

		for(uint i=0; i<times.length; i++){
			_mintTime.push(MintTime(
				amounts[i],
				amounts[i],
				times[i],
				false
			));
		}

		emit AddMintTimeEvent(times, amounts);
	}

	function getMintTime() public view returns (MintTime[] memory) {
		if(_mintTime.length == 0){
			return new MintTime[](0);
		}
		MintTime[] memory times = new MintTime[](_mintTime.length);
		for(uint i=0; i<_mintTime.length; i++){
			times[i] = _mintTime[i];
		}

		return times;
	}

	function approveBatch(address[] memory accounts, uint256[] memory amounts) public {
		for(uint i=0; i<accounts.length; i++){
			approve(accounts[i], amounts[i]);
		}
		emit ApproveBatch(msg.sender, accounts, amounts);
	}

}
