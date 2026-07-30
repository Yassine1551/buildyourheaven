import { useAuth } from './context'

export function useAuthSession() {
  const { user, isLoading, signIn, signUp, signOut } = useAuth()

  return {
    session: user
      ? {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          streak: user.streak,
          points: user.points,
        }
      : null,
    isLoading,
    signIn,
    signUp,
    signOut,
  }
}
