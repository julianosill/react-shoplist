import { ComponentProps } from 'react'

export type ButtonProps = ComponentProps<'button'> &
  ComponentProps<'a'> & {
    anchor?: boolean
    width?: string
    variant?: 'default' | 'outline'
  }

const buttonVariants = {
  base: 'h-12 px-8 flex justify-center items-center gap-3 rounded-md focus:outline-slate-700 outline-offset-4 cursor-pointer',
  default: 'text-white bg-teal-500 hover:bg-teal-600',
  outline:
    'text-teal-500 border-2 border-teal-500 hover:text-slate-700 hover:border-slate-700',
  disabled: 'disabled:opacity-50',
}

export const Button = ({
  anchor = false,
  width = 'w-fit',
  variant = 'default',
  ...props
}: ButtonProps) => {
  return anchor ? (
    <a
      className={`${width} ${buttonVariants[variant]} ${buttonVariants['base']} ${buttonVariants['disabled']}`}
      {...props}
    />
  ) : (
    <button
      className={`${width} ${buttonVariants[variant]} ${buttonVariants['base']} ${buttonVariants['disabled']}`}
      {...props}
    />
  )
}
