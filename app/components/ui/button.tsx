import * as React from "react"
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 p-2 hover:bg-white/20 dark:hover:bg-black/20 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"