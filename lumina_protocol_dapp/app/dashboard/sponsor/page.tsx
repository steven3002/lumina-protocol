// app/dashboard/sponsor/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as anchor from "@coral-xyz/anchor";
import { useLumina } from "../../lib/useLumina";

export default function SponsorDashboard() {
    const { getProgram, userPublicKey } = useLumina();
    
    const [backedCampaigns, setBackedCampaigns] = useState<any[]>([]);
    const [totalDonated, setTotalDonated] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSponsorData = async () => {
            if (!userPublicKey) {
                setIsLoading(false);
                return;
            }

            try {
                const program = getProgram();
                if (!program) return;

                // 1. Fetch all Sponsor Records and filter for the connected user
                const allSponsorRecords = await (program.account as any).sponsorRecord.all();
                const myRecords = allSponsorRecords.filter(
                    (record: any) => record.account.sponsor.toBase58() === userPublicKey.toBase58()
                );

                let userTotalDonated = 0;
                const enrichedCampaigns = [];

                // 2. Loop through the records to fetch the actual Campaign data
                for (const record of myRecords) {
                    try {
                        const campaignPDA = record.account.campaign;
                        const campaignData = await (program.account as any).campaign.fetch(campaignPDA);
                        
                        let meta = { t: "Untitled", d: "" };
                        try {
                            meta = JSON.parse(campaignData.metadataJson);
                        } catch (e) {
                            console.warn("Failed to parse metadata");
                        }

                        const amountDonatedSol = record.account.amountDonated.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
                        userTotalDonated += amountDonatedSol;

                        enrichedCampaigns.push({
                            campaignPda: campaignPDA.toBase58(),
                            studentPubkey: campaignData.student.toBase58(),
                            title: meta.t,
                            amountDonated: amountDonatedSol,
                            lastVotedMilestone: record.account.lastVotedMilestone,
                            totalRaised: campaignData.totalRaised.toNumber() / anchor.web3.LAMPORTS_PER_SOL,
                            targetAmount: campaignData.targetAmount.toNumber() / anchor.web3.LAMPORTS_PER_SOL,
                        });
                    } catch (e) {
                        console.error("Failed to fetch underlying campaign for record", e);
                    }
                }

                setBackedCampaigns(enrichedCampaigns);
                setTotalDonated(userTotalDonated);

            } catch (err) {
                console.error("Failed to fetch sponsor dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSponsorData();
    }, [userPublicKey]);

    if (!userPublicKey) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Sponsor Portfolio</h1>
                <p className="text-gray-500">Please connect your wallet to view your backed campaigns.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Sponsor Portfolio</h1>
                <p className="text-gray-500 mt-2">Track your investments and vote on student milestones.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Donated</p>
                        <p className="text-4xl font-extrabold text-green-600 mt-1">{totalDonated} SOL</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                        💸
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Projects Backed</p>
                        <p className="text-4xl font-extrabold text-gray-900 mt-1">{backedCampaigns.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
                        🤝
                    </div>
                </div>
            </div>

            {/* Backed Campaigns List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Your Active Backings</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center animate-pulse text-gray-500">Loading your portfolio...</div>
                ) : backedCampaigns.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">You haven't backed any campaigns yet.</p>
                        <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                            Explore Campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {backedCampaigns.map((camp) => (
                            <div key={camp.campaignPda} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition gap-4">
                                <div className="flex-1 w-full text-black">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900">{camp.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        You contributed <span className="font-bold text-green-600">{camp.amountDonated} SOL</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Campaign Progress: {camp.totalRaised} / {camp.targetAmount} SOL
                                    </p>
                                </div>
                                <div className="w-full md:w-auto flex gap-3">
                                    <Link href={`/campaigns/${camp.studentPubkey}`} className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition">
                                        View & Vote
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}