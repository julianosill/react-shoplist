import { ComponentProps } from 'react'

export type ButtonProps = ComponentProps<'button'> & {
  width?: string
  hasIcon?: boolean
}

export function Button({ width = 'w-fit', ...props }: ButtonProps) {
  const disabledClasses = 'disabled:opacity-50 disabled:hover:bg-teal-500'
  return (
    <button
      className={`${width} h-12 px-12 flex justify-center items-center gap-3 rounded-md bg-teal-500 text-white hover:bg-teal-600 focus:outline-teal-500 outline-offset-4 transition ease-in-out ${disabledClasses}`}
      {...props}
    />
  )
}
