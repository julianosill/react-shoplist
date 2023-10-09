import { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  width?: string
  variant?: 'default' | 'outlineDark'
  size?: 'default' | 'sm' | 'xs'
  content?: string
  iconLeft?: () => ReactNode
  iconRight?: () => ReactNode
}

const buttonVariants = {
  base: 'flex justify-center items-center rounded-md outline-offset-4 cursor-pointer',
  default: 'text-white bg-teal-500 hover:bg-teal-600 focus:outline-slate-700',
  outlineDark:
    'border border-slate-400 text-slate-400 hover:text-teal-500 hover:border-teal-500 focus:outline-teal-500',
  disabled: 'disabled:opacity-50',
}

const buttonSizes = {
  default: 'h-12 px-8 gap-3',
  sm: 'h-10 px-4 gap-2 text-sm',
  xs: 'h-7 px-2 gap-1 text-xs',
}

export const Button = ({
  children,
  width = 'w-fit',
  variant = 'default',
  size = 'default',
  content,
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${width}
        ${buttonVariants['base']}
        ${buttonVariants['disabled']}
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
      `}
      {...props}
    >
      {iconLeft && iconLeft()}
      {content ? content : children}
      {iconRight && iconRight()}
    </button>
  )
}
