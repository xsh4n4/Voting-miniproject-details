'use client'

import { useState } from 'react'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import { WalletButton } from '../solana/solana-provider'
import { useVotingProgram } from './voting-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ParticipateFeature() {
    const { publicKey } = useWallet()
    const { initializeCandidate } = useVotingProgram()

    const [formData, setFormData] = useState({
        candidateName: '',
        party: '',
        candidateImage: '',
        symbolImage: '',
        pollId: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: id === 'pollId' ? Number(value) : value, }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.candidateName || !formData.pollId) {
            toast.error('Candidate name and Poll ID are required')
            return
        }

        initializeCandidate.mutateAsync({
            candidateName: formData.candidateName,
            pollId: Number(formData.pollId),
            party: formData.party,
            candidateImage: formData.candidateImage,
            symbolImage: formData.symbolImage,
        })
    }

    return publicKey ? (
        <>
            <Head>
                <title>Candidate Participation</title>
            </Head>

            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
                <h1 className="text-4xl text-cyan-400 mb-8 text-center drop-shadow-md animate-fadeInDown">
                    Candidate Participation
                </h1>

                <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl p-8 opacity-0 animate-fadeInUp">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Participate as Candidate</h2>

                    <form onSubmit={handleSubmit}>
                        {[
                            { id: 'candidateName', type: 'text', label: 'Candidate Name', placeholder: 'Enter candidate name...' },
                            { id: 'party', type: 'text', label: 'Party', placeholder: 'Enter party name...' },
                            { id: 'candidateImage', type: 'text', label: 'Candidate Image URL', placeholder: 'Enter image URL...' },
                            { id: 'symbolImage', type: 'text', label: 'Party Symbol URL', placeholder: 'Enter symbol image URL...' },
                            { id: 'pollId', type: 'number', label: 'Poll ID', placeholder: 'Enter associated Poll ID...' },
                        ].map(({ id, type, label, placeholder }) => (
                            <div key={id} className="mb-5 text-left">
                                <label htmlFor={id} className="block mb-2 text-blue-200 font-medium text-sm">
                                    {label}
                                </label>
                                <input
                                    type={type}
                                    id={id}
                                    placeholder={placeholder}
                                    value={formData[id as keyof typeof formData]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
                                />
                            </div>
                        ))}

                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 animate-pulse"
                                disabled={initializeCandidate.isPending}
                            >
                                {initializeCandidate.isPending ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1.2s ease-in-out forwards;
        }

        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 1s ease-out forwards;
        }
      `}</style>
        </>
    ) : (
        <div className="max-w-4xl mx-auto">
          <div className="hero py-[64px]">
            <div className="hero-content text-center">
              <WalletButton />
            </div>
          </div>
        </div>
      )
}
