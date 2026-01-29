
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@supabase/auth-helpers-react'

export default function Home() {
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [session])
  return null
}
