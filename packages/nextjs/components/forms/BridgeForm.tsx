import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useAccount, useNetwork, erc20ABI } from 'wagmi'
import { sendTransaction, prepareSendTransaction } from '@wagmi/core'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from '../SelectNetwork'
import InputTokenAmountForm from './InputTokenAmountForm'
import Button from '../Button'
import { Select } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { notification } from '~~/utils/scaffold-eth'
import { getProvider } from '~~/utils/providers'

const ETHEREUM_NETWORKS = [{
  name: "Sepolia",
  chainId: 11155111
}]
const POLYGON_NETWORKS = [{
  name: "Mumbai",
  chainId: 80001
}]

export interface BridgeVault {
  name: string;
  address: string;
}
interface TokenClone {
  name: string;
  address: string;
}

const SEPOLIA_VAULTS = [{name: "ETH", address: "0x2D82563d0aF68c3e66aCf2Cf3a014A6b5Effd72B"}]
const MUMBAI_VAULTS = [{name: "MATIC", address: "0x34a6Cda938314782F330E6b7b6F2a97762623998"}]
const SEPOLIA_TOKENS_CLONES = [{name: "ETHc", address: "0x553Dacc2eca5D8e0810A98509A8E0A4e68D48792"}]
const MUMBAI_TOKENS_CLONES = [{name: "MATICc", address: "0xc4875dd18c7ebc75c259cfe4f22b2C3D3B653474"}]

