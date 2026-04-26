"use client";

import Link from "next/link";
import { useWallet } from "../lib/wallet/context";

export default function Navbar() {
    const { status, wallet, connect, disconnect, connectors } = useWallet();

    // Connect to the first available wallet (usually Phantom or Backpack)
    const handleConnect = async () => {
        if (connectors.length > 0) {
            // Find Phantom or just use the first injected wallet
            const targetConnector = connectors.find(c => c.id.toLowerCase().includes('phantom')) || connectors[0];
            await connect(targetConnector.id);
        } else {
            alert("Please install a Solana wallet like Phantom.");
        }
    };

    return (
        <nav className="fixed w-full bg-white border-b border-gray-200 z-50 h-16 flex items-center shadow-sm">
            <div className="container mx-auto px-4 flex justify-between items-center text-black">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-xl font-bold text-purple-600 tracking-tighter">
                        Lumina
                    </Link>
                    <Link href="/campaigns/create" className="text-sm font-medium hover:text-purple-600 transition">
                        Launch Campaign
                    </Link>
                                    
                    <Link href="/dashboard/student" className="text-sm font-medium hover:text-purple-600 transition">
                        Student Dashboard
                    </Link>

                    <Link href="/dashboard/sponsor" className="text-sm font-medium hover:text-purple-600 transition">
                        Sponsor Portfolio
                    </Link>
                </div>
                
                
                <div className="flex items-center">
                    {status === "connected" && wallet ? (
                        <button 
                            onClick={disconnect}
                            className="bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-red-100 hover:text-red-600 transition"
                        >
                            {wallet.account.address.slice(0, 4)}...{wallet.account.address.slice(-4)}
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnect}
                            disabled={status === "connecting"}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {status === "connecting" ? "Connecting..." : "Connect Wallet"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}