import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  streak: number
  points: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USER: User = {
  id: '1',
  name: 'User',
  email: 'user@example.com',
  streak: 0,
  points: 0,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setUser(MOCK_USER)
    setIsLoading(false)
  }, [])

  const signUp = useCallback(
    async (name: string, _email: string, _password: string) => {
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 1000))
      setUser({ ...MOCK_USER, name })
      setIsLoading(false)
    },
    []
  )

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
