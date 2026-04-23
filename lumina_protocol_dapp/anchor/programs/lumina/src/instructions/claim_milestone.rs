use anchor_lang::prelude::*;
use crate::state::{Campaign, Milestone, MilestoneStatus};
use crate::errors::LuminaError;

#[derive(Accounts)]
pub struct ClaimMilestone<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        mut,
        has_one = student,
        seeds = [b"campaign", student.key().as_ref()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"milestone", campaign.key().as_ref(), &milestone.index.to_le_bytes()],
        bump = milestone.bump,
        constraint = milestone.status == MilestoneStatus::Voting @ LuminaError::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn handler(ctx: Context<ClaimMilestone>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let milestone = &mut ctx.accounts.milestone;

    // 1. Verify Quorum (> 50% of total raised)
    let quorum_threshold = campaign.total_raised / 2;
    require!(milestone.votes_for > quorum_threshold, LuminaError::QuorumNotReached);

    // 2. CheckVault Funds
    let amount_to_claim = milestone.amount_allocated;
    require!(campaign.to_account_info().lamports() >= amount_to_claim, LuminaError::InsufficientVaultFunds);

    // 3. Mark as claimed
    milestone.status = MilestoneStatus::Claimed;

    // 4. Transfer SOL safely from PDA to Student without needing CPI
    **campaign.to_account_info().try_borrow_mut_lamports()? = campaign
        .to_account_info()
        .lamports()
        .checked_sub(amount_to_claim)
        .ok_or(LuminaError::MathOverflow)?;
        
    **ctx.accounts.student.to_account_info().try_borrow_mut_lamports()? = ctx
        .accounts.student
        .to_account_info()
        .lamports()
        .checked_add(amount_to_claim)
        .ok_or(LuminaError::MathOverflow)?;

    Ok(())
}