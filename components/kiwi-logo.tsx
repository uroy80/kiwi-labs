import { Leaf } from "lucide-react"

interface KiwiLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  withText?: boolean
  className?: string
}

export function KiwiLogo({ size = "md", withText = true, className = "" }: KiwiLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-secondary/30 rounded-full blur-sm group-hover:blur-md transition-all"></div>
        <div
          className={`relative bg-gradient-to-br from-primary to-secondary text-white p-1.5 rounded-full ${
            sizeClasses[size]
          } transform transition-transform group-hover:scale-110 duration-300`}
          style={{
            boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Leaf className="w-full h-full" />
        </div>
      </div>
      {withText && (
        <span
          className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}
          style={{
            textShadow: "0 1px 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          Kiwi Labs
        </span>
      )}
    </div>
  )
}
