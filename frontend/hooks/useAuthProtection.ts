import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

export function useAuthProtection() {
    const session = useSession()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Check local storage for preview mode
            const isPreview = localStorage.getItem('preview_mode') === 'true'

            // 2. Check current session directly (sometimes useSession is slow to update)
            const { data: { session: currentSession } } = await supabase.auth.getSession()

            const hasSession = !!session || !!currentSession

            // 3. Decide access
            if (isPreview || hasSession) {
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
                router.push('/login')
            }

            setLoading(false)
        }

        checkAuth()
    }, [session, router, supabase])

    return { loading, isAuthenticated, session }
}
