// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BuidlGuidl is ERC20 {
  constructor() ERC20("BuidlGuidl", "BG") {
    _mint(msg.sender, 10000 ether);
  }

  function mint(uint256 amount) external {
    _mint(msg.sender, amount);
  }
}
