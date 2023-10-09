import React, { ReactNode } from 'react'
import { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  icon?: () => ReactNode
  variant?: 'default' | 'small'
  theme?: 'light' | 'dark'
  dimension?: 'default' | 'sm'
}

const inputVariants = {
  base: 'w-full rounded-md border outline-1 outline-teal-500',
}

const inputTheme = {
  light: 'border-slate-200 text-slate-800 bg-slate-50',
  dark: 'border-slate-500 text-white bg-slate-600',
}

const inputDimension = {
  default: 'h-12',
  sm: 'h-10 text-sm',
}

function ForwardInput(
  { icon, theme = 'light', dimension = 'default', ...props }: InputProps,
  ref: React.LegacyRef<HTMLInputElement> | undefined
) {
  return (
    <label htmlFor={props.id} className="w-full relative flex items-center">
      {icon && (
        <span
          className={`
            absolute left-4
            ${theme === 'light' ? 'text-slate-300' : 'text-slate-500'}
          `}
        >
          {icon()}
        </span>
      )}
      <input
        ref={ref}
        className={`
          ${inputVariants['base']}
          ${inputDimension[dimension]}
          ${inputTheme[theme]}
          ${icon ? 'pl-12 pr-4' : 'px-4'}`}
        {...props}
      />
    </label>
  )
}

const Input = React.forwardRef(ForwardInput)

export default Input
