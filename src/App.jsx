import React, { useState } from "react";
import { ethers } from "ethers";
import Wallet from "./Wallet";

const CONTRACT_ADDRESS = "0xa09d8624eae87e8b5f87b23fe694eea2d02dde2e"; // Your token
const TOKEN_SYMBOL = "WTC";
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

const PANCAKE_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function WETH() external pure returns (address)"
];

export default function App() {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  // 🔌 Connect MetaMask or Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask or Trust Wallet.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  // 💱 Swap BNB → WTC
  const swapBNBForToken = async () => {
    if (!window.ethereum) return alert("Wallet not found");
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return alert("Enter a valid amount");

    try {
      setSwapping(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(PANCAKE_ROUTER, PANCAKE_ROUTER_ABI, signer);

      const WBNB = await router.WETH();
      const path = [WBNB, CONTRACT_ADDRESS];
      const amountIn = ethers.parseEther(amount.toString());

      // Estimate output amount
      const amountsOut = await router.getAmountsOut(amountIn, path);
      const amountOutMin = (amountsOut[1] * 95n) / 100n; // 5% slippage

      const tx = await router.swapExactETHForTokens(
        amountOutMin,
        path,
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
        { value: amountIn }
      );

      await tx.wait();
      alert(`✅ Swap complete! Hash: ${tx.hash}`);
    } catch (err) {
      console.error("Swap failed:", err);
      alert("Swap failed. Check console for details.");
    } finally {
      setSwapping(false);
    }
  };

  const shortAddress = (addr) => addr?.slice(0, 6) + "..." + addr?.slice(-4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 text-gray-100 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-300 text-lg font-bold">
            W
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">WinterCoin</h1>
            <p className="text-xs text-gray-400">
              $WTC — community-driven DeFi token
            </p>
          </div>
        </div>
        <Wallet />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
          WinterCoin — The Future of Decentralized Power
        </h2>
        <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
          Swap BNB for $WTC directly on our site.
        </p>

        {/* Copy Contract */}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={copyAddress}
            className="inline-flex items-center gap-2 bg-cyan-500 text-slate-900 font-semibold px-5 py-3 rounded-lg shadow hover:scale-[1.01]"
          >
            Copy Contract
          </button>
          {copied && (
            <span className="ml-2 text-sm text-cyan-300">Copied!</span>
          )}
        </div>

        {/* Swap Box */}
        <div className="mt-12 max-w-md mx-auto bg-white/10 p-6 rounded-2xl shadow-lg border border-gray-700">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="mb-3 text-sm text-gray-300">
                Connected: {shortAddress(account)}
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="Amount in BNB"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 text-gray-200 border border-gray-700 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={swapBNBForToken}
                  disabled={swapping}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg transition"
                >
                  {swapping ? "Swapping..." : `Swap BNB → ${TOKEN_SYMBOL}`}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-gray-400 text-sm">
        © 2025 WinterCoin — Contract: {CONTRACT_ADDRESS}
      </footer>
    </div>
  );
}
