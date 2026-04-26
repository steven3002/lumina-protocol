"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as anchor from "@coral-xyz/anchor";
import { useLumina } from "./lib/useLumina";

// Define a TypeScript interface for our parsed campaign data
interface CampaignData {
    pda: string;
    studentPubkey: string;
    title: string;
    description: string;
    imageUrl: string;
    targetAmount: number;
    totalRaised: number;
}

export default function DiscoveryHub() {
    const { getProgram } = useLumina();
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const program = getProgram();
                if (!program) return;

             // ⚡️ THE TRUTH TEST: Fetch all campaigns on the network
// 1. Add (program.account as any) to bypass the IDL type error
const allCampaignAccounts = await (program.account as any).campaign.all();

// 2. Explicitly cast 'c' as 'any' to satisfy strict mode
const formattedCampaigns = allCampaignAccounts.map((c: any) => {
    let meta = { t: "Untitled", d: "No description available." };
    
    // Safely parse the stringified JSON metadata
    try {
        meta = JSON.parse(c.account.metadataJson);
    } catch (e) {
        console.warn("Failed to parse metadata for", c.publicKey.toBase58());
    }

    return {
        pda: c.publicKey.toBase58(),
        studentPubkey: c.account.student.toBase58(),
        title: meta.t,
        description: meta.d,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${c.publicKey.toBase58()}`,
        targetAmount: c.account.targetAmount.toNumber() / anchor.web3.LAMPORTS_PER_SOL,
        totalRaised: c.account.totalRaised.toNumber() / anchor.web3.LAMPORTS_PER_SOL,
    };
});
                setCampaigns(formattedCampaigns);
            } catch (err) {
                console.error("Error fetching campaigns:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="text-center space-y-4 py-12">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Fund the Future.</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Discover students building incredible projects. Back their milestones, track their progress, and release funds as they prove their work.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500 font-medium animate-pulse">
                    Scanning the blockchain for campaigns...
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                    <p className="text-gray-500 mb-4">No campaigns found on the network.</p>
                    <Link href="/campaigns/create" className="text-purple-600 font-bold hover:underline">
                        Be the first to launch one!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((camp) => {
                        const progressPercent = Math.min((camp.totalRaised / camp.targetAmount) * 100, 100);

                        return (
                            <Link href={`/campaigns/${camp.studentPubkey}`} key={camp.pda}>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full">
                                    {/* DiceBear Generated Banner */}
                                    <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={camp.imageUrl} alt="Campaign Art" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{camp.title}</h3>
                                        <p className="text-gray-500 mt-2 text-sm line-clamp-2 flex-1">{camp.description}</p>
                                        
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-purple-600">{camp.totalRaised} SOL Raised</span>
                                                <span className="text-gray-500">Goal: {camp.targetAmount} SOL</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}