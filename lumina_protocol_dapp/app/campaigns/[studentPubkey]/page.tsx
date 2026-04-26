"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useLumina } from "../../lib/useLumina";

export default function CampaignDetail() {
    const params = useParams();
    const studentPubkeyString = params.studentPubkey as string;
    
    const { getProgram, userPublicKey, getCampaignPDA, getMilestonePDA, getSponsorPDA } = useLumina();
    
    // Data State
    const [campaign, setCampaign] = useState<any>(null);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [metadata, setMetadata] = useState({ t: "Loading...", d: "" });
    const [donateAmount, setDonateAmount] = useState<number | "">("");
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeAction, setActiveAction] = useState<string | null>(null); // Tracks which button is loading

    // Role Definition
    const isStudent = userPublicKey?.toBase58() === studentPubkeyString;

    // Safely derive Campaign PDA
    const campaignPDA = useMemo(() => {
        try {
            if (!studentPubkeyString) return null;
            return getCampaignPDA(new PublicKey(studentPubkeyString));
        } catch (e) {
            return null;
        }
    }, [studentPubkeyString, getCampaignPDA]);

    useEffect(() => {
        if (!campaignPDA && studentPubkeyString) {
            setError("Invalid Student Public Key in URL.");
            setIsLoading(false);
        }
    }, [campaignPDA, studentPubkeyString]);

    const fetchCampaignData = async () => {
        try {
            const program = getProgram();
            if (!program || !campaignPDA) return;

            const campaignData = await (program.account as any).campaign.fetch(campaignPDA);
            setCampaign(campaignData);
            
            try {
                setMetadata(JSON.parse(campaignData.metadataJson));
            } catch (e) {
                setMetadata({ t: "Unknown Campaign", d: "No description available." });
            }

            const fetchedMilestones = [];
            for (let i = 0; i < campaignData.milestoneCount; i++) {
                const msPDA = getMilestonePDA(campaignPDA, i);
                const msData = await (program.account as any).milestone.fetch(msPDA);
                fetchedMilestones.push({ ...msData, pda: msPDA, index: i });
            }
            setMilestones(fetchedMilestones);

        } catch (err) {
            console.error("Failed to fetch campaign", err);
            setError("Campaign not found on the network.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaignData();
    }, [userPublicKey, studentPubkeyString]);

    // ----------------------------------------------------
    // 1. SPONSOR ACTION: Donate
    // ----------------------------------------------------
    const handleDonate = async () => {
        if (!donateAmount || Number(donateAmount) <= 0) return alert("Enter a valid amount.");
        setActiveAction("donate");
        try {
            const program = getProgram();
            if (!program || !userPublicKey || !campaignPDA) throw new Error("Wallet not connected.");

            const sponsorPDA = getSponsorPDA(campaignPDA, userPublicKey);
            const amountLamports = new anchor.BN(Number(donateAmount) * anchor.web3.LAMPORTS_PER_SOL);

            await program.methods.donate(amountLamports).accounts({
                sponsor: userPublicKey,
                campaign: campaignPDA,
                sponsorRecord: sponsorPDA,
                systemProgram: SystemProgram.programId,
            } as any).rpc();

            alert("💖 Donation successful! You are now a sponsor.");
            setDonateAmount(""); 
            fetchCampaignData(); 
        } catch (err: any) {
            alert(`Donation failed: ${err.message}`);
        } finally {
            setActiveAction(null);
        }
    };

    // ----------------------------------------------------
    // 2. STUDENT ACTION: Submit Proof
    // ----------------------------------------------------
    const handleSubmitProof = async (milestonePDA: PublicKey) => {
        setActiveAction(`proof-${milestonePDA.toBase58()}`);
        try {
            const program = getProgram();
            if (!program || !userPublicKey || !campaignPDA) throw new Error("Wallet not connected.");

            // MOCK DATA for MVP: In production, you'd prompt for a URL and hash the file locally.
            const mockUrl = "https://drive.google.com/file/d/mvp-proof";
            const mockHash = Array.from(new Uint8Array(32).fill(1)); // Dummy 32-byte hash

            await program.methods.submitMilestoneProof(mockUrl, mockHash).accounts({
                student: userPublicKey,
                campaign: campaignPDA,
                milestone: milestonePDA,
            } as any).rpc();

            alert("📝 Proof submitted successfully! Sponsors can now vote.");
            fetchCampaignData();
        } catch (err: any) {
            alert(`Failed to submit proof: ${err.message}`);
        } finally {
            setActiveAction(null);
        }
    };

    // ----------------------------------------------------
    // 3. SPONSOR ACTION: Vote / Approve Proof
    // ----------------------------------------------------
    const handleVote = async (milestonePDA: PublicKey) => {
        setActiveAction(`vote-${milestonePDA.toBase58()}`);
        try {
            const program = getProgram();
            if (!program || !userPublicKey || !campaignPDA) throw new Error("Wallet not connected.");

            const sponsorPDA = getSponsorPDA(campaignPDA, userPublicKey);

            await program.methods.voteOnMilestone().accounts({
                sponsor: userPublicKey,
                campaign: campaignPDA,
                sponsorRecord: sponsorPDA,
                milestone: milestonePDA,
            } as any).rpc();

            alert("✅ Vote cast successfully! Your voting weight has been applied.");
            fetchCampaignData();
        } catch (err: any) {
            alert("Voting failed. Have you already voted on this milestone, or are you not a sponsor yet?");
        } finally {
            setActiveAction(null);
        }
    };

    // ----------------------------------------------------
    // 4. STUDENT ACTION: Claim Funds
    // ----------------------------------------------------
    const handleClaim = async (milestonePDA: PublicKey) => {
        setActiveAction(`claim-${milestonePDA.toBase58()}`);
        try {
            const program = getProgram();
            if (!program || !userPublicKey || !campaignPDA) throw new Error("Wallet not connected.");

            await program.methods.claimMilestone().accounts({
                student: userPublicKey,
                campaign: campaignPDA,
                milestone: milestonePDA,
            } as any).rpc();

            alert("💰 Funds Claimed! The milestone allocation has been sent to your wallet.");
            fetchCampaignData();
        } catch (err: any) {
            alert(`Claim failed: ${err.message}`);
        } finally {
            setActiveAction(null);
        }
    };

    if (error) return <div className="p-12 text-center text-red-500 font-bold">{error}</div>;
    if (isLoading || !campaign || !campaignPDA) return <div className="p-12 text-center animate-pulse text-gray-500">Loading Campaign Data...</div>;

    const totalRaisedLamports = campaign.totalRaised.toNumber();
    const targetLamports = campaign.targetAmount.toNumber();
    const quorumLamports = totalRaisedLamports / 2; // > 50% needed

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${campaignPDA.toBase58()}`} alt="Art" className="w-48 h-48 rounded-full shadow-inner" />
                </div>
                <div className="p-8 md:w-2/3 space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-extrabold text-gray-900">{metadata.t}</h1>
                            {isStudent && <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">Your Campaign</span>}
                        </div>
                        <p className="text-gray-500 mt-2 leading-relaxed">{metadata.d}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between font-medium">
                            <span className="text-purple-600 text-lg">{(totalRaisedLamports / anchor.web3.LAMPORTS_PER_SOL)} SOL Raised</span>
                            <span className="text-gray-500">Goal: {(targetLamports / anchor.web3.LAMPORTS_PER_SOL)} SOL</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-purple-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalRaisedLamports / targetLamports) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Donation UI (Only show if not the student) */}
                    {!isStudent && (
                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                            <input 
                                type="number" step="0.1" placeholder="Amount (SOL)" 
                                className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-black"
                                value={donateAmount}
                                onChange={(e) => setDonateAmount(e.target.value === "" ? "" : Number(e.target.value))}
                                disabled={activeAction !== null}
                            />
                            <button 
                                onClick={handleDonate} 
                                disabled={activeAction !== null || !userPublicKey}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
                            >
                                {activeAction === "donate" ? "Processing..." : "Donate"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Project Milestones</h2>
                <div className="grid gap-4">
                    {milestones.map((ms) => {
                        const allocSol = ms.amountAllocated.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
                        const statusKey = Object.keys(ms.status)[0]; // 'pending', 'voting', or 'claimed'
                        const votesForLamports = ms.votesFor.toNumber();
                        
                        const isQuorumReached = votesForLamports > quorumLamports;
                        const votePercent = totalRaisedLamports > 0 ? Math.min((votesForLamports / totalRaisedLamports) * 100, 100) : 0;

                        return (
                            <div key={ms.index} className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Milestone {ms.index + 1}</h3>
                                        <p className="text-gray-500">Allocation: <span className="font-medium text-gray-900">{allocSol} SOL</span></p>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg border font-bold uppercase tracking-wider text-xs bg-gray-50 text-gray-700">
                                        {statusKey}
                                    </div>
                                </div>

                                {/* --- VOTING STATE PROGRESS BAR --- */}
                                {statusKey === "voting" && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                                        <div className="flex justify-between text-sm font-bold text-gray-700">
                                            <span>Approval Votes: {votesForLamports / anchor.web3.LAMPORTS_PER_SOL} SOL</span>
                                            <span>Needed: {(quorumLamports / anchor.web3.LAMPORTS_PER_SOL).toFixed(2)} SOL ({'>'}50%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full transition-all duration-1000 ${isQuorumReached ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${votePercent}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* --- ACTION BUTTONS --- */}
                                <div className="flex justify-end pt-2">
                                    {/* Student: Submit Proof */}
                                    {isStudent && statusKey === "pending" && (
                                        <button 
                                            onClick={() => handleSubmitProof(ms.pda)}
                                            disabled={activeAction !== null}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
                                        >
                                            {activeAction === `proof-${ms.pda.toBase58()}` ? "Submitting..." : "Submit Proof"}
                                        </button>
                                    )}

                                    {/* Sponsor: Approve Proof */}
                                    {!isStudent && statusKey === "voting" && (
                                        <button 
                                            onClick={() => handleVote(ms.pda)}
                                            disabled={activeAction !== null}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
                                        >
                                            {activeAction === `vote-${ms.pda.toBase58()}` ? "Signing..." : "Approve Proof"}
                                        </button>
                                    )}

                                    {/* Student: Claim Funds */}
                                    {isStudent && statusKey === "voting" && isQuorumReached && (
                                        <button 
                                            onClick={() => handleClaim(ms.pda)}
                                            disabled={activeAction !== null}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition disabled:opacity-50 animate-bounce"
                                        >
                                            {activeAction === `claim-${ms.pda.toBase58()}` ? "Claiming..." : "Claim Funds!"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}