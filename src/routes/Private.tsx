import { ReactNode, useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/auth'

type PrivateProps = {
  children: ReactNode
}

export default function Private({ children }: PrivateProps) {
  const { signed, loadingUser } = useContext(AuthContext)

  if (loadingUser) {
    return <div></div>
  }

  if (!signed) {
    return <Navigate to="/" />
  }

  return children
}
