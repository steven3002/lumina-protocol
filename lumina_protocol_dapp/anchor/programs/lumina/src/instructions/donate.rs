use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Campaign, SponsorRecord};
use crate::errors::LuminaError;

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"campaign", campaign.student.as_ref()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        init_if_needed,
        payer = sponsor,
        space = SponsorRecord::LEN,
        seeds = [b"sponsor", campaign.key().as_ref(), sponsor.key().as_ref()],
        bump
    )]
    pub sponsor_record: Account<'info, SponsorRecord>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Donate>, amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let sponsor_record = &mut ctx.accounts.sponsor_record;

    // Transfer SOL from Sponsor to Campaign PDA Vault
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.key(),
        system_program::Transfer {
            from: ctx.accounts.sponsor.to_account_info(),
            to: campaign.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    // Update Campaign Global State
    campaign.total_raised = campaign.total_raised.checked_add(amount).ok_or(LuminaError::MathOverflow)?;

    // Initialize or Update Sponsor Record
    if sponsor_record.amount_donated == 0 {
        sponsor_record.campaign = campaign.key();
        sponsor_record.sponsor = ctx.accounts.sponsor.key();
        sponsor_record.last_voted_milestone = -1; // Allows voting on milestone index 0
        sponsor_record.bump = ctx.bumps.sponsor_record;
    }
    sponsor_record.amount_donated = sponsor_record.amount_donated.checked_add(amount).ok_or(LuminaError::MathOverflow)?;

    Ok(())
}