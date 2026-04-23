use anchor_lang::prelude::*;

#[error_code]
pub enum LuminaError {
    #[msg("Math operation overflowed.")]
    MathOverflow,
    #[msg("Invalid milestone status for this operation.")]
    InvalidMilestoneStatus,
    #[msg("Sponsor has already voted on this milestone or a previous one is pending.")]
    AlreadyVoted,
    #[msg("Quorum of 50% approval has not been reached.")]
    QuorumNotReached,
    #[msg("Document URL exceeds the maximum allowed length of 128 characters.")]
    UrlTooLong,
    #[msg("Campaign does not have enough funds for this milestone.")]
    InsufficientVaultFunds,
}