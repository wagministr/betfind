import { useState } from "react"
import { supabase } from "@/utils/supabase"

export default function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    
    if (error) {
      setError(error.message)
      return
    }
    
    setSent(true)
  }

  const verifyOtp = async () => {
    if (!otp) {
      setError('Please enter the verification code')
      return
    }
    
    setError(null)
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink", // or "email" for code
    })
    setLoading(false)
    
    if (error) {
      setError(error.message)
      return
    }
    
    onSuccess()
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {!sent ? (
        <>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Enter your email</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
            placeholder="you@email.com"
          />
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Get verification code"}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Check your email</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            We've sent a verification code to {email}
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
            placeholder="Enter verification code"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            onClick={() => setSent(false)}
            className="w-full mt-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  )
} 