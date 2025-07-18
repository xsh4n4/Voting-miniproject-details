'use client'

import { getVotingProgram, getVotingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import * as anchor from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface PollArgs {
  pollId: number;
  pollDescription: string;
  startTime: number;
  endTime: number;
  mint: string;
}

interface CandidateArgs {
  candidateName: string;
  pollId: number;
  party: string;
  candidateImage: string;
  symbolImage: string;
}

interface VoteArgs {
  candidateName: string;
  pollId: number;
  mint: string;
}

export function useVotingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVotingProgram(provider, programId), [provider, programId])

  const pollAccounts = useQuery({
    queryKey: ['poll', 'all', { cluster }],
    queryFn: () => program.account.poll.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializePoll = useMutation<string, Error, PollArgs>({
    mutationKey: ['voting', 'initializePoll', { cluster }],
    mutationFn: ({ pollId, pollDescription, startTime, endTime, mint }) => program.methods.initializePoll(new anchor.BN(pollId), pollDescription, new anchor.BN(startTime), new anchor.BN(endTime), new PublicKey(mint)).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return pollAccounts.refetch()
    },
    onError: () => toast.error('Failed to initialize poll account'),
  })

  const initializeCandidate = useMutation<string, Error, CandidateArgs>({
    mutationKey: ['voting', 'initializeCandidate', { cluster }],
    mutationFn: ({ candidateName, pollId, party, candidateImage, symbolImage }) => program.methods.initializeCandidate(candidateName, new anchor.BN(pollId), party, candidateImage, symbolImage).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: () => toast.error('Failed to initialize candidate account'),
  })

  const voteMutation = useMutation<string, Error, VoteArgs>({
    mutationKey: ['voting', 'vote', { cluster }],
    mutationFn: ({ candidateName, pollId, mint }) => program.methods.vote(candidateName, new anchor.BN(pollId)).accounts({ tokenProgram: TOKEN_PROGRAM_ID, mint: new PublicKey(mint) }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: () => toast.error('Failed to vote'),
  })

  return {
    program,
    programId,
    pollAccounts,
    getProgramAccount,
    initializePoll,
    initializeCandidate,
    voteMutation,
  }
}

export function usePollProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { program } = useVotingProgram()

  const pollAccountQuery = useQuery({
    queryKey: ['poll', 'fetch', { cluster, account }],
    queryFn: () => program.account.poll.fetch(account),
  })

  const candidateAccountsQuery = useQuery({
    queryKey: ['candidates', 'fetch', { cluster, account }],
    queryFn: () => program.account.candidate.all([
      {
        memcmp: {
          offset: 8,
          bytes: account.toBase58(),
        },
      },
    ]),
  })

  return {
    pollAccountQuery,
    candidateAccountsQuery,
  }
}

export function useCandidateProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { program } = useVotingProgram()

  const candidateAccountQuery = useQuery({
    queryKey: ['candidate', 'fetch', { cluster, account }],
    queryFn: () => program.account.candidate.fetch(account),
  })

  return {
    candidateAccountQuery,
  }
}

export function useTopCandidatesForPoll({
  candidates,
  limit = 3,
}: {
  candidates: any[] | undefined
  limit?: number
}) {
  return useMemo(() => {
    if (!candidates) return []

    return [...candidates]
      .sort((a, b) => b.account.candidateVotes - a.account.candidateVotes)
      .slice(0, limit)
  }, [candidates, limit])
}

export function useGetPollAddressById(pollId: number): PublicKey {

  const { programId } = useVotingProgram()

  const [pollAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from("poll"), new anchor.BN(pollId).toArrayLike(Buffer, "le", 8)],
    programId
  );
  return pollAddress

}