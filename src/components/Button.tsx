import { ComponentProps } from 'react'

export type ButtonProps = ComponentProps<'button'> & {
  width?: string
  hasIcon?: boolean
}

export function Button({
  width = 'w-fit',
  hasIcon = false,
  ...props
}: ButtonProps) {
  const disabledClasses = 'disabled:opacity-50 disabled:hover:bg-teal-500'
  const iconClasses = 'flex items-center gap-3'
  return (
    <button
      className={`${width} h-12 px-12 rounded-md bg-teal-500 text-white hover:bg-teal-600 focus:outline-teal-500 outline-offset-4 transition ease-in-out ${disabledClasses} ${
        hasIcon && iconClasses
      }`}
      {...props}
    />
  )
}
