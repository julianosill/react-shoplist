import { createContext, useCallback, useEffect, useState } from 'react'
import { auth } from '../services/firebaseConnection'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
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
  signed?: boolean
  loadingUser?: boolean
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
  const [user, setUser] = useState({ email: '', password: '' })
  const [localUser, setLocalUser] = useState<LocalUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [authError, setAuthError] = useState({})
  const navigate = useNavigate()

  const loadUser = useCallback(() => {
    setLoadingUser(true)
    const storage = localStorage.getItem('@shoplist')
    if (storage) {
      const storageUser = JSON.parse(storage)
      onAuthStateChanged(auth, (user) => {
        if (user?.uid === storageUser.uid) {
          setLocalUser(storageUser)
          navigate('/list')
        } else {
          console.log('UID does not exist')
        }
      })
    }
    setLoadingUser(false)
  }, [navigate])

  async function login() {
    setLoadingAuth(true)
    setAuthError({})
    await signInWithEmailAndPassword(auth, user.email, user.password)
      .then(async (value) => {
        const userData = {
          uid: value.user.uid,
          email: value.user.email,
        }
        setLocalUser(userData)
        setStorage(userData)
        navigate('/list')
      })
      .catch((error) => handleAuthError(error.code))
      .finally(() => setLoadingAuth(false))
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
        setLocalUser(null)
        localStorage.removeItem('@shoplist')
      })
      .catch((error) => console.log(error))
  }

  const setStorage = (user: LocalUser) => {
    localStorage.setItem('@shoplist', JSON.stringify(user))
  }

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <AuthContext.Provider
      value={{
        signed: !!localUser,
        loadingUser,
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
