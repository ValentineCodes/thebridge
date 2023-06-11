import { ethers } from "ethers";

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

export interface Providers {
  "31337": string;
  "1": string;
  "11155111": string;
  "5": string;
  "42161": string;
  "421613": string;
  "10": string;
  "420": string;
  "137": string;
  "80001": string;
}
const providers = {
  "31337": "http://127.0.0.1:8545/",
  "1": `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "11155111": `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "5": `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "42161": `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "421613": `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "10": `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "420": `https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "137": `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  "80001": `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY}`,
};

export const getProvider = (chainId: keyof typeof providers) => {
  return new ethers.providers.JsonRpcProvider(providers[chainId]);
};
