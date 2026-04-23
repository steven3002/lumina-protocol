use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MilestoneStatus {
    Pending,
    Voting,
    Claimed,
}

#[account]
#[derive(InitSpace)]
pub struct Milestone {
    pub campaign: Pubkey,
    pub index: u32,
    pub amount_allocated: u64,
    pub status: MilestoneStatus,

    #[max_len(300)]
    pub doc_url: String, 
    pub doc_hash: [u8; 32],
    pub votes_for: u64,
    pub bump: u8,
}

impl Milestone {
    // Max URL length set to 128 chars for sizing predictability
    // 8 (Disc) + 32 (Pubkey) + 4 (u32) + 8 (u64) + 1 (Enum) + (4 + 128) (String) + 32 (Hash) + 8 (u64) + 1 (bump)
    pub const LEN: usize = 8 + Milestone::INIT_SPACE; // Adjusted for InitSpace and max URL length
}