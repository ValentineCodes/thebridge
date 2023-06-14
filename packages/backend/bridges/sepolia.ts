import { ethers } from "ethers";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const PROVIDER_API_KEY =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// providers
const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.g.alchemy.com/v2/${PROVIDER_API_KEY}`
);
const sepoliaProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${PROVIDER_API_KEY}`
);

// signers
const mumbaiSigner = new ethers.Wallet(PRIVATE_KEY).connect(mumbaiProvider);
const sepoliaSigner = new ethers.Wallet(PRIVATE_KEY).connect(sepoliaProvider);

// contracts
const NativeTokenVault = JSON.parse(
  fs.readFileSync("./contracts/sepolia/NativeTokenVault.json", {
    encoding: "utf8",
  })
);
const NativeTokenClone = JSON.parse(
  fs.readFileSync("./contracts/sepolia/NativeTokenClone.json", {
    encoding: "utf8",
  })
);

console.log(`ETH vault: ${NativeTokenVault.address}`);
console.log(`ETH Clone: ${NativeTokenClone.address}`);

// contract instances
const vault = new ethers.Contract(
  NativeTokenVault.address,
  NativeTokenVault.abi,
  sepoliaSigner
);
const tokenClone = new ethers.Contract(
  NativeTokenClone.address,
  NativeTokenClone.abi,
  mumbaiSigner
);

export default () => {
  const handleDeposits = async () => {
    console.log("listening for ETH deposits...");
    // console.log("-----");

    vault.on("Deposit", async (depositor, amount, nonce) => {
      console.log(
        `${depositor} deposited ${ethers.utils.formatEther(
          amount
        )} ETH(fee: 0.01 ETH)✅`
      );

      // const oldBal = await tokenClone.balanceOf(depositor);
      // console.log(`old balance: ${ethers.utils.formatEther(oldBal)} ETHc`);

      try {
        const tx = await tokenClone.mint(depositor, amount, nonce);
        await tx.wait(1);
        console.log(
          `minted ${ethers.utils.formatEther(amount)} ETHc to ${depositor}✅`
        );
        console.log("----------");
      } catch (error) {
        console.log("Error minting deposited amount!");
        console.error(error);
      }

      // const newBal = await tokenClone.balanceOf(depositor);
      // console.log(`new balance: ${ethers.utils.formatEther(newBal)} ETHc`);
      // console.log("-----");
    });
  };

  const handleWithdrawals = async () => {
    console.log("listening for ETHc withdrawals...");
    // console.log("-----");

    tokenClone.on("Withdraw", async (withdrawer, amount, nonce) => {
      console.log(
        `${withdrawer} burned ${ethers.utils.formatEther(amount)} ETHc✅`
      );

      // const oldBal = await mumbaiProvider.getBalance(withdrawer);
      // console.log(`old balance: ${ethers.utils.formatEther(oldBal)} ETH`);

      try {
        const tx = await vault.transfer(withdrawer, amount, nonce);
        await tx.wait(1);
        console.log(
          `transferred ${ethers.utils.formatEther(
            amount
          )} ETH✅ to ${withdrawer}`
        );
        console.log("----------");
      } catch (error) {
        console.log("Error transferring burned amount!");
        console.error(error);
      }

      // const newBal = await mumbaiProvider.getBalance(withdrawer);
      // console.log(`new balance: ${ethers.utils.formatEther(newBal)} ETH`);
      // console.log("-----");
    });
  };

  handleDeposits().catch((error) => {
    console.error(error);
    process.exit(1);
  });

  handleWithdrawals().catch((error) => {
    console.error(error);
    process.exit(1);
  });
};
