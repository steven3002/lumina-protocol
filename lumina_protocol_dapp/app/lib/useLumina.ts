"use client";

import { useWallet } from "./wallet/context";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import IDL from "./idl/lumina_protocol.json";

// Hardcoded to localnet for the MVP
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const PROGRAM_ID = new PublicKey(IDL.address);

export function useLumina() {
    const { wallet } = useWallet();

    // Safely extract the public key from your custom WalletSession
    const userPublicKey = wallet?.account?.address ? new PublicKey(wallet.account.address) : null;

    const getProgram = () => {
        // If the user isn't connected, we create a dummy read-only wallet
        const dummyWallet = {
            publicKey: PublicKey.default,
            signTransaction: async () => { throw new Error("Read only") },
            signAllTransactions: async () => { throw new Error("Read only") }
        };

        const activeWallet = userPublicKey ? {
            publicKey: userPublicKey,
            signTransaction: async (tx: any) => await (window as any).solana.signTransaction(tx),
            signAllTransactions: async (txs: any[]) => await (window as any).solana.signAllTransactions(txs),
        } : dummyWallet;

        const provider = new anchor.AnchorProvider(connection, activeWallet as any, { commitment: "confirmed" });
        return new anchor.Program(IDL as anchor.Idl, provider);
    };

    
    const getCampaignPDA = (studentPubkey: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("campaign"), studentPubkey.toBuffer()],
            PROGRAM_ID
        );
        return pda;
    };

    const getMilestonePDA = (campaignPda: PublicKey, index: number) => {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(index, 0);
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("milestone"), campaignPda.toBuffer(), buffer],
            PROGRAM_ID
        );
        return pda;
    };

    const getSponsorPDA = (campaignPda: PublicKey, sponsorPubkey: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("sponsor"), campaignPda.toBuffer(), sponsorPubkey.toBuffer()],
            PROGRAM_ID
        );
        return pda;
    };

    return { getProgram, userPublicKey, getCampaignPDA, getMilestonePDA, getSponsorPDA };
}