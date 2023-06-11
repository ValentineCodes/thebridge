import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { useAccountBalance } from "~~/hooks/scaffold-eth";
import { getProvider } from "~~/utils/providers";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

type TBalanceProps = {
  address?: string;
  className?: string;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const Balance = ({ address, className = "" }: TBalanceProps) => {
  const configuredNetwork = getTargetNetwork();
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [balance, setBalance] = useState(null)
  const { chain, chains } = useNetwork()

  const readBalance = async () => {
    if(!address) return
    
    setIsLoading(true)
    try {
      const provider = getProvider(String(chain.id))
      const balance = await provider.getBalance(address!)

      setBalance(Number(ethers.utils.formatEther(balance)).toFixed(4))
      if(isError){
        setIsError(false)
      }
    } catch(error) {
      console.log(`Error reading balance`)
      console.error(error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    readBalance()
  }, [address, chain])

  const symbol = () => {
    if(!chain) return 
    switch (chain.name) {
      case "Sepolia":
        return "SEP";
        break;
      case "Chain 80001":
        return "MATIC";
        break
      default:
        break;
    }
  }

  if (!address || isLoading || balance === null) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`border-2 border-gray-400 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer`}>
        <div className="text-warning text-xs">Error</div>
      </div>
    );
  }

  return (
      <div className="w-full flex items-center justify-center">
            <span>{balance}</span>
            <span className="text-xs font-bold ml-1">{symbol()}</span>
      </div>
  );
};
