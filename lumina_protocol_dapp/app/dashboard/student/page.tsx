// app/dashboard/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as anchor from "@coral-xyz/anchor";
import { useLumina } from "../../lib/useLumina";

export default function StudentDashboard() {
    const { getProgram, userPublicKey } = useLumina();
    
    const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
    const [totalRaised, setTotalRaised] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!userPublicKey) {
                setIsLoading(false);
                return;
            }

            try {
                const program = getProgram();
                if (!program) return;

                // Fetch ALL campaigns
                const allCampaigns = await (program.account as any).campaign.all();

                // Filter locally for MVP (In production, use memcmp RPC filters)
                let userTotal = 0;
                const filteredCampaigns = allCampaigns
                    .filter((c: any) => c.account.student.toBase58() === userPublicKey.toBase58())
                    .map((c: any) => {
                        let meta = { t: "Untitled", d: "" };
                        try {
                            meta = JSON.parse(c.account.metadataJson);
                        } catch (e) {
                            console.warn("Failed to parse metadata");
                        }

                        const raisedSol = c.account.totalRaised.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
                        const targetSol = c.account.targetAmount.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
                        userTotal += raisedSol;

                        return {
                            pda: c.publicKey.toBase58(),
                            studentPubkey: c.account.student.toBase58(),
                            title: meta.t,
                            targetAmount: targetSol,
                            totalRaised: raisedSol,
                            milestoneCount: c.account.milestoneCount
                        };
                    });

                setMyCampaigns(filteredCampaigns);
                setTotalRaised(userTotal);

            } catch (err) {
                console.error("Failed to fetch student dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, [userPublicKey]);

    if (!userPublicKey) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Workspace</h1>
                <p className="text-gray-500">Please connect your wallet to view your campaigns.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Student Workspace</h1>
                <p className="text-gray-500 mt-2">Manage your campaigns and submit proofs for your milestones.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Raised</p>
                        <p className="text-4xl font-extrabold text-purple-600 mt-1">{totalRaised} SOL</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-2xl">
                        💰
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Campaigns</p>
                        <p className="text-4xl font-extrabold text-gray-900 mt-1">{myCampaigns.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-2xl">
                        🚀
                    </div>
                </div>
            </div>

            {/* Campaign List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Your Campaigns</h2>
                    <Link href="/campaigns/create" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
                        + New Campaign
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center animate-pulse text-gray-500">Loading your data...</div>
                ) : myCampaigns.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">You haven't launched any campaigns yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {myCampaigns.map((camp) => (
                            <div key={camp.pda} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition gap-4">
                                <div className="flex-1 w-full text-black">
                                    <h3 className="text-lg font-bold text-gray-900">{camp.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {camp.totalRaised} / {camp.targetAmount} SOL Raised • {camp.milestoneCount} Milestones
                                    </p>
                                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mt-3">
                                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min((camp.totalRaised / camp.targetAmount) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Link href={`/campaigns/${camp.studentPubkey}`} className="block w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-6 py-2 rounded-lg font-medium transition">
                                        Manage Milestones
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