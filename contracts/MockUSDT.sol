// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing (6 decimals like real USDT)
 */
contract MockUSDT is ERC20 {
    uint8 private constant _DECIMALS = 6;
    
    constructor() ERC20("Tether USD", "USDT") {
        _mint(msg.sender, 1000000 * 10**_DECIMALS); // 1M USDT
    }
    
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function faucet() external {
        _mint(msg.sender, 10000 * 10**_DECIMALS); // 10k USDT
    }
}