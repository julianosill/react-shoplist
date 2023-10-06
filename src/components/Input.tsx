import React, { ReactNode } from 'react'
import { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  icon?: () => ReactNode
}

function ForwardInput(
  { icon, ...props }: InputProps,
  ref: React.LegacyRef<HTMLInputElement> | undefined
) {
  return (
    <label htmlFor={props.id} className="w-full relative flex items-center">
      {icon && <span className="absolute left-4 text-slate-300">{icon()}</span>}
      <input
        ref={ref}
        className={`w-full h-12 border-2 border-slate-200 rounded-md text-slate-800 bg-slate-100 hover:bg-slate-50 outline-1 outline-teal-500 ${
          icon ? 'pl-12 pr-4' : 'px-4'
        }`}
        {...props}
      />
    </label>
  )
}

const Input = React.forwardRef(ForwardInput)

export default Input
