import { createContext, useState } from 'react'
import { auth } from '../services/firebaseConnection'
import { signInWithEmailAndPassword } from 'firebase/auth'

type AuthProviderProps = {
  children: React.ReactNode
}

type User = {
  email: string
  password: string
}

type AuthError = {
  email?: string
  password?: string
  general?: string
}

type AuthContextType = {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User>>
  login: () => Promise<void>
  loadingAuth: boolean
  authError: AuthError
  setAuthError: React.Dispatch<React.SetStateAction<AuthError>>
}

export const AuthContext = createContext<AuthContextType>({
  user: { email: '', password: '' },
  setUser: () => {},
  login: async () => {},
  loadingAuth: false,
  authError: {},
  setAuthError: () => {},
})

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState({ email: '', password: '' })
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [authError, setAuthError] = useState({})

  async function login() {
    setLoadingAuth(true)
    setAuthError({})
    await signInWithEmailAndPassword(auth, user.email, user.password)
      .then(() => {
        alert('Logged in!')
      })
      .catch((error) => handleAuthError(error.code))
      .finally(() => {
        setLoadingAuth(false)
      })
  }

  const handleAuthError = (error: string) => {
    switch (error) {
      case 'auth/invalid-email':
        setAuthError({
          email: 'Invalid e-mail. Please, insert a valid e-mail.',
        })
        break
      case 'auth/user-not-found':
        setAuthError({
          general: 'User not found.',
        })
        break
      case 'auth/wrong-password':
        setAuthError({
          password: 'Wrong password.',
        })
        break
      case 'auth/too-many-requests':
        setAuthError({
          general:
            'Access to this account has been temporarily disabled due to many failed login attempts. Please, contact our support team.',
        })
        break
      default:
        setAuthError({
          general:
            'Oops, something went wrong. Please, contact our support team.',
        })
        break
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingAuth,
        authError,
        setAuthError,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
