'use client'

import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import { useVotingProgram, usePollProgramAccount, useCandidateProgramAccount, useTopCandidatesForPoll } from './voting-data-access'

export function PollList() {
  const { pollAccounts, getProgramAccount } = useVotingProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return (
    <div className="text-white p-6">
      <h3 className="text-center text-3xl mb-5 text-white/80">Live Results</h3>

      <div className='flex justify-center'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5">
          {pollAccounts.data?.map((account) => (
            <VotingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      </div>
    </div>
  )
}

function VotingCard({ account }: { account: PublicKey }) {
  const { pollAccountQuery, candidateAccountsQuery } = usePollProgramAccount({ account })

  const description = useMemo(() => pollAccountQuery.data?.description ?? '', [pollAccountQuery.data?.description])
  const id = useMemo(() => pollAccountQuery.data?.pollId?.toString() ?? '', [pollAccountQuery.data?.pollId])


  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
      const checkScreen = () => setIsMobile(window.innerWidth < 768)
      checkScreen()
      window.addEventListener('resize', checkScreen)
      return () => window.removeEventListener('resize', checkScreen)
    }, [])

    return isMobile
  }

  const isMobile = useIsMobile()

  const topCandidates = useTopCandidatesForPoll({
    candidates: candidateAccountsQuery.data,
    limit: isMobile ? 2 : 3,
  })

  return pollAccountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <a
      href={`/poll/${id}`}
      className="border border-cyan-500/20 rounded-xl p-4 text-center no-underline flex flex-col justify-start bg-black/30 shadow-md hover:shadow-cyan-400/40 transition-all"
    >
      <h2 className="text-xl my-2 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
        {description || 'Unnamed Poll'}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mt-4">
        {topCandidates.map((c, i) => (
          <CandidateCard key={i} i={i} account={c.publicKey} />
        ))}
      </div>
    </a>
  )
}

function CandidateCard({ i, account }: { i: number, account: PublicKey }) {

  const { candidateAccountQuery } = useCandidateProgramAccount({ account })

  const candidateImage = useMemo(() => candidateAccountQuery.data?.candidateImage ?? '', [candidateAccountQuery.data?.candidateImage])
  const candidateName = useMemo(() => candidateAccountQuery.data?.candidateName ?? '', [candidateAccountQuery.data?.candidateName])
  const candidateVotes = useMemo(() => candidateAccountQuery.data?.candidateVotes.toString() ?? '', [candidateAccountQuery.data?.candidateVotes])

  return candidateAccountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div
      key={i}
      className="bg-black/40 border-2 border-cyan-400 rounded-2xl p-4 w-full max-w-[160px] text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_10px_rgb(16,196,255)]"
    >
      <img
        src={candidateImage || `/candidate${i + 1}.png`}
        alt={`Candidate ${i}`}
        className="mx-auto w-20 h-20 rounded-full object-cover border-2 border-cyan-400 mt-1 mb-2"
      />
      <h4 className="text-sm text-[#b6a2a2] mb-1">{candidateName}</h4>
      <p className="text-sm text-white/80">{candidateVotes.toString()} votes</p>
    </div>
  )
}