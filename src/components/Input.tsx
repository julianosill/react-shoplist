import { ComponentProps } from 'react'

export type InputProps = ComponentProps<'input'> & {
  hasIcon?: boolean
}

export function Input({ hasIcon = false, ...props }: InputProps) {
  const activeClasses = `focus:bg-slate-50 outline-1 outline-teal-500`
  return (
    <input
      className={`w-full h-12 border-2 border-slate-200 rounded-md text-slate-800 bg-slate-100 hover:bg-slate-50 ${activeClasses} ${
        hasIcon ? 'pl-12 pr-4' : 'px-4'
      }`}
      {...props}
    />
  )
}
