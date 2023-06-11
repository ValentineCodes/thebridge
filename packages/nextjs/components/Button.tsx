import { Spinner } from '@chakra-ui/react';
import React from 'react'

type Props = {
    label: string;
    className?: string;
    isLoading?: boolean;
    outline?: boolean;
    onClick: () => void
}

function Button({label, className, isLoading, outline, onClick}: Props) {
  return (
    <button className={`border border-[#624DE3] ${outline? ' bg-white text-[#624DE3] hover:bg-[#624DE3] hover:text-white' : 'bg-[#624DE3] text-white hover:bg-white hover:text-[#624DE3]'} transition-all px-4 py-2 rounded-md shadow-lg w-full mt-5 ${className}`} onClick={onClick}>{isLoading ? <Spinner size="md" thickness='4px' speed='0.65s' /> : label}</button>
  )
}

export default Button