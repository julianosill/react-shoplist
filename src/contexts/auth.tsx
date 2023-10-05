import { createContext, useState } from 'react'
import { auth } from '../services/firebaseConnection'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

type AuthProviderProps = {
  children: React.ReactNode
}

type User = {
  email: string
  password: string
}

type LocalUser = {
  uid: string
  email: string | null
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
  logout: () => Promise<void>
  loadingAuth: boolean
  authError: AuthError
  setAuthError: React.Dispatch<React.SetStateAction<AuthError>>
}

export const AuthContext = createContext<AuthContextType>({
  user: { email: '', password: '' },
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  loadingAuth: false,
  authError: {},
  setAuthError: () => {},
})

export default function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ email: '', password: '' })
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [authError, setAuthError] = useState({})
  const navigate = useNavigate()

  async function login() {
    setLoadingAuth(true)
    setAuthError({})
    await signInWithEmailAndPassword(auth, user.email, user.password)
      .then(async (value) => {
        const userData = {
          uid: value.user.uid,
          email: value.user.email,
        }
        storageUser(userData)
        navigate('/list')
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

  async function logout() {
    await signOut(auth)
      .then(() => {
        setUser({ email: '', password: '' })
        localStorage.removeItem('@shoplist')
      })
      .catch((error) => console.log(error))
  }

  const storageUser = (user: LocalUser) => {
    localStorage.setItem('@shoplist', JSON.stringify(user))
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
