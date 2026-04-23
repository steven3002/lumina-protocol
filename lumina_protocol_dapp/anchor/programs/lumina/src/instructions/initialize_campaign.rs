use anchor_lang::prelude::*;
use crate::state::Campaign;

#[derive(Accounts)]
pub struct InitializeCampaign<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        init,
        payer = student,
        space = Campaign::LEN,
        seeds = [b"campaign", student.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeCampaign>, target_amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    campaign.student = ctx.accounts.student.key();
    campaign.target_amount = target_amount;
    campaign.total_raised = 0;
    campaign.milestone_count = 0;
    campaign.bump = ctx.bumps.campaign;
    
    Ok(())
}