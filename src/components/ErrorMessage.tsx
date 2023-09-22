type ErrorMessage = {
  message: string
  warning?: boolean
}

export function ErrorMessage({ message, warning = false }: ErrorMessage) {
  return (
    <>
      {warning ? (
        <p className="w-full px-4 py-2 text-center border rounded-md text-sm text-red-600 border-red-200 bg-red-50">
          {message}
        </p>
      ) : (
        <p className="pl-4 mt-2 text-sm text-red-600">{message}</p>
      )}
    </>
  )
}