type Props = {}
function BridgeForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  const [networkChainId, setNetworkChainId] = useState({layer1: ETHEREUM_NETWORKS[0].chainId, layer2: POLYGON_NETWORKS[0].chainId})
  const [selectedChainId, setSelectedChainId] = useState(ETHEREUM_NETWORKS[0].chainId)
  const [token, setToken] = useState({vault: "", amount: 0})
  const [receivedTokens, setReceivedTokens] = useState<TokenClone[] | null>(null)
  const {switchNetwork} = useSwitchNetwork()
  const {address: connectedAccount, isConnected} = useAccount()
  const [balance, setBalance] = useState<string | null>(null)
  const [isDepositing, setIsDepositing] = useState(false)
  const { chain, chains } = useNetwork()
  const [metamaskToken, setMetamaskToken] = useState<any>()

  const deposit = async () => {
    if(isDepositing) return
    if(!isConnected) {
      notification.info("Connect Wallet")
      return
    }
    if(token.amount <= 0) {
      notification.warning("Invalid amount!")
      return
    }
    if(balance !== null && token.amount > Number(balance)) {
      notification.error("Amount cannot exceed balance!")
      return
    }

    let notificationId = notification.loading("Depositing")
    setIsDepositing(true)
    try {
      const config = await prepareSendTransaction({
        request: { 
          to: token.vault,
          value: ethers.utils.parseEther(String(token.amount))
        }
      })
       
      const tx = await sendTransaction(config)
      await tx.wait(1)

      try {
        let cloneChainId
        if(chain?.id === 11155111) {
          cloneChainId = "80001"
        } else {
          cloneChainId = "11155111"
        }

        if(cloneChainId && receivedTokens) {
          const provider = getProvider(cloneChainId)
          const contract = new ethers.Contract(receivedTokens[0].address, erc20ABI, provider)
          const [symbol, decimals] = await Promise.all([
              contract.symbol(),
              contract.decimals()
          ])    
          setMetamaskToken({address: receivedTokens[0].address, symbol, decimals})
        }
      } catch(error) {
          console.log("failed to get token clone params")
          console.error(error)
      } finally {
        notification.success("Successful Deposit")
      }
    } catch(error) {
      notification.error(JSON.stringify(error))
    } finally{
      notification.remove(notificationId)
      setIsDepositing(false)
    }
  }

  const addTokenToMetamask = async () => {
    if(!metamaskToken) return
    if(!isConnected) {
        notification.info("Connect Wallet")
        return
    }
    if(!window.ethereum) {
        notification.info("Can't detect provider! Be sure to use the Metamask browser")
        return
    }
    try {
        const isAdded = await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: metamaskToken.address,
                    symbol: metamaskToken.symbol,   
                    decimals: metamaskToken.decimals
                }
            }
        })

        if(isAdded) {
            notification.success(`${metamaskToken.symbol} added to Metamask`)
            setMetamaskToken(null)
        } else {
            notification.error(`Failed to add ${metamaskToken.symbol} to Metamask`)
        }
    } catch(error) {
        notification.error(`Failed to add ${metamaskToken.symbol} to Metamask`)
        console.error(error)
    }
}

  const readBalance = async () => {
    if(!isConnected) return
    
    setBalance(null)
    try {
      // native token
      const provider = getProvider(String(chain.id))
      const balance = await provider.getBalance(connectedAccount!)

      setBalance(Number(ethers.utils.formatEther(balance)).toFixed(4))

    } catch(error) {
      console.log(`Error reading balance`)
      console.error(error)
    }
  }

  useEffect(() => {
    readBalance()
  }, [isConnected, connectedAccount, chain])

  useEffect(() => {
    if(isNetworkSwitched){
      setSelectedChainId(networkChainId.layer2)
      setReceivedTokens(MUMBAI_TOKENS_CLONES)
    } else {
      setSelectedChainId(networkChainId.layer1)
      setReceivedTokens(SEPOLIA_TOKENS_CLONES)
    }
  }, [networkChainId, isNetworkSwitched])

  return (
      <>  
        <div className={`flex ${isNetworkSwitched? "flex-col-reverse": "flex-col"} ${isNetworkSwitched? "md:flex-row-reverse": "md:flex-row"} items-center md:items-end`}>
          <SelectNetwork img={{url: '/images/eth-icon.png', alt: 'ethereum'}} networks={ETHEREUM_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer1: chainId}))} />

          <div className='font-bold bg-white rounded-md p-2 max-md:my-5 md:mx-5 border border-gray-300 cursor-pointer transition duration-300 hover:border-[#624DE3] hover:text-white hover:bg-[#624DE3]' onClick={() => setIsNetworkSwitched(!isNetworkSwitched)}>
             <ArrowPathIcon className='w-5' />
          </div>

          <SelectNetwork img={{url: '/images/polygon-icon.png', alt: 'polygon'}} networks={POLYGON_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer2: chainId}))} />
        </div>
        {isConnected && chain?.id !== selectedChainId && <Button label="Switch Network" className="w-full" onClick={() => switchNetwork?.(selectedChainId)} />}

        <InputTokenAmountForm label="You send" vaults={isNetworkSwitched? MUMBAI_VAULTS : SEPOLIA_VAULTS} value={String(token.amount)} onChange={token => setToken(token)} />
        <div className='flex justify-between items-center text-sm text-gray-700'>
          <p>1% fee</p>
          <p className={balance === null? 'invisible': ''}>Balance: {balance}</p>
        </div>

        <div className='mt-5'>
          <label className='text-gray-700 text-sm'>You receive</label>
          <div className='flex mt-2'>
              <input className='w-full border border-gray-300 p-2 bg-white' placeholder='Amount' value={token.amount - (token.amount / 100) || ""} disabled />
              <div className='w-[180px]'>
                  <select defaultValue={receivedTokens?.[0].address.toLowerCase()} className='min-w-[120px] h-full border border-[#CBD5E0] rounded-md px-2 bg-white'>
                      {receivedTokens?.map(token =>  <option key={token.name} value={token.address}>{token.name}</option>)}
                  </select>
              </div>
          </div>
        </div>
        
        {metamaskToken? <Button outline label={`Add ${metamaskToken.symbol} to Metamask ${metamaskToken.symbol.toLowerCase() === "ethc" && chain?.id === 11155111? "(switch to Mumbai)": metamaskToken.symbol.toLowerCase() === "maticc" && chain?.id === 80001? "(switch to Sepolia)": ""}`} onClick={addTokenToMetamask} /> : null}
        <Button label="Deposit" onClick={deposit} isLoading={isDepositing} />
      </>
  )
}

export default BridgeForm