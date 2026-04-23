use anchor_lang::prelude::*;
use crate::state::{Campaign, Milestone, MilestoneStatus};

#[derive(Accounts)]
pub struct InitializeMilestone<'info> {
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
        init,
        payer = student,
        space = Milestone::LEN,
        seeds = [b"milestone", campaign.key().as_ref(), &campaign.milestone_count.to_le_bytes()],
        bump
    )]
    pub milestone: Account<'info, Milestone>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeMilestone>, amount_allocated: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let milestone = &mut ctx.accounts.milestone;

    milestone.campaign = campaign.key();
    milestone.index = campaign.milestone_count;
    milestone.amount_allocated = amount_allocated;
    milestone.status = MilestoneStatus::Pending;
    milestone.doc_url = String::from("");
    milestone.doc_hash = [0; 32];
    milestone.votes_for = 0;
    milestone.bump = ctx.bumps.milestone;

    campaign.milestone_count = campaign.milestone_count.checked_add(1).unwrap();

    Ok(())
}