'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { WalletButton } from '../solana/solana-provider'
import { useVotingProgram } from './voting-data-access'

export default function VotingFeature() {
  const { publicKey } = useWallet()
  const { initializePoll } = useVotingProgram()

  // === Form state ===
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [mintAddress, setMintAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      initializePoll.mutateAsync({
        pollId: Math.floor(Math.random() * 1000000),
        pollDescription: description,
        startTime: new Date(startTime).getTime() / 1000, // convert to UNIX timestamp
        endTime: new Date(endTime).getTime() / 1000,
        mint: mintAddress,
      })
    } catch (err) {
      console.error('Poll creation failed:', err)
    }
  }

  return publicKey ? (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat bg-fixed text-white flex items-center justify-center font-sans animate-fadeIn">
      <div className="max-w-xl w-full p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 shadow-[0_0_20px_rgba(0,191,255,0.15)] animate-fadeInUp">
        <h1 className="text-4xl text-center text-cyan-400 mb-8 ml-6 drop-shadow-[0_0_20px_#00bfff] animate-fadeInDown">
          Admin Page
        </h1>

        <h2 className="text-2xl mb-6 text-center">Create Poll</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label htmlFor="description" className="block text-[#a0c9ff] font-medium text-sm mb-1">
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/10 text-white p-3 rounded-lg shadow-inner shadow-cyan-300/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          <div className="text-left">
            <label htmlFor="mint" className="block text-[#a0c9ff] font-medium text-sm mb-1">
              Mint Address
            </label>
            <input
              id="mint"
              type="text"
              placeholder="Enter Mint Address..."
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="w-full bg-white/10 text-white p-3 rounded-lg shadow-inner shadow-cyan-300/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 text-left">
              <label htmlFor="startTime" className="block text-[#a0c9ff] font-medium text-sm mb-1">
                Poll Start Time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg shadow-inner shadow-cyan-300/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            <div className="flex-1 text-left">
              <label htmlFor="endTime" className="block text-[#a0c9ff] font-medium text-sm mb-1">
                Poll End Time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg shadow-inner shadow-cyan-300/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div className="text-center pt-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold text-base px-6 py-2 rounded-full shadow-[0_0_15px_rgba(0,191,255,0.6)] animate-pulseGlow transition-transform hover:scale-105"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
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
