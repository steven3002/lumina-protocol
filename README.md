# Lumina Protocol 🎓🔗

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Protocol-14F195?logo=solana&logoColor=white)](https://solana.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Anchor](https://img.shields.io/badge/Anchor-0.29.0-blue)](https://www.anchor-lang.com/)

**Lumina** is a decentralized, milestone-based crowdfunding platform built on Solana. It democratizes educational funding by connecting dedicated students with global sponsors through transparent, on-chain escrow smart contracts. 

Traditional scholarships favor the elite; Lumina funds the hardworking average student by releasing capital incrementally as verifiable, peer-reviewed milestones are achieved.

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/88f60762-c44a-4c05-a99d-6390703b3ea0" />


---

## 📖 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Smart Contract Structure](#-smart-contract-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## ✨ Features

- **Milestone-Based Escrow:** Funds are securely locked in Program Derived Address (PDA) vaults and released only when specific educational milestones are met.
- **Sponsor Consensus Voting (The Oracle Solution):** Smart contracts verify real-world progress via decentralized voting. Sponsors review uploaded proof (receipts, transcripts) and cast weighted votes to unlock the next funding tranche.
- **Sybil-Resistant Moderation:** A micro-staking mechanism requires a small deposit to flag campaigns, economically deterring spam and malicious reporting while rewarding accurate fraud detection.
- **Immutable Storage:** Campaign narratives, metadata, and PDF proofs are stored permanently on decentralized storage (Irys/Shadow Drive).
- **Frictionless UI/UX:** A blazing-fast Next.js frontend with off-chain PostgreSQL indexing allows for instant campaign discovery without expensive blockchain RPC calls.

---

## 🏗 Architecture

Lumina utilizes a hybrid Web2/Web3 stack to maximize speed while maintaining complete financial decentralization:

* **Blockchain:** [Solana](https://solana.com/) (Smart Contracts written in Rust using [Anchor](https://www.anchor-lang.com/))
* **Frontend & API:** [Next.js](https://nextjs.org/) (React Server Components, Next.js API Routes)
* **Database (Off-chain Indexer):** PostgreSQL (via Supabase/Vercel)
* **Decentralized Storage:** [Irys](https://irys.xyz/) (Permanent data storage for metadata and milestone proofs)
* **Wallet Integration:** Solana Wallet Adapter (Phantom, Solflare, Backpack)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18.x or higher)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.17.x or higher)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.29.0 or higher)
- [Yarn](https://yarnpkg.com/) or npm

---

## 🚀 Getting Started

The repository is structured as a monorepo containing both the Solana programs and the Next.js web application.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/lumina-protocol.git](https://github.com/your-username/lumina-protocol.git)
cd lumina-protocol
````

### 2\. Install Dependencies

```bash
# Install frontend dependencies
cd app
yarn install

# Install Anchor program dependencies
cd ../programs/lumina_core
yarn install
```

### 3\. Setup Environment Variables

Duplicate the `.env.example` file in the `/app` directory and fill in your variables:

```bash
cp app/.env.example app/.env.local
```

*Required variables include your RPC URL, Postgres Connection String, and Irys Node address.*

### 4\. Build and Test the Smart Contract

Ensure your local Solana test validator is running or configured.

```bash
cd programs/lumina_core
anchor build
anchor test
```

### 5\. Run the Web Application

```bash
cd app
yarn dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

-----

## 📜 Smart Contract Structure

The core Anchor program (`lumina_core`) handles the financial state of the platform:

  * `initialize_campaign`: Derives the PDA vault and registers campaign metadata.
  * `donate`: Handles token transfers (SOL/USDC) from the sponsor to the campaign's escrow vault.
  * `propose_milestone`: Updates campaign state to `Voting` and emits an event for the indexer.
  * `vote_milestone`: Records weighted sponsor votes based on their initial donation size.
  * `claim_milestone_funds`: CPI call to release funds to the student upon successful consensus.
  * `flag_campaign`: Locks the campaign and escrows the flagger's stake pending admin review.

-----

## 🤝 Contributing

We welcome contributions from the community\! To contribute:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please ensure your Rust code passes `cargo clippy` and all Anchor tests before submitting a PR.

-----

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

-----

## ⚠️ Disclaimer

Lumina Protocol provides a decentralized escrow and voting service. It does not act as a registered charity, investment advisor, or financial institution. Users should perform their own due diligence before funding any campaign. The smart contracts are provided "as is" and, while audited, carry inherent risks associated with blockchain technology.
