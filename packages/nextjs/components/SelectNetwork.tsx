import React from 'react'
import { Select } from '@chakra-ui/react'

interface Img {
  url: string;
  alt: string;
}
interface Network {
  name: string;
  chainId: number;
}
type Props = {
  img: Img;
  networks: Network[],
  onSelect: (network: number) => void;
}

function SelectNetwork({img, networks, onSelect}: Props) {
  return (
    <div className='flex flex-col items-center space-y-10 w-60' aria-label='network'>
        <div className='flex justify-center item-center shadow-[0_0_5px_3px_#624DE3] p-2 rounded-3xl'>
          <img src={img.url} alt={img.alt} className='w-16 h-16' />
        </div>

        <Select onChange={(e) => onSelect(Number(e.target.value))} defaultValue={networks[0].chainId}>
          {networks.map(network =>  <option key={network.chainId} value={network.chainId}>{network.name}</option>)}
        </Select>
    </div>
  )
}

export default SelectNetwork