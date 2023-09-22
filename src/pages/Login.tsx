import { useState } from 'react'

import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { ErrorMessage } from '../components/ErrorMessage'

import { Mail, Lock, Eye, EyeOff, LogIn, RefreshCw } from 'lucide-react'

export default function Login() {
  const [hiddenPassword, setHiddenPassword] = useState(true)
  const [disableButton, setDisableButton] = useState(true)
  const loadingAuth = false

  const error = {
    // mail: 'E-mail not found.',
    // password: 'Password incorrect.',
    // generic: 'Something went wrong. Please, contact our support team.',
  }

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center bg-slate-600">
      <section className="w-10/12 max-w-lg p-12 rounded-xl bg-white shadow-xl shadow-slate-700">
        <form className="flex flex-col gap-6 items-center">
          <div className="w-full relative">
            <Mail size={22} className="absolute h-12 left-4 text-slate-300" />
            <Input
              name="email"
              type="email"
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
              placeholder="Password"
              hasIcon={true}
            />
            <a
              className="absolute cursor-pointer h-full px-4 top-0 right-0 flex flex-col justify-center"
              title="Show password"
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
            <Button hasIcon={true} disabled={disableButton || loadingAuth}>
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
