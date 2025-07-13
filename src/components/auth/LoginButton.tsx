'use client'

import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function LoginButton() {

  return (
    <div className="w-full">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button w-full',
            input: 'auth-input',
          },
        }}
        providers={['google']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`}
        onlyThirdPartyProviders
        view="sign_in"
      />
    </div>
  )
}
