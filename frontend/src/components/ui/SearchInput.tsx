import { useRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  onClear?: () => void
}

export const SearchInput = ({
  value,
  onClear,
  className = '',
  ...props
}: SearchInputProps) => {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="pointer-events-none absolute left-3 text-gray-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        className={`w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 ${value ? 'pr-8' : 'pr-3'} text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onClear?.()
            ref.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
