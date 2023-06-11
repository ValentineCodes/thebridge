import React, {useState} from "react"
import Head from "next/head";
import type { NextPage } from "next";
import BridgeForm from "~~/components/forms/BridgeForm";
import WithdrawForm from "~~/components/forms/WithdrawForm";

const Home: NextPage = () => {
  const [isBridging, setIsBridging] = useState(true)

  return (
    <>
      <Head>
        <title>Token Bridge</title>
        <meta name="description" content="Bridge Layer-1 and Layer-2 tokens" />
      </Head>

      <main className="flex justify-center items-center p-4 m-auto">
        
        <section className="bg-white text-black p-8 rounded-md shadow-md">
          <h1 className='mb-10 text-2xl'>
            {isBridging? "Bridge" : "Withdraw"} 
            <span 
              className='text-sm text-[#624DE3] cursor-pointer hover:font-bold ml-1' 
              onClick={() => setIsBridging(!isBridging)}>
              {isBridging? "Withdraw" : "Bridge"}
            </span>
          </h1>

          <form onSubmit={e => e.preventDefault()}>
            {isBridging? <BridgeForm /> : <WithdrawForm /> }
          </form>
        </section>
        
      </main>
    </>
  );
};

export default Home;
