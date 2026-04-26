use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Du5PVgf8KWZXSXFUsb9akbudaS7TgMHVr9JJ9TX4fMio");

#[program]
pub mod lumina_protocol {
    use super::*;

    pub fn initialize_campaign(ctx: Context<InitializeCampaign>, target_amount: u64, metadata_json: String) -> Result<()> {
        instructions::initialize_campaign::handler(ctx, target_amount, metadata_json)
    }

    pub fn initialize_milestone(ctx: Context<InitializeMilestone>, amount_allocated: u64) -> Result<()> {
        instructions::initialize_milestone::handler(ctx, amount_allocated)
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        instructions::donate::handler(ctx, amount)
    }

    pub fn submit_milestone_proof(ctx: Context<SubmitMilestoneProof>, doc_url: String, doc_hash: [u8; 32]) -> Result<()> {
        instructions::submit_milestone_proof::handler(ctx, doc_url, doc_hash)
    }

    pub fn vote_on_milestone(ctx: Context<VoteOnMilestone>) -> Result<()> {
        instructions::vote_on_milestone::handler(ctx)
    }

    pub fn claim_milestone(ctx: Context<ClaimMilestone>) -> Result<()> {
        instructions::claim_milestone::handler(ctx)
    }
}