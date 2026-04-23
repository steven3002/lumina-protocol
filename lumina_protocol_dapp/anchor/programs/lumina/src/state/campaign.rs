use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub student: Pubkey,
    pub target_amount: u64,
    pub total_raised: u64,
    pub milestone_count: u32,
    pub bump: u8,
}

impl Campaign {
    // Discriminator (8) + Pubkey (32) + 2x u64 (16) + u32 (4) + bump (1)
    pub const LEN: usize = 8 + Campaign::INIT_SPACE;
}