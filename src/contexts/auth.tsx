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

type AuthContextType = {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User>>
  loadingAuth: boolean
  login: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: { email: '', password: '' },
  setUser: () => {},
  loadingAuth: false,
  login: async () => {},
})

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState({
    email: '',
    password: '',
  })
  const [loadingAuth, setLoadingAuth] = useState(false)

  async function login() {
    setLoadingAuth(true)
    await signInWithEmailAndPassword(auth, user.email, user.password)
      .then(() => {
        alert('Logged in!')
      })
      .catch((error) => alert(error.code))
      .finally(() => {
        setLoadingAuth(false)
      })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingAuth,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
