import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import { Voting } from '../target/types/voting'
import { createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'

describe('voting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const connection = provider.connection;

  const program = anchor.workspace.Voting as Program<Voting>

  const pollId = Math.floor(Math.random() * 1000000);

  let mint: PublicKey;

  async function createTokenAndMint() {
    // 1. Create Mint Account (decimals = 9 is standard)
    const mint = await createMint(
      connection,
      payer.payer,
      payer.publicKey, // mint authority
      null,            // freeze authority (null if not needed)
      9                // decimals
    );
    console.log("✅ Mint address:", mint.toBase58());

    // 2. Create associated token account for the wallet
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mint,
      payer.publicKey
    );
    console.log("✅ Token Account:", tokenAccount.address.toBase58());

    // 3. Mint tokens (e.g., 1000 * 10^9 for 9 decimals)
    await mintTo(
      connection,
      payer.payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      BigInt(1000 * 10 ** 9)
    );
    console.log("✅ Minted 1000 tokens!");

    return mint;
  }

  beforeAll(async () => {
    mint = await createTokenAndMint();
  });

  it('Initialize Poll', async () => {
    const slot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(slot);

    await program.methods
      .initializePoll(new anchor.BN(pollId), "This is a test poll", new anchor.BN(blockTime!), new anchor.BN(blockTime! + 1000), mint)
      .signers([payer.payer])
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(pollId).toBuffer("le", 8)],
      program.programId
    );

    const pollInfo = await program.account.poll.fetch(pollAddress);
    console.log(pollInfo);

    expect(pollInfo.description).toEqual("This is a test poll");

  })

  it('Initialize candidate', async () => {
    await program.methods
      .initializeCandidate("Farman", new anchor.BN(pollId), "RGUKT", "", "")
      .signers([payer.payer])
      .rpc()

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(pollId).toBuffer("le", 8), Buffer.from("Farman")],
      program.programId
    )

    const candidateInfo = await program.account.candidate.fetch(candidateAddress);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(pollId).toBuffer("le", 8)],
      program.programId
    );

    const pollInfo = await program.account.poll.fetch(pollAddress);
    console.log(pollInfo);

    console.log(candidateInfo);
    expect(candidateInfo.candidateName).toEqual("Farman");
    expect(candidateInfo.poll).toEqual(pollAddress);
  })

  it('Voting', async () => {
    await program.methods
      .vote("Farman", new anchor.BN(pollId))
      .accounts({
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([payer.payer])
      .rpc()

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(pollId).toBuffer("le", 8), Buffer.from("Farman")],
      program.programId
    )

    const candidateInfo = await program.account.candidate.fetch(candidateAddress);

    console.log(candidateInfo.candidateVotes.toNumber());
    expect(candidateInfo.candidateVotes.toNumber()).toEqual(1);
  })
})
