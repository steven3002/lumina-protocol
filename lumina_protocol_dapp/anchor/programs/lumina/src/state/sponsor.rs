use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SponsorRecord {
    pub campaign: Pubkey,
    pub sponsor: Pubkey,
    pub amount_donated: u64,
    pub last_voted_milestone: i32, 
    pub bump: u8,
}

impl SponsorRecord {
    // 8 (Disc) + 32 (Pubkey) + 32 (Pubkey) + 8 (u64) + 4 (i32) + 1 (bump)
    pub const LEN: usize = 8 + SponsorRecord::INIT_SPACE;
}