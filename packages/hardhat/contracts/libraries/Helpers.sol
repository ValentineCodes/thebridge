// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

library Helpers {
  function extractFee(uint256 deposit) internal pure returns (uint256 amount, uint256 fee) {
    fee = deposit / 100; // 1% fee... Too generous?🧐
    amount = deposit - fee;
  }
}
