
import type { AppProps } from 'next/app'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())
  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
