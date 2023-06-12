import React, {useState, useEffect} from 'react'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { useSwitchNetwork, useChainId, useAccount, erc20ABI, useNetwork } from 'wagmi'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from '../SelectNetwork'
import Button from '../Button'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { ethers } from 'ethers'
import { getProvider } from '~~/utils/providers'
import NativeTokenCloneABI from "../../generated/abis/NativeTokenCloneABI.json"


const ETHEREUM_NETWORKS = [{
  name: "Sepolia",
  chainId: 11155111
}]
const POLYGON_NETWORKS = [{
  name: "Mumbai",
  chainId: 80001
}]

interface TokenClone {
  name: string;
  address: string;
}

const SEPOLIA_TOKENS_CLONES = [{name: "ETHc", address: "0x553Dacc2eca5D8e0810A98509A8E0A4e68D48792"}]
const MUMBAI_TOKENS_CLONES = [{name: "MATICc", address: "0xc4875dd18c7ebc75c259cfe4f22b2C3D3B653474"}]

type Props = {}
function WithdrawForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  const {switchNetwork} = useSwitchNetwork()
  const {address: connectedAccount, isConnected} = useAccount()
  const [balance, setBalance] = useState<string | null>(null)
  const chainId = useChainId()
  const [networkChainId, setNetworkChainId] = useState({layer1: ETHEREUM_NETWORKS[0].chainId, layer2: POLYGON_NETWORKS[0].chainId})
  const [selectedChainId, setSelectedChainId] = useState(ETHEREUM_NETWORKS[0].chainId)
  const [token, setToken] = useState({address: SEPOLIA_TOKENS_CLONES[0].address, amount: 0})
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [tokens, setTokens] = useState<TokenClone[] | undefined>()
  const { chain, chains } = useNetwork()

  const withdraw = async () => {
    if(isWithdrawing) return
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

    let notificationId = notification.loading("Withdrawing")
    setIsWithdrawing(true)

    try {
      const config = await prepareWriteContract({
        address: token.address,
        abi: NativeTokenCloneABI,
        functionName: "burn",
        args: [ethers.utils.parseEther(token.amount.toString())]
      })

      const tx = await writeContract(config)
      await tx.wait(1)

      notification.success("Successful Withdrawal")
    } catch(error) {
      console.error(error)
      notification.error(JSON.stringify(error))
    } finally {
      notification.remove(notificationId)
      setIsWithdrawing(false)
    }
    
  }

  const readBalance = async () => {
    if(!isConnected) return

    setBalance(null)
    try {
      const provider = getProvider(String(chain.id))

      const _token = new ethers.Contract(token.address, NativeTokenCloneABI, provider)
      const balance = await _token.balanceOf(connectedAccount)

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
      setTokens(SEPOLIA_TOKENS_CLONES)
      setToken(token => ({...token, address: SEPOLIA_TOKENS_CLONES[0].address}))
    } else {
      setSelectedChainId(networkChainId.layer1)
      setTokens(MUMBAI_TOKENS_CLONES)
      setToken(token => ({...token, address: MUMBAI_TOKENS_CLONES[0].address}))
    }
  }, [networkChainId, isNetworkSwitched])

  return (
      <>  
        <div className={`flex ${isNetworkSwitched? "flex-col-reverse": "flex-col"} ${isNetworkSwitched? "md:flex-row-reverse": "md:flex-row"} gap-5 items-center md:items-end`}>
          <SelectNetwork img={{url: '/images/eth-icon.png', alt: 'ethereum'}} networks={ETHEREUM_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer1: chainId}))} />

          <div className='font-bold bg-white rounded-md p-2 border border-gray-300 cursor-pointer transition duration-300 hover:border-[#624DE3] hover:text-white hover:bg-[#624DE3]' onClick={() => setIsNetworkSwitched(!isNetworkSwitched)}>
            <ArrowPathIcon className='w-5' />
          </div>

          <SelectNetwork img={{url: '/images/polygon-icon.png', alt: 'polygon'}} networks={POLYGON_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer2: chainId}))} />
        </div>
        {isConnected && chainId !== selectedChainId && <Button label="Switch Network" className="w-full" onClick={() => switchNetwork?.(selectedChainId)} />}

        <div className='mt-5'>
          <NumberInput className='flex mt-2'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={tokens?.[0].address} className='w-[50px]' onChange={e => setToken(token => ({...token, address: e.target.value}))}>
                    {tokens?.map(token =>  <option key={token.name} value={token.address}>{token.name}</option>)}
                </Select>
            </div>
          </NumberInput>
        </div>
        <p className='text-right text-sm text-gray-700'>Balance: {balance}</p>

        <Button label='Withdraw' className='w-full' onClick={withdraw} isLoading={isWithdrawing} />
      </>
  )
}

export default WithdrawForm