"use client";

import { useState } from "react";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useLumina } from "../../lib/useLumina";
import { useRouter } from "next/navigation";

export default function CreateCampaign() {
    const router = useRouter();
    const { getProgram, userPublicKey, getCampaignPDA, getMilestonePDA } = useLumina();
    
    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState<number | "">("");
    const [milestoneAllocations, setMilestoneAllocations] = useState<number[]>([]);
    const [currentMilestoneInput, setCurrentMilestoneInput] = useState<number | "">("");
    
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState("");

    const addMilestone = () => {
        if (currentMilestoneInput && Number(currentMilestoneInput) > 0) {
            setMilestoneAllocations([...milestoneAllocations, Number(currentMilestoneInput)]);
            setCurrentMilestoneInput(""); // Reset input
        }
    };

    const launchCampaign = async () => {
        if (!title || !description || !targetAmount || milestoneAllocations.length === 0) {
            return alert("Please fill all fields and add at least one milestone.");
        }

        const sumOfMilestones = milestoneAllocations.reduce((a, b) => a + b, 0);
        if (sumOfMilestones > Number(targetAmount)) {
            return alert("The sum of your milestones cannot exceed your total target amount!");
        }

        setIsLoading(true);
        setStatusText("Preparing transaction...");

        try {
            const program = getProgram();
            if (!program || !userPublicKey) {
                throw new Error("Wallet not connected or Program failed to load.");
            }

            const campaignPDA = getCampaignPDA(userPublicKey);
            
            // 1. Pack metadata into lean JSON string (Max 500 chars as per our Rust contract)
            const metadata = JSON.stringify({ t: title, d: description });
            if (metadata.length > 500) {
                throw new Error("Description is too long! Keep it under ~400 characters.");
            }

            const targetLamports = new anchor.BN(Number(targetAmount) * anchor.web3.LAMPORTS_PER_SOL);

            setStatusText("Please approve the Campaign creation in your wallet...");

            // 2. Initialize Campaign
            await program.methods.initializeCampaign(targetLamports, metadata).accounts({
                student: userPublicKey,
                campaign: campaignPDA,
                systemProgram: SystemProgram.programId,
            } as any).rpc();

            // 3. Loop and Initialize all Milestones sequentially
            for (let i = 0; i < milestoneAllocations.length; i++) {
                setStatusText(`Please approve Milestone ${i + 1} of ${milestoneAllocations.length}...`);
                
                const milestonePDA = getMilestonePDA(campaignPDA, i);
                const allocationLamports = new anchor.BN(milestoneAllocations[i] * anchor.web3.LAMPORTS_PER_SOL);

                await program.methods.initializeMilestone(allocationLamports).accounts({
                    student: userPublicKey,
                    campaign: campaignPDA,
                    milestone: milestonePDA,
                    systemProgram: SystemProgram.programId,
                } as any).rpc();
            }

            alert("🚀 Campaign and Milestones launched successfully!");
            router.push("/"); // Redirect back to the Discovery Hub

        } catch (err: any) {
            console.error("Launch Error:", err);
            alert(`Failed to launch campaign: ${err.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
            setStatusText("");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Launch your Campaign</h1>
                <p className="text-gray-500 mt-2">Define your goal and outline the milestones you need funded.</p>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-black">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                    <input 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition" 
                        placeholder="e.g., Next-Gen Robotics Project" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} 
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition" 
                        placeholder="What are you building?" 
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} 
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Target Amount (SOL)</label>
                    <input 
                        type="number" 
                        min="0"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition" 
                        placeholder="10" 
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-black space-y-4">
                <div>
                    <h3 className="font-bold text-purple-900">Define Milestones</h3>
                    <p className="text-sm text-purple-700 mb-4">Break your total target down into actionable chunks. Sponsors will vote on these.</p>
                </div>
                
                <div className="flex space-x-2">
                    <input 
                        type="number" 
                        min="0"
                        step="0.1"
                        className="flex-1 p-3 border border-gray-300 rounded-lg outline-none" 
                        placeholder="Allocation (SOL)" 
                        value={currentMilestoneInput}
                        onChange={(e) => setCurrentMilestoneInput(e.target.value === "" ? "" : Number(e.target.value))}
                        disabled={isLoading}
                    />
                    <button 
                        className="bg-purple-600 text-white px-6 font-bold rounded-lg hover:bg-purple-700 transition"
                        onClick={addMilestone}
                        disabled={isLoading}
                    >
                        Add
                    </button>
                </div>

                {milestoneAllocations.length > 0 && (
                    <ul className="space-y-2 mt-4">
                        {milestoneAllocations.map((amount, i) => (
                            <li key={i} className="flex justify-between bg-white p-3 rounded border border-purple-100 shadow-sm">
                                <span className="font-medium text-gray-700">Milestone {i + 1}</span>
                                <span className="font-bold text-purple-600">{amount} SOL</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button 
                onClick={launchCampaign} 
                disabled={isLoading || !userPublicKey}
                className="w-full bg-gray-900 text-white font-bold p-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (statusText || "Launching...") : (!userPublicKey ? "Connect Wallet to Launch" : "Launch Campaign")}
            </button>
        </div>
    );
}