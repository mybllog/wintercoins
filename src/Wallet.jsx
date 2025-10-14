import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const BSC_PARAMS = {
    chainId: "0xa09d8624eae87e8b5f87b23fe694eea2d02dde2e", // 56 in hex
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.bnbchain.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  };

  const shortAddress = (addr) => addr?.slice(0, 6) + "..." + addr?.slice(-4);

  // 🦊 Connect MetaMask (BSC)
  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install it.");
        setIsConnecting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const { chainId } = await provider.getNetwork();

      // Switch to BSC if not already
      if (chainId !== 56) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_PARAMS.chainId }],
          });
        } catch (switchError) {
          // If chain not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [BSC_PARAMS],
            });
          }
        }
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  
 
  // 🔗 Connect WalletConnect (BNB Smart Chain)
  const connectWalletConnect = async () => {
  try {
    setIsConnecting(true);

    const wcProvider = await EthereumProvider.init({
      projectId: "47c64828c0d34815feee876052336fb8",
      chains: [56], // BSC mainnet
      rpcMap: {
        56: "https://rpc.ankr.com/bsc",
      },
      showQrModal: true,
      metadata: {
        name: "Wintercoins", // 👈 REQUIRED
        description: "BNB Smart Chain Wallet Connect",
        url: "https://wintercoins.vercel.app/", // 👈 your app URL (must match HTTPS if deployed)
      },
    });

    // Connect wallet
    await wcProvider.enable();

    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    setAccount(address);
    setShowModal(false);
  } catch (err) {
    console.error("WalletConnect error:", err);
  } finally {
    setIsConnecting(false);
  }
};

  // 👂 Listen for wallet/account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (acc) => setAccount(acc[0] || null));
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => (account ? null : setShowModal(true))}
        disabled={isConnecting}
        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg shadow transition-all"
      >
        {isConnecting
          ? "Connecting..."
          : account
          ? shortAddress(account)
          : "Connect Wallet"}
      </button>

      {showModal && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-gray-700 rounded-xl shadow-lg p-3">
          <p className="text-gray-300 text-sm mb-2 font-semibold">Choose Wallet</p>

          <button
            onClick={connectMetaMask}
            className="w-full text-left bg-white/10 hover:bg-white/20 text-gray-100 px-3 py-2 rounded-lg mb-2 transition"
          >
            🦊 MetaMask (BNB)
          </button>

          <button
            onClick={connectWalletConnect}
            className="w-full text-left bg-white/10 hover:bg-white/20 text-gray-100 px-3 py-2 rounded-lg transition"
          >
            🔗 WalletConnect (BNB)
          </button>

          <button
            onClick={() => setShowModal(false)}
            className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
