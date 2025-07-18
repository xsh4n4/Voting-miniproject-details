#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{ self, Mint, TokenAccount, TokenInterface, TransferChecked };
use anchor_lang::solana_program::pubkey;

declare_id!("DzKKZbw8of6AZJ1kMbjoN8oGEGCWbAoALbzGCbxyuxAJ");

const ADMIN: Pubkey = pubkey!("i2tZJMMTqrcYv53qdLFsouL1JQPWgKiTfZ6sRDfk7nL");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitialzePoll>,
        poll_id: u64,
        poll_description: String,
        poll_start: u64,
        poll_end: u64,
        mint_address: Pubkey,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;

        poll.poll_id = poll_id;
        poll.description = poll_description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.candidate_amount = 0;
        poll.total_votes = 0;
        poll.mint_address = mint_address;

        Ok(())
    }

    pub fn initialize_candidate(
        ctx: Context<InitialzeCandidate>,
        candidate_name: String,
        _poll_id: u64,
        party: String,
        candidate_image: String,
        symbol_image: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let poll = &mut ctx.accounts.poll;

        poll.candidate_amount += 1;
        candidate.poll = poll.key();
        candidate.candidate_name = candidate_name;
        candidate.party = party;
        candidate.candidate_image = candidate_image;
        candidate.symbol_image = symbol_image;
        candidate.candidate_votes = 0;

        Ok(())
    }

    pub fn vote(
        ctx: Context<Vote>,
        _candidate_name: String,
        _poll_id: u64,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let pollacc = &mut ctx.accounts.poll;
        let mintaddr = &ctx.accounts.mint;
        let current_time = Clock::get()?.unix_timestamp;

        if current_time >= (pollacc.poll_end as i64) {
            return Err(ErrorCode::VotingEnded.into());
        }

        if current_time < (pollacc.poll_start as i64) {
            return Err(ErrorCode::VotingNotStarted.into());
        }

        require_keys_eq!(
            pollacc.mint_address,
            mintaddr.key(),
            ErrorCode::InvalidMintAddress
        );

        let transfer_cpi_accounts = TransferChecked {
            from: ctx.accounts.user_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
    
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts);
        let decimals = ctx.accounts.mint.decimals;

        token_interface::transfer_checked(cpi_ctx, 10u64.pow(decimals as u32), decimals)?;

        candidate.candidate_votes += 1;
        pollacc.total_votes += 1;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitialzePoll<'info> {
    #[account(
        mut,
        address = ADMIN @ ErrorCode::Unauthorized,
    )]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitialzeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct Vote<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump,
        has_one = poll,
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = poll,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint, 
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>, 
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(280)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_amount: u64,
    pub total_votes: u64,
    pub mint_address: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub poll: Pubkey,
    #[max_len(32)]
    pub candidate_name: String,
    #[max_len(280)]
    pub candidate_image: String,
    pub candidate_votes: u64,
    #[max_len(32)]
    pub party: String,
    #[max_len(280)]
    pub symbol_image: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Voting has not started yet")]
    VotingNotStarted,
    #[msg("Voting has ended")]
    VotingEnded,
    #[msg("Invalid mint address")]
    InvalidMintAddress,
    #[msg("Unauthorized signer")]
    Unauthorized,
}
