import { AuthContext } from '@app/providers/authContext'
import {
  establishSession,
  postLogin,
  postLogout,
  postRefresh,
  postRegister,
  type AuthUser,
} from '@pages/Auth/lib/authApi'
import { clearAccessToken } from '@shared/api/tokenMemory'
import { useLayoutEffect, useState, type ReactNode } from 'react'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useLayoutEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const refreshResult = await postRefresh()

        if (!refreshResult) {
          clearAccessToken()
          if (!cancelled) {
            setUser(null)
          }
          return
        }

        const me = await establishSession(refreshResult.accessToken)
        if (!cancelled) {
          setUser(me)
        }
      } catch {
        clearAccessToken()
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const accessToken = await postLogin(email, password)
    const me = await establishSession(accessToken)
    setUser(me)
  }

  async function register(email: string, password: string): Promise<void> {
    const accessToken = await postRegister(email, password)
    const me = await establishSession(accessToken)
    setUser(me)
  }

  async function logout(): Promise<void> {
    try {
      await postLogout()
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
