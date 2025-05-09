import { useState } from "react"
import { supabase } from "@/utils/supabase"
import { logUserLogin, getUserDomain } from "@/utils/userSegmentation"

export default function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userDomain, setUserDomain] = useState<string | null>(null)

  const sendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    setError(null)
    setLoading(true)
    
    // Store the domain for segmentation
    const domain = getUserDomain(email)
    setUserDomain(domain)
    console.log(`User domain detected: ${domain}`)
    
    // Request OTP code instead of magic link
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        shouldCreateUser: true,
        // Force OTP code by setting this to undefined, not null
        emailRedirectTo: undefined
      }
    })
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
      type: "email", // Use "email" for OTP code instead of "magiclink"
    })
    setLoading(false)
    
    if (error) {
      setError(error.message)
      return
    }
    
    // Log the successful login for analytics/segmentation
    if (data.user) {
      try {
        await logUserLogin(data.user.id, email)
        console.log(`Login recorded for user domain: ${userDomain}`)
      } catch (err) {
        console.error("Failed to log user login for analytics", err)
      }
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
            We've sent a 6-digit code to {email}
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
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