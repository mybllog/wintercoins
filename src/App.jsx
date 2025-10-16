import React, { useState, useRef } from 'react';
import Wallet from './Wallet';

const CONTRACT_ADDRESS = '0xda96f2caaffd454db4a7b69c5af2f8b33a54ebea'; 
const TOKEN_SYMBOL = 'WTC';

export default function App() {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);
  const pancakeSwapUrl = `https://pancakeswap.finance/swap?outputCurrency=${CONTRACT_ADDRESS}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 text-gray-100 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-300 text-lg font-bold">W</div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">WinterCoin</h1>
            <p className="text-xs text-gray-400">$WTC — community-driven DeFi token</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="text-center py-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">WinterCoin — The Future of Decentralized Power</h2>
          <p className="mt-6 text-gray-300 max-w-2xl mx-auto">Buy and trade $WTC directly via PancakeSwap below.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-2 bg-cyan-500 text-slate-900 font-semibold px-5 py-3 rounded-lg shadow hover:scale-[1.01]"
            >
              Copy Contract
            </button>
            {copied && <span className="ml-2 text-sm text-cyan-300">Copied!</span>}
          </div>

          {/* Iframe with overlay */}
          <div className="mt-12 max-w-2xl mx-auto relative">
            <iframe
              ref={iframeRef}
              title="PancakeSwap - Buy WTC"
              src={pancakeSwapUrl}
              className="w-full h-[500px] rounded-lg border border-gray-700"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
            {/* Overlay div to hide the connect button area */}
           { /*<div
              className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none rounded-b-lg"
              style={{
                pointerEvents: 'auto', // block clicks to "Connect Wallet"
              }}
            ></div>*/}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-gray-400 text-sm">
        © 2025 WinterCoin 
      </footer>
    </div>
  );
}
