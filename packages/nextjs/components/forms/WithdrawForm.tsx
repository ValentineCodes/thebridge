import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useChainId, useAccount, useSigner } from 'wagmi'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from '../SelectNetwork'
import Button from '../Button'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { ethers } from 'ethers'

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

const SEPOLIA_TOKENS_CLONES = [{name: "ETHc", address: ""}]
const MUMBAI_TOKENS_CLONES = [{name: "MATICc", address: "0x10b9980C12DDC8B6b1d06C1d50B64f7d400CA0FD"}]

type Props = {}
function WithdrawForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  const {switchNetwork} = useSwitchNetwork()
  const {address: account, isConnected} = useAccount()
  const [balance, setBalance] = useState("")
  const chainId = useChainId()
  const {data: signer, isLoading: isLoadingSigner} = useSigner()
  const [networkChainId, setNetworkChainId] = useState({layer1: ETHEREUM_NETWORKS[0].chainId, layer2: POLYGON_NETWORKS[0].chainId})
  const [selectedChainId, setSelectedChainId] = useState(ETHEREUM_NETWORKS[0].chainId)
  const [token, setToken] = useState({address: "", amount: 0})
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [tokens, setTokens] = useState<TokenClone[] | undefined>()
  const {data: bridgeTokenClone, isLoading: isLoadingBridgeTokenClone} = useDeployedContractInfo("BridgeTokenClone")

  const withdraw = async () => {
   if(isWithdrawing) return
   if(!isConnected) {
      notification.info("Connect Wallet")
      return
    }
   if(isLoadingSigner || isLoadingBridgeTokenClone) {
      notification.info("Loading resources...")
      return
    }
    if(token.amount <= 0) {
      notification.warning("Invalid amount!")
      return
    }
    // if(token.amount > balance!) {
    //   notification.error("Amount cannot exceed balance!")
    //   return
    // }

    let notificationId = notification.loading("Withdrawing")
    setIsWithdrawing(true)

    try{
      const tokenClone = new ethers.Contract(token.address, bridgeTokenClone?.abi as any, signer)

      const burnTx = await tokenClone.burn(ethers.utils.parseEther(token.amount.toString()))
      await burnTx.wait(1)

      notification.success("Successful Withdrawal")
    } catch(error) {
      console.error(error)
      notification.error(JSON.stringify(error))
    } finally {
      notification.remove(notificationId)
      setIsWithdrawing(false)
    }
    
  }

  useEffect(() => {
    if(isNetworkSwitched){
      setSelectedChainId(networkChainId.layer2)
      setTokens(SEPOLIA_TOKENS_CLONES)
    } else {
      setSelectedChainId(networkChainId.layer1)
      setTokens(MUMBAI_TOKENS_CLONES)
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
        {chainId !== selectedChainId && <Button label="Switch Network" className="w-full" onClick={() => switchNetwork?.(selectedChainId)} />}

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
        <p className='text-right text-sm text-gray-700'>Balance: </p>

        <Button label='Withdraw' className='w-full' onClick={withdraw} isLoading={isWithdrawing} />
      </>
  )
}

export default WithdrawForm