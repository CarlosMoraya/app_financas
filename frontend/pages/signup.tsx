
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Signup() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSignup} className="bg-surface p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Criar Conta</h1>
        {error && <p className="text-error mb-2">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-secondary rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary mb-1">Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-secondary rounded" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </button>
      </form>
    </div>
  )
}
