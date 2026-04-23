# Security Policy for Lumina Protocol

Security is the highest priority for the Lumina Protocol. Because our smart contracts manage escrowed funds and handle decentralized voting, we take every precaution to ensure the safety of our users' assets and data. 

We welcome and highly appreciate the efforts of security researchers, white-hat hackers, and the broader community in helping us maintain the integrity of our platform.

## Supported Versions

Currently, only the `main` branch will be  deployed to the Solana Mainnet-Beta is officially supported for security updates. 

| Version / Branch | Supported          | Network Target |
| ---------------- | ------------------ | -------------- |
| `main`           | :white_check_mark: | Mainnet-Beta   |
| `devnet`         | :x:                | Devnet         |
| `< 1.0.0`        | :x:                | Deprecated     |

*Note: Vulnerabilities found in the `devnet` branch are appreciated but may not be prioritized unless they also affect the `main` branch.*

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue to report a security vulnerability. Public disclosure before a fix is implemented puts user funds and data at risk.

Please report any suspected vulnerabilities privately via email to:
📧 **security@luminaprotocol.example.com**

### What to Include in Your Report
To help us resolve the issue as quickly as possible, please include the following in your email:
* **Description:** A clear description of the vulnerability and its potential impact.
* **Location:** The exact file, line number, or smart contract instruction where the vulnerability exists.
* **Proof of Concept (PoC):** Step-by-step instructions, a script (e.g., Anchor test/TypeScript), or a local environment setup to reproduce the issue.
* **Suggested Fix:** (Optional) If you have a recommendation for how to patch the vulnerability.

### Response Timeline
* We aim to acknowledge receipt of your vulnerability report within **48 hours**.
* We will provide a status update on our investigation within **5 business days**.
* If the vulnerability is confirmed, we will coordinate with you on a timeline for the fix and public disclosure.

## Scope

### In Scope (High Priority)
* **Anchor Smart Contracts (`/programs/lumina_core`):**
    * Unauthorized fund extraction or drainage of PDA vaults.
    * Bypassing the sponsor consensus voting mechanism.
    * Manipulation of voting weights or double-voting exploits.
    * Sybil attacks bypassing the flagging stake requirements.
    * Logic errors resulting in permanent freezing of funds.
* **Next.js Frontend & API (`/app`):**
    * Severe vulnerabilities exposing user data or private keys (if applicable).
    * Exploits that allow unauthorized mutation of PostgreSQL indexer data (e.g., SQL Injection, broken authentication on API routes).

### Out of Scope
* Vulnerabilities in third-party libraries or dependencies (unless a patch is available and we have failed to update).
* Issues related to the Solana network consensus or validators.
* Denial of Service (DoS) attacks requiring massive external resources.
* Social engineering or phishing attacks against Lumina Protocol staff or users.
* Issues requiring physical access to a user's device.
* Clickjacking or missing security headers that do not lead to a direct exploit.

## Bug Bounty Program

*(Note: Update this section when a formal bug bounty platform is established)*

Lumina Protocol does not currently operate a public bug bounty program on platforms like Immunefi or HackerOne. However, we believe in rewarding security researchers for their hard work. 

Critical vulnerabilities reported responsibly that prevent the loss of user funds will be evaluated for a discretionary bounty paid in USDC or SOL, commensurate with the severity of the threat prevented.

## Audits

We are committed to continuous security evaluation. 
* **Status:** The current smart contracts are undergoing internal review and testnet deployment. 
* **Mainnet Launch:** The `lumina_core` program will not be deployed to Mainnet-Beta until a comprehensive audit has been completed by an independent Web3 security firm. All future audit reports will be published in an `/audits` directory in this repository.

## Safe Harbor

We will not initiate legal action or law enforcement investigation against you if you:
* Comply with this policy and make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services.
* Give us a reasonable amount of time to correct the issue before making any information public.
* Do not exploit a vulnerability further than necessary to prove its existence (e.g., do not actually drain funds from the mainnet protocol).

Thank you for helping keep Lumina Protocol safe for everyone.
