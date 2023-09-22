import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AuthContext } from '../contexts/auth'

import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { ErrorMessage } from '../components/ErrorMessage'

import { Mail, Lock, Eye, EyeOff, LogIn, RefreshCw } from 'lucide-react'
import logo from '../assets/logo.svg'

export default function Login() {
  const { user, setUser, loadingAuth, login } = useContext(AuthContext)
  const [hiddenPassword, setHiddenPassword] = useState(true)
  const [disableButton, setDisableButton] = useState(true)
  const [error, setError] = useState({
    mail: '',
    password: '',
    generic: '',
  })

  const toggleHiddenPassword = () => setHiddenPassword(!hiddenPassword)

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser({
      ...user,
      [name]: value,
    })
  }

  const checkPasswordLength = useCallback(() => {
    !user.email || user.password.length < 6
      ? setDisableButton(true)
      : setDisableButton(false)
    user.password.length > 0 && user.password.length < 6
      ? setError({
          ...error,
          password: 'Password must be more than 6 digits.',
        })
      : setError({
          ...error,
          password: '',
        })
  }, [user])

  useEffect(() => {
    checkPasswordLength()
  }, [user, checkPasswordLength])

  return (
    <main className="w-full min-h-screen py-8 flex flex-col justify-center items-center bg-slate-600">
      <section className="w-10/12 max-w-lg p-12 rounded-xl bg-white shadow-xl shadow-slate-700">
        <img src={logo} alt="SHOPLIST" className="w-56 mx-auto mb-14" />
        <form className="flex flex-col gap-6 items-center">
          <div className="w-full relative">
            <Mail size={22} className="absolute h-12 left-4 text-slate-300" />
            <Input
              name="email"
              type="email"
              value={user.email}
              onChange={handleChangeInput}
              placeholder="E-mail"
              hasIcon={true}
            />
            {error.mail && <ErrorMessage message={error.mail} />}
          </div>
          <div className="w-full relative">
            <Lock size={22} className="absolute h-12 left-4 text-slate-300" />
            <Input
              name="password"
              type={hiddenPassword ? 'password' : 'type'}
              value={user.password}
              onChange={handleChangeInput}
              placeholder="Password"
              hasIcon={true}
            />
            <a
              className="absolute cursor-pointer h-12 px-4 top-0 right-0 flex flex-col justify-center"
              title="Show password"
              onClick={toggleHiddenPassword}
            >
              {hiddenPassword ? (
                <EyeOff
                  size={22}
                  className="text-slate-400 hover:text-teal-500 transition ease-in-out"
                />
              ) : (
                <Eye size={22} className="text-teal-500" />
              )}
            </a>
            {error.password && <ErrorMessage message={error.password} />}
          </div>
          {error.generic && (
            <ErrorMessage message={error.generic} warning={true} />
          )}
          <div className="mt-4">
            <Button
              hasIcon={true}
              disabled={disableButton || loadingAuth}
              onClick={login}
            >
              {loadingAuth ? (
                <>
                  <RefreshCw size={22} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  Log in
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}
