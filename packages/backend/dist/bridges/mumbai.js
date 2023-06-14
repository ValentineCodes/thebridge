"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PROVIDER_API_KEY = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// providers
const mumbaiProvider = new ethers_1.ethers.providers.JsonRpcProvider(`wss://polygon-mumbai.g.alchemy.com/v2/${PROVIDER_API_KEY}`);
const sepoliaProvider = new ethers_1.ethers.providers.JsonRpcProvider(`wss://eth-sepolia.g.alchemy.com/v2/${PROVIDER_API_KEY}`);
// signers
const mumbaiSigner = new ethers_1.ethers.Wallet(PRIVATE_KEY).connect(mumbaiProvider);
const sepoliaSigner = new ethers_1.ethers.Wallet(PRIVATE_KEY).connect(sepoliaProvider);
// contracts
const NativeTokenVault = JSON.parse(fs.readFileSync("./contracts/mumbai/NativeTokenVault.json", {
    encoding: "utf8",
}));
const NativeTokenClone = JSON.parse(fs.readFileSync("./contracts/mumbai/NativeTokenClone.json", {
    encoding: "utf8",
}));
console.log(`MATIC vault: ${NativeTokenVault.address}`);
console.log(`MATIC Clone: ${NativeTokenClone.address}`);
// contract instances
const vault = new ethers_1.ethers.Contract(NativeTokenVault.address, NativeTokenVault.abi, mumbaiSigner);
const tokenClone = new ethers_1.ethers.Contract(NativeTokenClone.address, NativeTokenClone.abi, sepoliaSigner);
exports.default = () => {
    const handleDeposits = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("listening for MATIC deposits...");
        // console.log("-----");
        vault.on("Deposit", (depositor, amount, nonce) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`${depositor} deposited ${ethers_1.ethers.utils.formatEther(amount)} MATIC(fee: 0.01 MATIC)✅`);
            // const oldBal = await tokenClone.balanceOf(depositor);
            // console.log(`old balance: ${ethers.utils.formatEther(oldBal)} ETHc`);
            try {
                const tx = yield tokenClone.mint(depositor, amount, nonce);
                yield tx.wait(1);
                console.log(`minted ${ethers_1.ethers.utils.formatEther(amount)} MATIC to ${depositor}✅`);
                console.log("----------");
            }
            catch (error) {
                console.log("Error minting deposited amount!");
                console.error(error);
            }
            // const newBal = await tokenClone.balanceOf(depositor);
            // console.log(`new balance: ${ethers.utils.formatEther(newBal)} ETHc`);
            // console.log("-----");
        }));
    });
    const handleWithdrawals = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("listening for MATICc withdrawals...");
        // console.log("-----");
        tokenClone.on("Withdraw", (withdrawer, amount, nonce) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`${withdrawer} burned ${ethers_1.ethers.utils.formatEther(amount)} MATICc`);
            // const oldBal = await mumbaiProvider.getBalance(withdrawer);
            // console.log(`old balance: ${ethers.utils.formatEther(oldBal)} ETH`);
            try {
                const tx = yield vault.transfer(withdrawer, amount, nonce);
                yield tx.wait(1);
                console.log(`transferred ${ethers_1.ethers.utils.formatEther(amount)} MATIC✅ to ${withdrawer}`);
                console.log("----------");
            }
            catch (error) {
                console.log("Error transferring burned amount!");
                console.error(error);
            }
            // const newBal = await mumbaiProvider.getBalance(withdrawer);
            // console.log(`new balance: ${ethers.utils.formatEther(newBal)} ETH`);
            // console.log("-----");
        }));
    });
    handleDeposits().catch((error) => {
        console.error(error);
        process.exit(1);
    });
    handleWithdrawals().catch((error) => {
        console.error(error);
        process.exit(1);
    });
};
