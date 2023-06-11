// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NotOwner();

contract AfterLife is ERC20 {
  constructor() ERC20("AfterLife", "AL") {
    _mint(msg.sender, 1000000000000000 * 10 ** 18);
  }
}
