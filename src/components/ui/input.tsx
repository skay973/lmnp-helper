import * as React from 'react'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  const isDate = type === 'date' || type === 'month'

  const input = (
    <input
      type={type}
      className={cn(
        'block h-12 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-white px-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        isDate && 'appearance-none pr-10',
        className
      )}
      ref={ref}
      {...props}
    />
  )

  if (isDate) {
    return (
      <div className="relative">
        {input}
        <CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    )
  }

  return input
})
Input.displayName = 'Input'

export { Input }
