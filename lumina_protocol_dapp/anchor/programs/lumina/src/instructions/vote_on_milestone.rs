use anchor_lang::prelude::*;
use crate::state::{Campaign, Milestone, MilestoneStatus, SponsorRecord};
use crate::errors::LuminaError;

#[derive(Accounts)]
pub struct VoteOnMilestone<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,
    
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"sponsor", campaign.key().as_ref(), sponsor.key().as_ref()],
        bump = sponsor_record.bump,
        constraint = sponsor_record.sponsor == sponsor.key()
    )]
    pub sponsor_record: Account<'info, SponsorRecord>,
    
    #[account(
        mut,
        seeds = [b"milestone", campaign.key().as_ref(), &milestone.index.to_le_bytes()],
        bump = milestone.bump,
        constraint = milestone.status == MilestoneStatus::Voting @ LuminaError::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn handler(ctx: Context<VoteOnMilestone>) -> Result<()> {
    let sponsor_record = &mut ctx.accounts.sponsor_record;
    let milestone = &mut ctx.accounts.milestone;

    // Enforce sequential milestone voting to prevent double-voting on the same milestone
    require!(
        sponsor_record.last_voted_milestone < milestone.index as i32, 
        LuminaError::AlreadyVoted
    );

    // Cast vote weighted by their total donated amount
    milestone.votes_for = milestone.votes_for.checked_add(sponsor_record.amount_donated).ok_or(LuminaError::MathOverflow)?;
    
    // Update sponsor record
    sponsor_record.last_voted_milestone = milestone.index as i32;

    Ok(())
}