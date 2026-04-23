use anchor_lang::prelude::*;
use crate::state::{Campaign, Milestone, MilestoneStatus};
use crate::errors::LuminaError;

#[derive(Accounts)]
pub struct SubmitMilestoneProof<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        mut,
        has_one = student,
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"milestone", campaign.key().as_ref(), &milestone.index.to_le_bytes()],
        bump = milestone.bump,
        constraint = milestone.status == MilestoneStatus::Pending @ LuminaError::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn handler(ctx: Context<SubmitMilestoneProof>, doc_url: String, doc_hash: [u8; 32]) -> Result<()> {
    require!(doc_url.len() <= 128, LuminaError::UrlTooLong);

    let milestone = &mut ctx.accounts.milestone;
    
    milestone.doc_url = doc_url;
    milestone.doc_hash = doc_hash;
    milestone.status = MilestoneStatus::Voting;

    Ok(())
}